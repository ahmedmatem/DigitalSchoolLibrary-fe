import {
  ResourceModerationStatus,
} from '../../../core/resources/models/resource-moderation-status.model';

export interface MyResourcesQuery {
  search: string;

  moderationStatus: ResourceModerationStatus | null;

  page: number;

  pageSize: number;
}