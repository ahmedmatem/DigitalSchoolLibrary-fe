import { Injectable, inject } from '@angular/core';

import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { API_CONFIG } from '../../../core/config/api.config';

import { CatalogQuery } from '../models/catalog-query.model';

import { CatalogResponse } from '../models/catalog-response.model';

@Injectable({
  providedIn: 'root',
})
export class ResourceApiService {

  private readonly http = inject(HttpClient);

  getCatalog(query: CatalogQuery): Observable<CatalogResponse> {

    let params = new HttpParams()
        .set('page', query.page)
        .set('pageSize', query.pageSize);

    if (query.search) {
      params = params.set('search', query.search);
    }

    if (query.subject) {
      params = params.set('subject', query.subject);
    }

    if (query.grade !== null) {
      params = params.set('grade', query.grade);
    }

    if (query.resourceType) {
      params = params.set('resourceType', query.resourceType);
    }

    params = params.set('sort', query.sort);

    /*
     * Този URL НЕ го заключваме още.
     *
     * Ще го заменим с точния endpoint от ResourceController.
     */
    return this.http.get<CatalogResponse>(
        `${API_CONFIG.baseUrl}/resources`, { params }
    );
  }
}