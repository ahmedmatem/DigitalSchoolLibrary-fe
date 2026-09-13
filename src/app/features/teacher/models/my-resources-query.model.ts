import {
  ResourceModerationStatus,
} from '../../../core/resources/models/resource-moderation-status.model';
import { ResourceCollectionType } from '../../../core/resources/models/resource-collection-type.model';

export interface MyResourcesQuery {
  search: string;

  collectionType: ResourceCollectionType;

  moderationStatus: ResourceModerationStatus | null;

  page: number;

  pageSize: number;
}
