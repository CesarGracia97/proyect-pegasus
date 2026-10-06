import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { Observable } from 'rxjs';

export interface AllowedConversionsResponse {
  source_extension: string;
  allowed_targets: string[];
  engine: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentConvertService {
  
  private readonly apiUrl = isDevMode()
    ? `http://${window.location.hostname}:8000/documents`
    : '/documents';

  constructor(private http: HttpClient) {}
  getAllowedConversions(ext: string): Observable<AllowedConversionsResponse> {
    const params = new HttpParams().set('ext', ext);
    return this.http.get<AllowedConversionsResponse>(`${this.apiUrl}/allowed-conversions`, { params });
  }

  convertDocument(file: File, targetFormat: string): Observable<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_format', targetFormat);

    return this.http.post(`${this.apiUrl}/convert`, formData, {
      responseType: 'blob'
    });
  }
}
