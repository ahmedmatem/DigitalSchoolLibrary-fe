import {
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Observable,
  forkJoin,
  of,
  switchMap,
} from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AUTH_ROLES } from '../../../../core/auth/constants/auth-roles';
import { AuthStateService } from '../../../../core/auth/services/auth-state.service';
import { LookupApiService } from '../../../../core/lookups/services/lookup-api.service';
import {
  CategoryLookup,
  GradeLevelLookup,
  SchoolClassLookup,
  SubjectLookup,
} from '../../../../core/lookups/models/lookup.models';
import { ResourceApiService } from '../../../../core/resources/data-access/resource-api.service';
import { ManagementResourceDetails } from '../../../../core/resources/models/management-resource-details.model';
import { ResourceAudienceType } from '../../../../core/resources/models/resource-audience-type.model';
import { ResourceModerationStatus } from '../../../../core/resources/models/resource-moderation-status.model';
import { UpdateResourceRequest } from '../../../../core/resources/models/update-resource-request.model';
import { UploadApiService } from '../../../../core/uploads/data-access/upload-api.service';
import { PresignedUpload } from '../../../../core/uploads/models/presigned-upload.model';
import { StoredFileKind } from '../../../../core/uploads/models/stored-file-kind.model';
import {
  RESOURCE_TYPE_OPTIONS,
  ResourceType,
} from '../../../../core/models/resource-type.model';
import { PageContainer } from '../../../../layout/page-container/page-container';

type AudienceSelection = 'all' | 'grade' | 'class';

