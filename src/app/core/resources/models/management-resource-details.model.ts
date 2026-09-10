import { ResourceType } from '../../models/resource-type.model';
import { ResourceAudienceType } from './resource-audience-type.model';
import { ResourceModerationStatus } from './resource-moderation-status.model';

export interface ManagementResourceDetails {
  id: string;
  title: string;
  description: string;
  author: string | null;
  type: ResourceType;

  fileStorageKey: string | null;
  originalFileName: string | null;
  fileContentType: string | null;
  fileSize: number | null;

  coverStorageKey: string | null;
  externalUrl: string | null;

  subjectId: string;
  subjectName: string;
  categoryId: string;
  categoryName: string;

  audienceType: ResourceAudienceType;
  isPubliclyVisible: boolean;
  gradeLevelIds: number[];
  schoolClassIds: string[];

  createdAtUtc: string;
  updatedAtUtc: string | null;

  moderationStatus: ResourceModerationStatus;
  submittedByUserId: string;
  submittedAtUtc: string;
  reviewedByUserId: string | null;
  reviewedAtUtc: string | null;
  rejectionReason: string | null;
}
