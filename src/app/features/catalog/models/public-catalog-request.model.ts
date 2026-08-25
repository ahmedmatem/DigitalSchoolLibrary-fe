import { ResourceType } from "../../../core/models/resource-type.model";
import { ResourceSortOption } from "../../../core/models/resource-sort.model";

export interface PublicCatalogRequest {
  search?: string;

  subjectId?: string;

  categoryId?: string;

  gradeLevelId?: number;

  schoolClassId?: string;

  type?: ResourceType;

  audienceType?: number;

  sort?: ResourceSortOption;

  page: number;

  pageSize: number;
}