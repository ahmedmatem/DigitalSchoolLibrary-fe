import { ResourceDto } from './resource.dto';

export interface CatalogResponse {
  items: ResourceDto[];

  page: number;

  pageSize: number;

  totalItems: number;

  totalPages: number;
}