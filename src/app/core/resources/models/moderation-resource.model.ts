import { ResourceAudienceType } from '../../models/resource-audience-type.model';
import { ResourceModerationStatus } from '../../models/resource-moderation-status.model';
import { ResourceType } from '../../models/resource-type.model';

export interface ModerationResource {
  id: string;

  title: string;

  description: string;

  author: string | null;

  type: ResourceType;

  subjectName: string;

  categoryName: string;

  audienceType: ResourceAudienceType;

  moderationStatus: ResourceModerationStatus;

  hasFile: boolean;

  hasCover: boolean;

  externalUrl: string | null;

  submittedByUserId: string;

  submittedAtUtc: string;

  reviewedByUserId: string | null;

  reviewedAtUtc: string | null;

  rejectionReason: string | null;
}