@Component({
  selector: 'sl-edit-resource',
  imports: [
    PageContainer,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-resource.html',
  styleUrl: '../add-resource/add-resource.scss',
})
export class EditResource {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authState = inject(AuthStateService);
  private readonly lookupApi = inject(LookupApiService);
  private readonly resourceApi = inject(ResourceApiService);
  private readonly uploadApi = inject(UploadApiService);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  readonly resourceTypes = RESOURCE_TYPE_OPTIONS;
  readonly resource = signal<ManagementResourceDetails | null>(null);
  readonly subjects = signal<SubjectLookup[]>([]);
  readonly categories = signal<CategoryLookup[]>([]);
  readonly gradeLevels = signal<GradeLevelLookup[]>([]);
  readonly schoolClasses = signal<SchoolClassLookup[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly selectedCover = signal<File | null>(null);
  readonly removeCoverRequested = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly submitError = signal<string | null>(null);
  readonly notFound = signal(false);

  readonly isRejected = computed(() =>
    this.resource()?.moderationStatus === ResourceModerationStatus.Rejected
  );

  readonly statusLabel = computed(() =>
    this.isRejected() ? 'Отхвърлен ресурс' : 'В изчакване'
  );

  readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200),
      ],
    }),
    author: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(200)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(4000),
      ],
    }),
    subjectId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    categoryId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    resourceType: new FormControl<ResourceType | null>(null, {
      validators: [Validators.required],
    }),
    audience: new FormControl<AudienceSelection>('all', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    gradeLevelId: new FormControl<number | null>(null),
    schoolClassId: new FormControl('', { nonNullable: true }),
    publicVisibility: new FormControl(true, { nonNullable: true }),
    externalUrl: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    this.form.controls.gradeLevelId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(id => this.loadSchoolClasses(id));

    this.form.controls.resourceType.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(type => this.configureContentValidators(type));

    this.form.controls.audience.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(audience => this.configureAudienceValidators(audience));

    this.loadPage();
  }

  back(): void {
    const id = this.resource()?.id;

    void this.router.navigate(
      id ? ['/teacher/resources', id] : ['/teacher']
    );
  }

  cancel(): void {
    this.back();
  }

  chooseMainFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile.set(input.files?.[0] ?? null);
  }

  chooseCover(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedCover.set(file);

    if (file) {
      this.removeCoverRequested.set(false);
    }
  }

  removeCover(): void {
    this.selectedCover.set(null);
    this.removeCoverRequested.set(true);
  }

  isExternalLink(): boolean {
    return this.form.controls.resourceType.value === ResourceType.ExternalLink;
  }

  submit(): void {
    const current = this.resource();
    this.submitError.set(null);

    if (!current) {
      return;
    }

    const hasMainFile = !!this.selectedFile() || !!current.fileStorageKey;

    if (
      this.form.invalid
      || (!this.isExternalLink() && !hasMainFile)
    ) {
      this.form.markAllAsTouched();
      this.submitError.set(
        'Проверете задължителните полета и опитайте отново.'
      );
      return;
    }

    this.submitting.set(true);

    const file = this.selectedFile();
    const cover = this.selectedCover();

    const fileUpload$: Observable<PresignedUpload | null> = file
      ? this.uploadApi.upload(file, StoredFileKind.Resource)
      : of(null);

    const coverUpload$: Observable<PresignedUpload | null> = cover
      ? this.uploadApi.upload(cover, StoredFileKind.Cover)
      : of(null);

    forkJoin({
      fileUpload: fileUpload$,
      coverUpload: coverUpload$,
    })
      .pipe(
        switchMap(({ fileUpload, coverUpload }) =>
          this.resourceApi.update(
            current.id,
            this.buildRequest(current, fileUpload, coverUpload)
          )
        ),
        switchMap(() =>
          this.isRejected()
            ? this.resourceApi.resubmit(current.id)
            : of(undefined)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toastr.success(
            this.isRejected()
              ? 'Ресурсът е редактиран и изпратен отново за одобрение.'
              : 'Промените са запазени.'
          );
          void this.router.navigate(['/teacher/resources', current.id]);
        },
        error: (error: unknown) => {
          this.submitting.set(false);
          this.submitError.set(this.getSubmitError(error));
        },
      });
  }

  fieldInvalid(name: keyof EditResource['form']['controls']): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  retryLoad(): void {
    this.loadPage();
  }

  private loadPage(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.loading.set(false);
      this.notFound.set(true);
      return;
    }

    this.loading.set(true);
    this.loadError.set(null);
    this.notFound.set(false);

    forkJoin({
      resource: this.resourceApi.getManagementResource(id),
      subjects: this.lookupApi.getSubjects(),
      categories: this.lookupApi.getCategories(),
      gradeLevels: this.lookupApi.getGradeLevels(),
      schoolClasses: this.lookupApi.getSchoolClasses(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: data => {
          if (
            data.resource.moderationStatus === ResourceModerationStatus.Approved
            && !this.authState.hasRole(AUTH_ROLES.Admin)
          ) {
            this.loading.set(false);
            this.loadError.set(
              'Одобрен ресурс не може да бъде редактиран от учител.'
            );
            return;
          }

          this.resource.set(data.resource);
          this.subjects.set(data.subjects);
          this.categories.set(data.categories);
          this.gradeLevels.set(data.gradeLevels);
          this.schoolClasses.set(data.schoolClasses);
          this.patchForm(data.resource, data.schoolClasses);
          this.loading.set(false);
        },
        error: (error: HttpErrorResponse) => {
          this.loading.set(false);

          if (error.status === 404) {
            this.notFound.set(true);
            return;
          }

          this.loadError.set(
            'Данните за редакция не можаха да бъдат заредени.'
          );
        },
      });
  }

  private patchForm(
    resource: ManagementResourceDetails,
    classes: SchoolClassLookup[]
  ): void {
    const audience = this.toAudienceSelection(resource.audienceType);
    const selectedClassId = resource.schoolClassIds[0] ?? '';
    const selectedClass = classes.find(item => item.id === selectedClassId);
    const gradeLevelId = audience === 'class'
      ? selectedClass?.gradeLevelId ?? null
      : resource.gradeLevelIds[0] ?? null;

    this.form.patchValue({
      title: resource.title,
      author: resource.author ?? '',
      description: resource.description,
      subjectId: resource.subjectId,
      categoryId: resource.categoryId,
      resourceType: resource.type,
      audience,
      gradeLevelId,
      schoolClassId: selectedClassId,
      publicVisibility: resource.isPubliclyVisible,
      externalUrl: resource.externalUrl ?? '',
    }, { emitEvent: false });

    this.configureContentValidators(resource.type);
    this.configureAudienceValidators(audience);

    this.schoolClasses.set(
      gradeLevelId == null
        ? []
        : classes.filter(item => item.gradeLevelId === gradeLevelId)
    );

    this.form.controls.schoolClassId.setValue(
      selectedClassId,
      { emitEvent: false }
    );
  }

  private loadSchoolClasses(gradeLevelId: number | null): void {
    this.form.controls.schoolClassId.setValue('', { emitEvent: false });
    this.schoolClasses.set([]);

    if (gradeLevelId == null) {
      return;
    }

    this.lookupApi.getSchoolClasses(gradeLevelId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: classes => this.schoolClasses.set(classes),
        error: () => this.schoolClasses.set([]),
      });
  }

  private configureContentValidators(type: ResourceType | null): void {
    const externalUrl = this.form.controls.externalUrl;

    if (type === ResourceType.ExternalLink) {
      externalUrl.setValidators([
        Validators.required,
        Validators.pattern(/^https?:\/\/.+/i),
        Validators.maxLength(2000),
      ]);
      this.selectedFile.set(null);
    } else {
      externalUrl.clearValidators();
      externalUrl.setValue('', { emitEvent: false });
    }

    externalUrl.updateValueAndValidity({ emitEvent: false });
  }

  private configureAudienceValidators(audience: AudienceSelection): void {
    const grade = this.form.controls.gradeLevelId;
    const schoolClass = this.form.controls.schoolClassId;

    grade.setValidators(audience === 'all' ? [] : [Validators.required]);
    schoolClass.setValidators(
      audience === 'class' ? [Validators.required] : []
    );

    if (audience === 'all') {
      grade.setValue(null, { emitEvent: false });
      schoolClass.setValue('', { emitEvent: false });
    } else if (audience === 'grade') {
      schoolClass.setValue('', { emitEvent: false });
    }

    grade.updateValueAndValidity({ emitEvent: false });
    schoolClass.updateValueAndValidity({ emitEvent: false });
  }

  private buildRequest(
    current: ManagementResourceDetails,
    fileUpload: PresignedUpload | null,
    coverUpload: PresignedUpload | null
  ): UpdateResourceRequest {
    const value = this.form.getRawValue();
    const file = this.selectedFile();
    const external = this.isExternalLink();

    return {
      title: value.title.trim(),
      description: value.description.trim(),
      author: value.author.trim() || null,
      type: value.resourceType as ResourceType,
      isPubliclyVisible: value.publicVisibility,
      fileStorageKey: external
        ? null
        : fileUpload?.storageKey ?? current.fileStorageKey,
      originalFileName: external
        ? null
        : file?.name ?? current.originalFileName,
      fileContentType: external
        ? null
        : fileUpload?.contentType ?? current.fileContentType,
      fileSize: external
        ? null
        : file?.size ?? current.fileSize,
      coverStorageKey: this.removeCoverRequested()
        ? null
        : coverUpload?.storageKey ?? current.coverStorageKey,
      externalUrl: external ? value.externalUrl.trim() : null,
      subjectId: value.subjectId,
      categoryId: value.categoryId,
      audienceType: this.toAudienceType(value.audience),
      gradeLevelIds:
        value.audience === 'grade' && value.gradeLevelId != null
          ? [value.gradeLevelId]
          : [],
      schoolClassIds:
        value.audience === 'class' && value.schoolClassId
          ? [value.schoolClassId]
          : [],
    };
  }

  private toAudienceSelection(
    audience: ResourceAudienceType
  ): AudienceSelection {
    switch (audience) {
      case ResourceAudienceType.GradeLevels:
        return 'grade';
      case ResourceAudienceType.SchoolClasses:
        return 'class';
      default:
        return 'all';
    }
  }

  private toAudienceType(
    audience: AudienceSelection
  ): ResourceAudienceType {
    switch (audience) {
      case 'grade':
        return ResourceAudienceType.GradeLevels;
      case 'class':
        return ResourceAudienceType.SchoolClasses;
      default:
        return ResourceAudienceType.AllStudents;
    }
  }

  private getSubmitError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Промените не бяха запазени. Моля, опитайте отново.';
    }

    const response = error.error;

    if (typeof response === 'string' && response.trim()) {
      return response;
    }

    if (response?.message) {
      return response.message;
    }

    if (response?.errors) {
      const messages = Object.values(response.errors)
        .flatMap(value => Array.isArray(value) ? value : [value])
        .filter((value): value is string => typeof value === 'string');

      if (messages.length) {
        return messages.join(' ');
      }
    }

    return 'Промените не бяха запазени. Моля, опитайте отново.';
  }
}
