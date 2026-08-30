export interface SubjectLookup {
  id: string;
  name: string;
}

export interface CategoryLookup {
  id: string;
  name: string;
}

export interface GradeLevelLookup {
  id: number;
  number: number;
  displayName: string;
}

export interface SchoolClassLookup {
  id: string;
  gradeLevelId: number;
  gradeNumber: number;
  section: string;
  displayName: string;
}