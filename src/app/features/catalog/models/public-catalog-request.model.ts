export interface PublicCatalogRequest {
  search?: string;

  subjectId?: string;

  categoryId?: string;

  gradeLevelId?: number;

  schoolClassId?: string;

  type?: number;

  audienceType?: number;

  page: number;

  pageSize: number;
}