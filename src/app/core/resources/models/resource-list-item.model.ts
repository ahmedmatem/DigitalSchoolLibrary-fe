import { ResourceType } from "../../models/resource-type.model";
import { ResourceCollectionType } from "./resource-collection-type.model";

export interface ResourceListItem  {
  id: string;

  title: string;

  author: string | null;

  collectionType: ResourceCollectionType;

  type: ResourceType;

  subjectName: string | null;

  categoryName: string;

  hasCover: boolean;

  isSaved: boolean;

  createdAtUtc: string;
}
