export interface SubjectLookupDto {
  id: string;
  name: string;
}

export interface CategoryLookupDto {
  id: string;
  name: string;
}

export interface GradeLevelLookupDto {
  id: number;
  number: number;
  displayName: string;
}

export interface SchoolClassLookupDto {
  id: string;
  gradeLevelId: number;
  gradeNumber: number;
  section: string;
  displayName: string;
}