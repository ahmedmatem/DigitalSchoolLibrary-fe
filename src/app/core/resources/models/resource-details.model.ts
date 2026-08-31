import { ResourceType, } from '../../models/resource-type.model';

export interface ResourceDetails {
  id: string;
  title: string;
  description: string;
  author: string | null;

  type: ResourceType;

  subjectName: string;
  categoryName: string;

  audienceType: number;

  hasCover: boolean;
  requiresAuthentication: boolean;

  createdAtUtc: string;

  externalUrl: string | null;
}