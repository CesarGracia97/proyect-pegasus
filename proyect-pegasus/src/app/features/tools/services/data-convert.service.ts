import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AllowedConversionsResponse {
  source_extension: string;
  allowed_targets: string[];
}

@Injectable({
  providedIn: 'root'
})
export class DataConvertService {private http = inject(HttpClient);

  private readonly apiUrl = isDevMode()
    ? `http://${window.location.hostname}:8000/data`
    : '/data';

  getAllowedConversions(ext: string): Observable<AllowedConversionsResponse> {
    const params = new HttpParams().set('ext', ext);
    return this.http.get<AllowedConversionsResponse>(`${this.apiUrl}/allowed-conversions`, { params });
  }

  convertData(file: File, targetFormat: string): Observable<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_format', targetFormat);

    return this.http.post(`${this.apiUrl}/convert`, formData, {
      responseType: 'blob'
    });
  }
}
