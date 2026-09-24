import { Injectable, isDevMode } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class YtConvertService {
  
  private readonly apiUrl = isDevMode()
    ? `http://${window.location.hostname}:3000/youtube/download` // Apunta a tu backend local en desarrollo
    : '/api/v1/media/youtube/download';
    
  constructor(private http: HttpClient) {}

  processYouTubeMedia(format: string, videoUrl: string): Observable<Blob> {
    const payload = { format, url: videoUrl };
    
    return this.http.post(this.apiUrl, payload, {
      responseType: 'blob' // Recibimos el archivo binario (MP3/MP4) para descarga directa
    }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error al procesar el archivo.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      errorMessage = `Error del servidor (${error.status}): ${error.message}`;
    }
    return throwError(() => new Error(errorMessage));
  }
}
