import { RESOURCE_TYPE_OPTIONS } from '../../../core/models/resource-type.model';
import { ResourceCardVm } from './resource-card.model';

import { ResourceListItem  } from '../../../core/resources/models/resource-list-item.model';
import { RESOURCE_COLLECTION_LABELS } from '../../../core/resources/models/resource-collection-type.model';

export function mapResourceToCard(resource: ResourceListItem ): ResourceCardVm {
  return {
    id: resource.id,
    title: resource.title,
    author: resource.author ?? undefined,
    subject: resource.subjectName ??
      RESOURCE_COLLECTION_LABELS[resource.collectionType],
    category: resource.categoryName,
    resourceType: getResourceTypeLabel(resource.type),
    hasCover: resource.hasCover,
    isSaved: resource['isSaved'],
    createdAt: resource.createdAtUtc,
  };
}

function getResourceTypeLabel(type: number): string {
  return ( RESOURCE_TYPE_OPTIONS.find(
      option =>
        option.value === type
    )?.label ?? 'Друго'
  );
}
