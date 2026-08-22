import { ResourceCardVm } from '../../../shared/ui/resource-card/resource-card.model';

import { ResourceDto } from '../models/resource.dto';

export function mapResourceToCard(
  resource: ResourceDto
): ResourceCardVm {
  return {
    id: resource.id,

    title: resource.title,

    author: resource.author ?? undefined,

    description: resource.description ?? undefined,

    subject: resource.subject,

    category: resource.category ?? undefined,

    resourceType: resource.resourceType,

    grade: resource.grade ?? undefined,

    section: resource.section ?? null,

    coverUrl: resource.coverUrl ?? undefined,

    /*
     * Това е UI state.
     * Публичният catalog backend не е длъжен
     * да връща saved информация.
     */
    isSaved: false,

    createdAt: resource.createdAt,
  };
}