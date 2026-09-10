import {
  Component,
  DestroyRef,
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
import { Router } from '@angular/router';
import {
  Observable,
  forkJoin,
  of,
  switchMap,
} from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { LookupApiService } from '../../../../core/lookups/services/lookup-api.service';
import {
  CategoryLookup,
  GradeLevelLookup,
  SchoolClassLookup,
  SubjectLookup,
} from '../../../../core/lookups/models/lookup.models';
import { ResourceApiService } from '../../../../core/resources/data-access/resource-api.service';
import { CreateResourceRequest } from '../../../../core/resources/models/create-resource-request.model';
import { ResourceAudienceType } from '../../../../core/resources/models/resource-audience-type.model';
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
  selector: 'sl-add-resource',
  imports: [
    PageContainer,
    ReactiveFormsModule,
  ],
  templateUrl: './add-resource.html',
  styleUrl: './add-resource.scss',
})
export class AddResource {
  private readonly lookupApi = inject(LookupApiService);
  private readonly resourceApi = inject(ResourceApiService);
  private readonly uploadApi = inject(UploadApiService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);

  readonly resourceTypes = RESOURCE_TYPE_OPTIONS;
  readonly subjects = signal<SubjectLookup[]>([]);
  readonly categories = signal<CategoryLookup[]>([]);
  readonly gradeLevels = signal<GradeLevelLookup[]>([]);
  readonly schoolClasses = signal<SchoolClassLookup[]>([]);
  readonly loadingLookups = signal(true);
  readonly submitting = signal(false);
  readonly selectedFile = signal<File | null>(null);
  readonly selectedCover = signal<File | null>(null);
  readonly loadError = signal<string | null>(null);
  readonly submitError = signal<string | null>(null);

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
    this.loadLookups();

    this.form.controls.gradeLevelId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(gradeLevelId => this.loadSchoolClasses(gradeLevelId));

    this.form.controls.resourceType.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(type => this.configureContentValidators(type));

    this.form.controls.audience.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(audience => this.configureAudienceValidators(audience));
  }

  back(): void {
    void this.router.navigate(['/teacher']);
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
    this.selectedCover.set(input.files?.[0] ?? null);
  }

  isExternalLink(): boolean {
    return this.form.controls.resourceType.value === ResourceType.ExternalLink;
  }

  submit(): void {
    this.submitError.set(null);

    if (this.form.invalid || (!this.isExternalLink() && !this.selectedFile())) {
      this.form.markAllAsTouched();
      this.submitError.set('Проверете задължителните полета и опитайте отново.');
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
          this.resourceApi.create(
            this.buildRequest(fileUpload, coverUpload)
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toastr.success('Ресурсът е изпратен за одобрение.');
          void this.router.navigate(['/teacher']);
        },
        error: (error: unknown) => {
          this.submitting.set(false);
          this.submitError.set(this.getSubmitError(error));
        },
      });
  }

  fieldInvalid(name: keyof AddResource['form']['controls']): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  private loadLookups(): void {
    this.loadingLookups.set(true);
    this.loadError.set(null);

    forkJoin({
      subjects: this.lookupApi.getSubjects(),
      categories: this.lookupApi.getCategories(),
      gradeLevels: this.lookupApi.getGradeLevels(),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ subjects, categories, gradeLevels }) => {
          this.subjects.set(subjects);
          this.categories.set(categories);
          this.gradeLevels.set(gradeLevels);
          this.loadingLookups.set(false);
        },
        error: () => {
          this.loadingLookups.set(false);
          this.loadError.set('Списъците за формата не можаха да бъдат заредени.');
        },
      });
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
    schoolClass.setValidators(audience === 'class' ? [Validators.required] : []);

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
    fileUpload: PresignedUpload | null,
    coverUpload: PresignedUpload | null
  ): CreateResourceRequest {
    const value = this.form.getRawValue();
    const file = this.selectedFile();

    return {
      title: value.title.trim(),
      description: value.description.trim(),
      author: value.author.trim() || null,
      type: value.resourceType as ResourceType,
      isPubliclyVisible: value.publicVisibility,
      fileStorageKey: fileUpload?.storageKey ?? null,
      originalFileName: file?.name ?? null,
      fileContentType: fileUpload?.contentType ?? null,
      fileSize: file?.size ?? null,
      coverStorageKey: coverUpload?.storageKey ?? null,
      externalUrl: this.isExternalLink()
        ? value.externalUrl.trim()
        : null,
      subjectId: value.subjectId,
      categoryId: value.categoryId,
      audienceType: this.toAudienceType(value.audience),
      gradeLevelIds: value.audience === 'grade' && value.gradeLevelId != null
        ? [value.gradeLevelId]
        : [],
      schoolClassIds: value.audience === 'class' && value.schoolClassId
        ? [value.schoolClassId]
        : [],
    };
  }

  private toAudienceType(audience: AudienceSelection): ResourceAudienceType {
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
      return 'Ресурсът не беше изпратен. Моля, опитайте отново.';
    }

    const response = error.error;

    if (typeof response === 'string' && response.trim()) {
      return response;
    }

    if (response?.message) {
      return response.message;
    }

    if (response?.errors) {
      const validationMessages = Object.values(response.errors)
        .flatMap(value => Array.isArray(value) ? value : [value])
        .filter((value): value is string => typeof value === 'string');

      if (validationMessages.length > 0) {
        return validationMessages.join(' ');
      }
    }

    return 'Ресурсът не беше изпратен. Моля, опитайте отново.';
  }
}
