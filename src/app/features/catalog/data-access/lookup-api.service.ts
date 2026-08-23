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
  SubjectLookupDto,
  CategoryLookupDto,
  GradeLevelLookupDto,
  SchoolClassLookupDto,
} from '../models/lookup.models';

import {
  API_CONFIG,
} from '../../../core/config/api.config';

@Injectable({
  providedIn: 'root',
})
export class LookupApiService {

  private readonly http = inject(HttpClient);

  getSubjects(): Observable<SubjectLookupDto[]> {

    return this.http.get<SubjectLookupDto[]>(
      `${API_CONFIG.baseUrl}/lookups/subjects`
    );
  }

  getCategories(): Observable<CategoryLookupDto[]> {

    return this.http.get<CategoryLookupDto[]>(
      `${API_CONFIG.baseUrl}/lookups/categories`
    );
  }

  getGradeLevels(): Observable<GradeLevelLookupDto[]> {

    return this.http.get<GradeLevelLookupDto[]>(
      `${API_CONFIG.baseUrl}/lookups/grade-levels`
    );
  }

  getSchoolClasses(gradeLevelId?: number): Observable<SchoolClassLookupDto[]> {

    const url =`${API_CONFIG.baseUrl}/lookups/school-classes`;

    if (gradeLevelId == null) {
      return this.http.get<SchoolClassLookupDto[]>(url);
    }

    return this.http.get<SchoolClassLookupDto[]>(
      url,
      {
        params: {
          gradeLevelId,
        },
      }
    );
  }
}