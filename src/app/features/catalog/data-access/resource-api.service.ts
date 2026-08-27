import { Injectable, inject } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { PublicCatalogRequest } from '../models/public-catalog-request.model';

import { CatalogResponse } from '../models/catalog-response.model';

import { API_CONFIG } from '../../../core/config/api.config';

import { PresignedDownloadDto } from '../models/presigned-download.dto';
import { PublicResourceDetailsDto } from '../../resource-details/models/public-resource-details.dto';

@Injectable({
  providedIn: 'root',
})
export class ResourceApiService {

  private readonly http = inject(HttpClient);

  getPublicCatalog(request: PublicCatalogRequest): Observable<CatalogResponse> {

    let params = new HttpParams()
        .set('page', request.page)
        .set('pageSize', request.pageSize);

    if (request.search) {
      params = params.set('search', request.search);
    }

    if (request.subjectId) {
      params =  params.set('subjectId', request.subjectId);
    }

    if (request.categoryId) {
      params = params.set('categoryId', request.categoryId);
    }

    if (request.gradeLevelId !== undefined) {
      params = params.set('gradeLevelId', request.gradeLevelId);
    }

    if (request.schoolClassId) {
      params = params.set('schoolClassId', request.schoolClassId);
    }

    if (request.type !== undefined) {
      params = params.set('type', request.type);
    }

    if (request.audienceType !== undefined) {
      params = params.set('audienceType', request.audienceType);
    }

    if (request.sort !== undefined) {
      params = params.set('sort', request.sort);
    }

    return this.http
        .get<CatalogResponse>(`${API_CONFIG.baseUrl}/resources`, { params });
  }

  getPublicCover(resourceId: string): Observable<PresignedDownloadDto> {
    return this.http.get<PresignedDownloadDto>(
      `${API_CONFIG.baseUrl}/resources/${resourceId}/cover`
    );
  }

  getDownloadUrl(resourceId: string): Observable<PresignedDownloadDto> {
    return this.http.get<PresignedDownloadDto>(
      `${API_CONFIG.baseUrl}/resources/${resourceId}/download`
    );
  }

  getPublicResource(resourceId: string): Observable<PublicResourceDetailsDto> {
    return this.http.get<PublicResourceDetailsDto>(
      `${API_CONFIG.baseUrl}/resources/${resourceId}`
    );
  }
}