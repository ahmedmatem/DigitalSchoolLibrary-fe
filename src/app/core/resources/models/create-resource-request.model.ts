import { ResourceType } from '../../models/resource-type.model';
import { ResourceAudienceType } from './resource-audience-type.model';
import { ResourceCollectionType } from './resource-collection-type.model';

export interface CreateResourceRequest {
  title: string;
  description: string;
  author: string | null;
  collectionType: ResourceCollectionType;
  type: ResourceType;
  isPubliclyVisible: boolean;
  fileStorageKey: string | null;
  originalFileName: string | null;
  fileContentType: string | null;
  fileSize: number | null;
  coverStorageKey: string | null;
  externalUrl: string | null;
  subjectId: string | null;
  categoryId: string;
  audienceType: ResourceAudienceType;
  gradeLevelIds: number[];
  schoolClassIds: string[];
}

export interface CreateResourceResponse {
  id: string;
}
