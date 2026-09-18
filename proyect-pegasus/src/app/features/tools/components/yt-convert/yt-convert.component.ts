import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-yt-convert',
  imports: [CommonModule, FormsModule],
  templateUrl: './yt-convert.component.html',
  styleUrl: './yt-convert.component.scss'
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

  convertYouTube(): void {
    if (!this.selectedFormat || !this.youtubeUrl) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = false;

    // Aquí puedes integrar la llamada a tu servicio de YouTube real
    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = true;
      this.youtubeUrl = '';
      this.selectedFormat = '';
    }, 2000);
  }
}