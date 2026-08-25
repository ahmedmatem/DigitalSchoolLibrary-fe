export enum ResourceType {
  PdfDocument = 1,
  Presentation = 2,
  Worksheet = 3,
  Test = 4,
  Video = 5,
  ExternalLink = 6,
  SourceCode = 7,
  Archive = 8,
  Other = 9,
}

export interface ResourceTypeOption {
  value: ResourceType;
  label: string;
}

export const RESOURCE_TYPE_OPTIONS: readonly ResourceTypeOption[] = [
  { value: ResourceType.PdfDocument, label: 'PDF' },
  { value: ResourceType.Presentation, label: 'Презентация' },
  { value: ResourceType.Worksheet, label: 'Работен лист' },
  { value: ResourceType.Test, label: 'Тест' },
  { value: ResourceType.Video, label: 'Видео' },
  { value: ResourceType.ExternalLink, label: 'Линк' },
  { value: ResourceType.SourceCode, label: 'Изходен код' },
  { value: ResourceType.Archive, label: 'Архив' },
  { value: ResourceType.Other, label: 'Друго' },
];