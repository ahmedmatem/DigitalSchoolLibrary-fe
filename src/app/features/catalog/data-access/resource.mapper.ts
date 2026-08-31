import { RESOURCE_TYPE_OPTIONS } from '../../../core/models/resource-type.model';
import { ResourceCardVm } from '../../../shared/ui/resource-card/resource-card.model';

import { ResourceListItem  } from '../../../core/resources/models/resource-list-item.model';

export function mapPublicResourceToCard(resource: ResourceListItem ): ResourceCardVm {
  return {
    id: resource.id,

    title: resource.title,

    author: resource.author ?? undefined,

    subject: resource.subjectName,

    category: resource.categoryName,

    resourceType: getResourceTypeLabel(resource.type),

    hasCover: resource.hasCover,

    isSaved: false,

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