import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';

import { API_CONFIG } from '../../config/api.config';

interface PresignedUpload {
  key: string;
  uploadUrl: string;
  publicUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class UploadApiService {
  private readonly http = inject(HttpClient);

  upload(file: File): Observable<PresignedUpload> {
    return this.http.post<PresignedUpload>(
      `${API_CONFIG.baseUrl}/uploads`,
      {
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
      }
    ).pipe(
      switchMap(presigned => from(this.putFile(presigned, file)))
    );
  }

  private async putFile(
    presigned: PresignedUpload,
    file: File
  ): Promise<PresignedUpload> {
    const response = await fetch(presigned.uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error('File upload failed.');
    }

    return presigned;
  }
}
