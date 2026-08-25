import { Injectable } from '@angular/core'; //a
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioConverterService {
  private baseUrl = `http://${window.location.hostname}:3000`;
  private apiUrl = `${this.baseUrl}/audio/convert-to-mp3`;

  constructor(private http: HttpClient) {}

  convertAudioToZip(files: File[]): Observable<Blob> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    return this.http.post(this.apiUrl, formData, {
      responseType: 'blob'
    });
  }
}