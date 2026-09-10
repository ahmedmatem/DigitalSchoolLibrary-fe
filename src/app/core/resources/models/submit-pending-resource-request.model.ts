export interface SubmitPendingResourceRequest {
  title: string;
  subject: string;
  author: string | null;
  description: string | null;
  type: number;
  format: number;
  language: string;
  tags: string[];
  fileUrl: string | null;
  externalUrl: string | null;
  visibility: string[];
}
