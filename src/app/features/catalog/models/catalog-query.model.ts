export type CatalogSort = 'newest' | 'oldest' | 'title-asc' | 'title-desc';

export interface CatalogQuery {
  search: string;

  subjectId: string | null;

  categoryId: string | null;

  gradeLevelId: number | null;

  type: number | null;

  page: number;

  pageSize: number;
}