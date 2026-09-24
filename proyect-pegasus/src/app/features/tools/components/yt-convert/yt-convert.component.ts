import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { YtConvertService } from '../../services/yt-convert.service';

@Component({
  selector: 'app-yt-convert',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './yt-convert.component.html',
  styleUrls: ['./yt-convert.component.scss']
})
export class YtConvertComponent {
  selectedFormat: string = '';
  youtubeUrl: string = '';
  isLoading = false;
  errorMessage: string | null = null;
  successMessage = false;

  readonly formats = [
    { label: 'Audio MP3 (.mp3)', value: 'mp3' },
    { label: 'Video MP4 (.mp4)', value: 'mp4' }
  ];

  constructor(private ytConvertService: YtConvertService) {}

  convertYouTube(): void {
    this.errorMessage = null;
    this.successMessage = false;

    if (!this.selectedFormat || !this.youtubeUrl) {
      this.errorMessage = 'Por favor, selecciona un formato y añade un enlace.';
      return;
    }

    // --- FILTRO 1: Validación de formato de enlace de YouTube ---
    const cleanUrl = this.sanitizeAndValidateYouTubeUrl(this.youtubeUrl);
    if (!cleanUrl) {
      this.errorMessage = '⚠️ Enlace no válido. Ingresa un enlace correcto de YouTube.';
      return;
    }

    this.isLoading = true;
    this.youtubeUrl = cleanUrl; // Se actualiza con el link limpio

    this.ytConvertService.processYouTubeMedia(this.selectedFormat, cleanUrl).subscribe({
      next: (blob: Blob | MediaSource) => {
        this.isLoading = false;
        this.successMessage = true;

        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `youtube-media.${this.selectedFormat}`;
        link.click();
        window.URL.revokeObjectURL(downloadUrl);

        // Limpiar formulario tras éxito
        this.youtubeUrl = '';
        this.selectedFormat = '';
      },
      error: (err: { message: string; }) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Error al conectar con el servidor de conversión.';
      }
    });
  }

  private sanitizeAndValidateYouTubeUrl(url: string): string | null {
    try {
      const trimmedUrl = url.trim();
      const parsedUrl = new URL(trimmedUrl);
      let videoId = '';

      // Identificador
      if (parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname.includes('youtu.be')) {
        if (parsedUrl.hostname.includes('youtu.be')) {
          videoId = parsedUrl.pathname.slice(1);
        } else {
          videoId = parsedUrl.searchParams.get('v') || '';
        }
      }

      // Validador ID de YouTube
      if (!videoId || videoId.length !== 11) {
        return null; 
      }

      // Devuelve URL limpia
      return `https://www.youtube.com/watch?v=${videoId}`;
    } catch (e) {
      return null;
    }
  }
}