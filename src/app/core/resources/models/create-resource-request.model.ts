import { ResourceType } from '../../models/resource-type.model';
import { ResourceAudienceType } from './resource-audience-type.model';

export interface CreateResourceRequest {
  title: string;
  description: string;
  author: string | null;
  type: ResourceType;
  isPubliclyVisible: boolean;
  fileStorageKey: string | null;
  originalFileName: string | null;
  fileContentType: string | null;
  fileSize: number | null;
  coverStorageKey: string | null;
  externalUrl: string | null;
  subjectId: string;
  categoryId: string;
  audienceType: ResourceAudienceType;
  gradeLevelIds: number[];
  schoolClassIds: string[];
}

export interface CreateResourceResponse {
  id: string;
}
