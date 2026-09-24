import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type VideoTargetFormat = 'mp4' | 'gif' | 'mp3';

@Injectable({
  providedIn: 'root',
})
export class VideoConverterService {
  

  private readonly apiUrl = isDevMode()
    ? `http://${window.location.hostname}:3000/api/v1/media/video/convert`
    : '/api/v1/media/video/convert';

  constructor(private http: HttpClient) {}

  /**
   * @param files Lista de archivos File seleccionados
   * @param targetType Formato de destino ('mp4' | 'gif' | 'mp3')
   */
  convertVideoToZip(
    files: File[],
    targetType: VideoTargetFormat,
  ): Observable<Blob> {
    const formData = new FormData();

    files.forEach((file) => {
      formData.append('files', file);
    });

    const params = new HttpParams().set('target', targetType);

    return this.http.post(this.apiUrl, formData, {
      params,
      responseType: 'blob',
    });
  }
}