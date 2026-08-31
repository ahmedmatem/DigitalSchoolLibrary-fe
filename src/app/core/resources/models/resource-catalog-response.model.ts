import { ResourceListItem  } from './resource-list-item.model';

export interface ResourceCatalogResponse {
  items: ResourceListItem [];

  page: number;

  pageSize: number;

  totalCount: number;

  totalPages: number;

  hasPreviousPage: boolean;

  hasNextPage: boolean;
}