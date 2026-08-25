import {
  Component,
  input,
  output,
} from '@angular/core';

import {
  SubjectLookup,
  GradeLevelLookup,
} from '../../../../core/models/lookup.models';
import { ResourceTypeOption } from '../../../../core/models/resource-type.model';

@Component({
  selector: 'sl-catalog-filters',
  templateUrl: './catalog-filters.html',
  styleUrl: './catalog-filters.scss',
})
export class CatalogFilters {
  readonly subjects = input<SubjectLookup[]>([]);

  readonly grades = input<GradeLevelLookup[]>([]);

  readonly subjectId = input<string | null>(null);

  readonly gradeLevelId = input<number | null>(null);

  readonly resourceType = input<number | null>(null);

  readonly subjectChange = output<string | null>();

  readonly gradeChange = output<number | null>();

  readonly resourceTypeChange = output<number | null>();

  readonly clear = output<void>();

  readonly resourceTypes =  input<readonly ResourceTypeOption[]>([]);

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

    this.resourceTypeChange.emit(value ? Number(value) : null);
  }
}