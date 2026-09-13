import { ResourceType } from '../../models/resource-type.model';
import { ResourceModerationStatus } from './resource-moderation-status.model';
import { ResourceCollectionType } from './resource-collection-type.model';

export interface ModerationResource {
  id: string;

  title: string;

  description: string;

  author: string | null;

  collectionType: ResourceCollectionType;

  type: ResourceType;

  subjectName: string | null;

  categoryName: string;

  audienceType: number;

  moderationStatus: ResourceModerationStatus;

  hasFile: boolean;

  hasCover: boolean;

  externalUrl: string | null;

  submittedByUserId: string;

  submittedByName: string;

  submittedAtUtc: string;

  reviewedByUserId: string | null;

  reviewedAtUtc: string | null;

  rejectionReason: string | null;
}
