export interface ForMeQuery {
  search: string;

  subjectId: string | null;

  categoryId: string | null;

  gradeLevelId: number | null;

  resourceType: number | null;

  page: number;

  pageSize: number;
}