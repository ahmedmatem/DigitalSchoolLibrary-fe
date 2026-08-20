import {
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'sl-catalog-filters',
  templateUrl: './catalog-filters.html',
  styleUrl: './catalog-filters.scss',
})
export class CatalogFilters {
  readonly subject = input<string | null>(null);
  readonly grade = input<number | null>(null);
  readonly resourceType = input<string | null>(null);

  readonly subjectChange = output<string | null>();
  readonly gradeChange = output<number | null>();
  readonly resourceTypeChange = output<string | null>();

  readonly clear = output<void>();

  readonly subjects = [
    'Математика',
    'Информатика',
    'Информационни технологии',
    'Български език',
    'Английски език',
    'История',
    'География',
    'Физика',
    'Химия',
    'Биология',
  ];

  readonly grades = [5, 6, 7, 8, 9, 10, 11, 12];

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

    this.gradeChange.emit(value ? Number(value) : null);
  }

  onResourceTypeChange(event: Event): void {
    const value =(event.target as HTMLSelectElement).value;

    this.resourceTypeChange.emit( value || null);
  }
}