export interface PublicResourceListDto {
  id: string;

  title: string;

  author: string | null;

  type: number;

  subjectName: string;

  categoryName: string;

  hasCover: boolean;

  createdAtUtc: string;
}