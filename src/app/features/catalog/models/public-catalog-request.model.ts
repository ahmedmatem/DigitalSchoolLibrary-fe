import { ResourceType } from "../../../core/models/resource-type.model";

export interface PublicCatalogRequest {
  search?: string;

  subjectId?: string;

  categoryId?: string;

  gradeLevelId?: number;

  schoolClassId?: string;

  type?: ResourceType;

  audienceType?: number;

  page: number;

  pageSize: number;
}