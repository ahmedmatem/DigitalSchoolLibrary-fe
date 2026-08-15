export interface ResourceCardVm {
  id: string;

  title: string;

  author?: string;

  description?: string;

  subject: string;

  category?: string;

  resourceType: string;

  grade?: string;

  coverUrl?: string;

  isSaved?: boolean;
}