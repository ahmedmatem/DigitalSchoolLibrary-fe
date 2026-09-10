import {
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { LookupApiService } from '../../../../core/lookups/services/lookup-api.service';
import {
  CategoryLookup,
  GradeLevelLookup,
  SchoolClassLookup,
  SubjectLookup,
} from '../../../../core/lookups/models/lookup.models';
import { ResourceApiService } from '../../../../core/resources/data-access/resource-api.service';
import { SubmitPendingResourceRequest } from '../../../../core/resources/models/submit-pending-resource-request.model';
import { UploadApiService } from '../../../../core/uploads/data-access/upload-api.service';
import {
  RESOURCE_TYPE_OPTIONS,
  ResourceType,
} from '../../../../core/models/resource-type.model';
import { PageContainer } from '../../../../layout/page-container/page-container';

enum ApiResourceType {
  File = 0,
  Link = 1,
}

enum ApiResourceFormat {
  Pdf = 0,
  Video = 2,
  Doc = 4,
  Ppt = 5,
  Other = 6,
}

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
      validators: [Validators.required, Validators.maxLength(300)],
    }),
    author: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(200)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(4000)],
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
    audience: new FormControl<'all' | 'grade' | 'class'>('all', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    gradeLevelId: new FormControl<number | null>(null),
    schoolClassId: new FormControl(''),
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
      .subscribe(type => {
        this.configureContentValidators(type);
      });

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
    const upload$ = file ? this.uploadApi.upload(file) : of(null);

    upload$
      .pipe(
        switchMap(upload => this.resourceApi.submitPending(
          this.buildRequest(upload?.key ?? null)
        )),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.toastr.success('Ресурсът е изпратен за одобрение.');
          void this.router.navigate(['/teacher']);
        },
        error: () => {
          this.submitting.set(false);
          this.submitError.set(
            'Ресурсът не беше изпратен. Моля, опитайте отново.'
          );
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

  private configureAudienceValidators(
    audience: 'all' | 'grade' | 'class'
  ): void {
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

  private buildRequest(fileKey: string | null): SubmitPendingResourceRequest {
    const value = this.form.getRawValue();
    const subject = this.subjects().find(item => item.id === value.subjectId);
    const category = this.categories().find(item => item.id === value.categoryId);

    return {
      title: value.title.trim(),
      subject: subject?.name ?? '',
      author: value.author.trim() || null,
      description: value.description.trim() || null,
      type: this.isExternalLink() ? ApiResourceType.Link : ApiResourceType.File,
      format: this.toApiFormat(value.resourceType),
      language: 'bg',
      tags: category ? [category.name] : [],
      fileUrl: fileKey,
      externalUrl: this.isExternalLink()
        ? value.externalUrl.trim()
        : null,
      visibility: this.buildVisibility(value),
    };
  }

  private buildVisibility(value: ReturnType<AddResource['form']['getRawValue']>): string[] {
    if (value.publicVisibility || value.audience === 'all') {
      return ['ALL'];
    }

    if (value.audience === 'class' && value.schoolClassId) {
      const schoolClass = this.schoolClasses()
        .find(item => item.id === value.schoolClassId);
      return schoolClass ? [schoolClass.displayName] : ['ALL'];
    }

    const grade = this.gradeLevels()
      .find(item => item.id === value.gradeLevelId);
    return grade ? [String(grade.number)] : ['ALL'];
  }

  private toApiFormat(type: ResourceType | null): ApiResourceFormat {
    switch (type) {
      case ResourceType.PdfDocument:
        return ApiResourceFormat.Pdf;
      case ResourceType.Presentation:
        return ApiResourceFormat.Ppt;
      case ResourceType.Video:
        return ApiResourceFormat.Video;
      case ResourceType.Worksheet:
      case ResourceType.Test:
        return ApiResourceFormat.Doc;
      default:
        return ApiResourceFormat.Other;
    }
  }
}
