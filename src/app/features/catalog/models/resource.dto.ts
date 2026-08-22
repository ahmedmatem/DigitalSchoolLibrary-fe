export interface ResourceDto {
  id: string;

  title: string;

  author?: string | null;

  description?: string | null;

  subject: string;

  category?: string | null;

  resourceType: string;

  grade?: number | null;

  section?: 'а' | 'б' | 'в' | 'г' | null;

  coverUrl?: string | null;

  createdAt: string;
}