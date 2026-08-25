import { Injectable } from '@angular/core'; //a
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioConverterService {
  private apiUrl = 'http://localhost:3000/audio/convert-to-mp3';

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