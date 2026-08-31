import { ResourceType } from "../../models/resource-type.model";

export interface ResourceListItem  {
  id: string;

  title: string;

  author: string | null;

  type: ResourceType;

  subjectName: string;

  categoryName: string;

  hasCover: boolean;

  createdAtUtc: string;
}