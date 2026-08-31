import { Injectable, inject } from '@angular/core';

import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';

import { ResourceCatalogRequest } from '../models/resource-catalog-request.model';

import { ResourceCatalogResponse } from '../models/resource-catalog-response.model';

import { API_CONFIG } from '../../config/api.config';

import { PresignedDownload } from '../models/presigned-download.model';
import { ResourceDetails } from '../models/resource-details.model';
import { ResourceOpen } from '../models/resource-open.model';

@Injectable({
  providedIn: 'root',
})
export class ResourceApiService {

  private readonly http = inject(HttpClient);

  getPublicCatalog(request: ResourceCatalogRequest): Observable<ResourceCatalogResponse> {

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
        .get<ResourceCatalogResponse>(`${API_CONFIG.baseUrl}/resources`, { params });
  }

  getPublicCover(resourceId: string): Observable<PresignedDownload> {
    return this.http.get<PresignedDownload>(
      `${API_CONFIG.baseUrl}/resources/${resourceId}/cover`
    );
  }

  getOpenUrl(resourceId: string): Observable<ResourceOpen> {
    return this.http.get<ResourceOpen>(
      `${API_CONFIG.baseUrl}/resources/${resourceId}/open`
    );
  }

  getPublicResource(resourceId: string): Observable<ResourceDetails> {
    return this.http.get<ResourceDetails>(
      `${API_CONFIG.baseUrl}/resources/${resourceId}`
    );
  }
}