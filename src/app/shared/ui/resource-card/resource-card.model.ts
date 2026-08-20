export type ClassSection = 'а' | 'б' | 'в' | 'г';

export interface ResourceCardVm {
  id: string;

  title: string;

  author?: string;

  description?: string;

  subject: string;

  category?: string;

  resourceType: string;

  grade?: number;

  section?: ClassSection | null;

  coverUrl?: string;

  isSaved?: boolean;

  createdAt: string;
}