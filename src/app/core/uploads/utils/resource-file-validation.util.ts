import {
  ResourceType,
} from '../../models/resource-type.model';

export const RESOURCE_FILE_ACCEPT = [
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.txt',
  '.zip',
  '.mp4',
  '.webm',
].join(',');

const MAX_DOCUMENT_FILE_SIZE = 50 * 1024 * 1024;
const MAX_VIDEO_FILE_SIZE = 250 * 1024 * 1024;

const VIDEO_CONTENT_TYPES: Readonly<Record<string, string>> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

const ALLOWED_DOCUMENT_EXTENSIONS = new Set([
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xls',
  '.xlsx',
  '.txt',
  '.zip',
]);

export interface ResourceFileDescriptor {
  name: string;
  type: string;
  size: number;
}

export function getResourceFileValidationError(
  file: ResourceFileDescriptor,
  resourceType: ResourceType | null
): string | null {
  const extension = getExtension(file.name);
  const expectedVideoContentType = VIDEO_CONTENT_TYPES[extension];
  const isVideoFile = !!expectedVideoContentType || file.type.startsWith('video/');

  if (isVideoFile) {
    if (!expectedVideoContentType || file.type !== expectedVideoContentType) {
      return 'Видео ресурсът трябва да бъде MP4 (video/mp4) или WebM (video/webm).';
    }

    if (file.size > MAX_VIDEO_FILE_SIZE) {
      return 'Видео файлът не трябва да надвишава 250 MB.';
    }

    if (resourceType !== null && resourceType !== ResourceType.Video) {
      return 'За MP4 или WebM файл изберете тип на ресурса „Видео“.';
    }

    return null;
  }

  if (resourceType === ResourceType.Video) {
    return 'Видео ресурсът трябва да бъде MP4 (video/mp4) или WebM (video/webm).';
  }

  if (!ALLOWED_DOCUMENT_EXTENSIONS.has(extension)) {
    return 'Разрешени са PDF, Word, PowerPoint, Excel, TXT, ZIP, MP4 и WebM файлове.';
  }

  if (file.size > MAX_DOCUMENT_FILE_SIZE) {
    return 'Учебният файл не трябва да надвишава 50 MB.';
  }

  return null;
}

function getExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex < 0 ? '' : fileName.slice(dotIndex).toLowerCase();
}
