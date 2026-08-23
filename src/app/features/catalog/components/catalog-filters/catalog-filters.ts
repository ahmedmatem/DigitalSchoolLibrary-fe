import {
  Component,
  input,
  output,
} from '@angular/core';

import {
  SubjectLookupDto,
  GradeLevelLookupDto,
} from '../../models/lookup.models';

@Component({
  selector: 'sl-catalog-filters',
  templateUrl: './catalog-filters.html',
  styleUrl: './catalog-filters.scss',
})
export class CatalogFilters {
  readonly subjects = input<SubjectLookupDto[]>([]);

  readonly grades = input<GradeLevelLookupDto[]>([]);

  readonly subjectId = input<string | null>(null);

  readonly gradeLevelId = input<number | null>(null);

  readonly resourceType = input<string | null>(null);

  readonly subjectChange = output<string | null>();

  readonly gradeChange = output<number | null>();

  readonly resourceTypeChange = output<string | null>();

  readonly clear = output<void>();

  readonly resourceTypes = [
    'PDF',
    'PPTX',
    'DOCX',
    'Видео',
    'Линк',
  ];

  onSubjectChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.subjectChange.emit(value || null);
  }

  onGradeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.gradeChange.emit(
      value ? Number(value) : null
    );
  }

  onResourceTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;

    this.resourceTypeChange.emit(
      value || null
    );
  }
}