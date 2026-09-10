import { ModerationResource } from './moderation-resource.model';

export interface MyResourcesResponse {
  items: ModerationResource[];

  page: number;

  pageSize: number;

  totalCount: number;

  totalPages: number;

  hasPreviousPage: boolean;

  hasNextPage: boolean;
}
