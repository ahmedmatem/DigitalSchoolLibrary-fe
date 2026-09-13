import { ResourceType, } from '../../models/resource-type.model';
import { ResourceCollectionType } from './resource-collection-type.model';

export interface ResourceDetails {
  id: string;
  title: string;
  description: string;
  author: string | null;

  collectionType: ResourceCollectionType;

  type: ResourceType;

  subjectName: string | null;
  categoryName: string;

  audienceType: number;

  hasCover: boolean;
  requiresAuthentication: boolean;

  createdAtUtc: string;

  isSaved: boolean;

  externalUrl: string | null;
}
