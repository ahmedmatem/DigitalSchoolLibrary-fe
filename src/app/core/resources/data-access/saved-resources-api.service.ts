import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';

import {
  inject,
  Injectable,
} from '@angular/core';

import { API_CONFIG } from '../../config/api.config';

import { ResourceCatalogRequest, } from '../models/resource-catalog-request.model';

import { ResourceCatalogResponse, } from '../models/resource-catalog-response.model';


@Injectable({
  providedIn: 'root',
})
export class SavedResourcesApiService {

  private readonly http =
    inject(HttpClient);


  /*
   * =========================================================
   * GET MY SAVED RESOURCES
   * =========================================================
   */

  getMine(request: ResourceCatalogRequest) {

    let params =
      new HttpParams()
        .set('page', request.page)
        .set('pageSize', request.pageSize);


    if (request.search) {
      params = params.set('search', request.search);
    }


    if (request.subjectId) {
      params =
        params.set(
          'subjectId',
          request.subjectId
        );
    }


    if (request.categoryId) {
      params =
        params.set(
          'categoryId',
          request.categoryId
        );
    }


    if ( request.gradeLevelId !== undefined) {
      params =
        params.set(
          'gradeLevelId',
          request.gradeLevelId
        );
    }


    if (request.schoolClassId) {
      params =
        params.set(
          'schoolClassId',
          request.schoolClassId
        );
    }


    if (  request.type !== undefined) {
      params =
        params.set(
          'type',
          request.type
        );
    }


    if ( request.audienceType !== undefined) {
      params =
        params.set(
          'audienceType',
          request.audienceType
        );
    }


    if (request.sort!== undefined ) {
      params =
        params.set(
          'sort',
          request.sort
        );
    }


    return this.http.get<ResourceCatalogResponse>(
        `${API_CONFIG.baseUrl}/saved-resources`, { params, }
      );
  }


  /*
   * =========================================================
   * SAVE RESOURCE
   * =========================================================
   */

  save(resourceId: string) {

    return this.http.post<void>(
        `${API_CONFIG.baseUrl}/saved-resources/${resourceId}`, null
      );
  }


  /*
   * =========================================================
   * REMOVE SAVED RESOURCE
   * =========================================================
   */

  remove(resourceId: string) {

    return this.http.delete<void>(
        `${API_CONFIG.baseUrl}/saved-resources/${resourceId}`
      );
  }
}