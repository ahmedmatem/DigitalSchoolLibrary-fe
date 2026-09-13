import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

import {
  RESOURCE_COLLECTION_LABELS,
  ResourceCollectionType,
} from '../../../core/resources/models/resource-collection-type.model';

@Component({
  selector: 'sl-resource-collection-switcher',
  templateUrl: './resource-collection-switcher.html',
  styleUrl: './resource-collection-switcher.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResourceCollectionSwitcher {
  readonly value = input.required<ResourceCollectionType>();

  readonly valueChange = output<ResourceCollectionType>();

  readonly collections = [
    ResourceCollectionType.ELibrary,
    ResourceCollectionType.EducationalResources,
  ] as const;

  readonly labels = RESOURCE_COLLECTION_LABELS;

  select(collection: ResourceCollectionType): void {
    if (collection !== this.value()) {
      this.valueChange.emit(collection);
    }
  }
}

