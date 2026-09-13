export enum ResourceCollectionType {
  EducationalResources = 1,
  ELibrary = 2,
}

export const RESOURCE_COLLECTION_LABELS: Readonly<
  Record<ResourceCollectionType, string>
> = {
  [ResourceCollectionType.EducationalResources]: 'Учебни ресурси',
  [ResourceCollectionType.ELibrary]: 'Е-библиотека',
};

