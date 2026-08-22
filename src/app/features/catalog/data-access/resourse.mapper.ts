import { ResourceCardVm } from '../../../shared/ui/resource-card/resource-card.model';

import { PublicResourceListDto } from '../models/public-resource-list.dto';

export function mapPublicResourceToCard(
  resource: PublicResourceListDto
): ResourceCardVm {

  return {
    id: resource.id,

    title: resource.title,

    author: resource.author ?? undefined,

    subject: resource.subjectName,

    category: resource.categoryName,

    resourceType: getResourceTypeLabel(resource.type),

    isSaved: false,

    createdAt: resource.createdAtUtc,
  };
}

function getResourceTypeLabel( type: number): string {

  switch (type) {
    case 1:
      return 'PDF';

    case 2:
      return 'Презентация';

    case 3:
      return 'Работен лист';

    case 4:
      return 'Тест';

    case 5:
      return 'Видео';

    case 6:
      return 'Линк';

    case 7:
      return 'Изходен код';

    case 8:
      return 'Архив';

    default:
      return 'Друго';
  }
}