import {
  Injectable,
  inject,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  Observable,
} from 'rxjs';

import {
  SubjectLookup,
  CategoryLookup,
  GradeLevelLookup,
  SchoolClassLookup,
} from '../models/lookup.models';

import {
  API_CONFIG,
} from '../../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class LookupApiService {

  private readonly http = inject(HttpClient);

  getSubjects(): Observable<SubjectLookup[]> {

    return this.http.get<SubjectLookup[]>(
      `${API_CONFIG.baseUrl}/lookups/subjects`
    );
  }

  getCategories(): Observable<CategoryLookup[]> {

    return this.http.get<CategoryLookup[]>(
      `${API_CONFIG.baseUrl}/lookups/categories`
    );
  }

  getGradeLevels(): Observable<GradeLevelLookup[]> {

    return this.http.get<GradeLevelLookup[]>(
      `${API_CONFIG.baseUrl}/lookups/grade-levels`
    );
  }

  getSchoolClasses(gradeLevelId?: number): Observable<SchoolClassLookup[]> {

    const url =`${API_CONFIG.baseUrl}/lookups/school-classes`;

    if (gradeLevelId == null) {
      return this.http.get<SchoolClassLookup[]>(url);
    }

    return this.http.get<SchoolClassLookup[]>(
      url,
      {
        params: {
          gradeLevelId,
        },
      }
    );
  }
}