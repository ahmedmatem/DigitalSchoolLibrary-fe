import { PublicResourceListDto } from './public-resource-list.dto';

export interface CatalogResponse {
  items: PublicResourceListDto[];

  page: number;

  pageSize: number;

  totalCount: number;

  totalPages: number;

  hasPreviousPage: boolean;

  hasNextPage: boolean;
}