import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ImageAllowedConversionsResponse {
  source_extension: string;
  allowed_targets: string[];
  recommended_quality?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ImageConvertService {
  private http = inject(HttpClient);
  
  private readonly apiUrl = isDevMode()
    ? `http://${window.location.hostname}:3000/image`
    : '/api/v1/media/image';

  getAllowedConversions(ext: string): Observable<ImageAllowedConversionsResponse> {
    const cleanExt = ext.toLowerCase().replace('.', '');
    const params = new HttpParams().set('ext', cleanExt);
    return this.http.get<ImageAllowedConversionsResponse>(
      `${this.apiUrl}/allowed-conversions`,
      { params },
    );
  }

  convertImages(
    files: File[],
    target: string,
    quality: number = 80,
  ): Observable<Blob> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    formData.append('target', target.toLowerCase());
    formData.append('quality', quality.toString());

    return this.http.post(`${this.apiUrl}/convert`, formData, {
      responseType: 'blob',
    });
  }
}