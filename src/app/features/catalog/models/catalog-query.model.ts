export type CatalogSort = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

export interface CatalogQuery {
  search: string;

  subject: string | null;

  grade: number | null;

  resourceType: string | null;

  sort: CatalogSort;

  page: number;

  pageSize: number;
}