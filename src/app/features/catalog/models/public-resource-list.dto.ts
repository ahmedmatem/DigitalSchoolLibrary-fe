import { ResourceType } from "../../../core/models/resource-type.model";

export interface PublicResourceListDto {
  id: string;

  title: string;

  author: string | null;

  type: ResourceType;

  subjectName: string;

  categoryName: string;

  hasCover: boolean;

  createdAtUtc: string;
}