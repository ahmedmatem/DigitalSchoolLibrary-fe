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
  readonly grade = input<string | null>(null);
  readonly resourceType = input<string | null>(null);

  readonly subjectChange = output<string | null>();
  readonly gradeChange = output<string | null>();
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

  readonly grades = [
    '5 клас',
    '6 клас',
    '7 клас',
    '8 клас',
    '9 клас',
    '10 клас',
    '11 клас',
    '12 клас',
  ];

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

    this.gradeChange.emit(value || null);
  }

  onResourceTypeChange(event: Event): void {
    const value =(event.target as HTMLSelectElement).value;

    this.resourceTypeChange.emit( value || null);
  }
}