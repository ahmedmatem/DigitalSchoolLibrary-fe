import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';

import { API_CONFIG } from '../../config/api.config';
import { PresignedUpload } from '../models/presigned-upload.model';
import { StoredFileKind } from '../models/stored-file-kind.model';

@Injectable({
  providedIn: 'root',
})
export class UploadApiService {
  private readonly http = inject(HttpClient);

  upload(
    file: File,
    kind: StoredFileKind
  ): Observable<PresignedUpload> {
    const contentType = file.type || 'application/octet-stream';

    return this.http.post<PresignedUpload>(
      `${API_CONFIG.baseUrl}/files/upload-url`,
      {
        originalFileName: file.name,
        contentType,
        fileSize: file.size,
        kind,
      }
    ).pipe(
      switchMap(presigned => from(
        this.putFile(presigned, file)
      ))
    );
  }

  private async putFile(
    presigned: PresignedUpload,
    file: File
  ): Promise<PresignedUpload> {
    const response = await fetch(presigned.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': presigned.contentType,
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error('File upload failed.');
    }

    return presigned;
  }
}
