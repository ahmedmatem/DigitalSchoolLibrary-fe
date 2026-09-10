import { ResourceType } from "../../models/resource-type.model";
import { ResourceSortOption } from "../../models/resource-sort.model";
import { ResourceModerationStatus } from "./resource-moderation-status.model";

export interface ResourceCatalogRequest {
  search?: string;

  subjectId?: string;

  categoryId?: string;

  gradeLevelId?: number;

  schoolClassId?: string;

  type?: ResourceType;

  audienceType?: number;

  moderationStatus?: ResourceModerationStatus;

  sort?: ResourceSortOption;

  page: number;

  pageSize: number;
}