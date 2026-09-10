import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ResourceCatalogRequest } from '../models/resource-catalog-request.model';
import { ResourceCatalogResponse } from '../models/resource-catalog-response.model';
import { API_CONFIG } from '../../config/api.config';
import { PresignedDownload } from '../models/presigned-download.model';
import { ResourceDetails } from '../models/resource-details.model';
import { ResourceOpen } from '../models/resource-open.model';
import { MyResourcesResponse } from '../models/my-resources-response.model';
import { MyResourcesSummary } from '../models/my-resources-summary.model';
import { ManagementResourceDetails } from '../models/management-resource-details.model';
import {
  CreateResourceRequest,
  CreateResourceResponse,
} from '../models/create-resource-request.model';

@Injectable({
  providedIn: 'root',
})
export class ResourceApiService {
  private readonly http = inject(HttpClient);

  getPublicCatalog(request: ResourceCatalogRequest): Observable<ResourceCatalogResponse> {
    return this.http.get<ResourceCatalogResponse>(
      `${API_CONFIG.baseUrl}/resources`,
      { params: this.buildCatalogParams(request) }
    );
  }

  getForMe(request: ResourceCatalogRequest): Observable<ResourceCatalogResponse> {
    return this.http.get<ResourceCatalogResponse>(
      `${API_CONFIG.baseUrl}/resources/for-me`,
      { params: this.buildCatalogParams(request) }
    );
  }

  getMine(request: ResourceCatalogRequest): Observable<MyResourcesResponse> {
    return this.http.get<MyResourcesResponse>(
      `${API_CONFIG.baseUrl}/resources/mine`,
      { params: this.buildCatalogParams(request) }
    );
  }

  getMineSummary(): Observable<MyResourcesSummary> {
    return this.http.get<MyResourcesSummary>(
      `${API_CONFIG.baseUrl}/resources/mine/summary`
    );
  }

  getManagementResource(resourceId: string): Observable<ManagementResourceDetails> {
    return this.http.get<ManagementResourceDetails>(
      `${API_CONFIG.baseUrl}/resources/${resourceId}/manage`
    );
  }

  create(request: CreateResourceRequest): Observable<CreateResourceResponse> {
    return this.http.post<CreateResourceResponse>(
      `${API_CONFIG.baseUrl}/resources`,
      request
    );
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

  private buildCatalogParams(request: ResourceCatalogRequest): HttpParams {
    let params = new HttpParams()
      .set('page', request.page)
      .set('pageSize', request.pageSize);

    if (request.search) {
      params = params.set('search', request.search);
    }

    if (request.subjectId) {
      params = params.set('subjectId', request.subjectId);
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

    if (request.moderationStatus !== undefined) {
      params = params.set('moderationStatus', request.moderationStatus);
    }

    if (request.sort !== undefined) {
      params = params.set('sort', request.sort);
    }

    return params;
  }
}
