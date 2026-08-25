import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VideoConverterService, VideoTargetFormat } from '../../services/video-convert.service';

interface VideoFormatOption {
  label: string;
  extension: string;
  mime: string;
}

@Component({
  selector: 'app-video-convert',
  imports: [CommonModule, FormsModule],
  templateUrl: './video-convert.component.html',
  styleUrl: './video-convert.component.scss'
})
export class VideoConvertComponent {selectedFiles: File[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  successMessage = false;
  readonly maxFiles = 10;

  selectedSourceFormat: string = '';
  targetFormat: VideoTargetFormat = 'mp4';

  readonly sourceFormats: VideoFormatOption[] = [
    { label: 'MP4 (.mp4)', extension: '.mp4', mime: 'video/mp4' },
    { label: 'MOV (.mov)', extension: '.mov', mime: 'video/quicktime' },
    { label: 'WEBM (.webm)', extension: '.webm', mime: 'video/webm' },
    { label: 'AVI (.avi)', extension: '.avi', mime: 'video/x-msvideo' },
    { label: 'MKV (.mkv)', extension: '.mkv', mime: 'video/x-matroska' },
  ];

  readonly targetOptions: { label: string; value: VideoTargetFormat }[] = [
    { label: 'Convertir a MP4 (.mp4)', value: 'mp4' },
    { label: 'Convertir a GIF Animado (.gif)', value: 'gif' },
    { label: 'Extraer Audio MP3 (.mp3)', value: 'mp3' },
  ];

  constructor(private vc_ser: VideoConverterService) {}

  onSourceFormatChange(): void {
    this.selectedFiles = [];
    this.errorMessage = null;
    this.successMessage = false;
  }

  get currentAccept(): string {
    if (!this.selectedSourceFormat) return '';
    const current = this.sourceFormats.find((f) => f.extension === this.selectedSourceFormat);
    return current ? `${current.extension},${current.mime}` : '';
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    if (!this.selectedSourceFormat || this.isLoading) return;
    fileInput.click();
  }

  onFileSelected(event: Event): void {
    if (!this.selectedSourceFormat) return;
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.selectedSourceFormat || this.isLoading) return;

    if (event.dataTransfer?.files) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  private processFiles(files: File[]): void {
    this.errorMessage = null;
    this.successMessage = false;
    const targetExt = this.selectedSourceFormat.toLowerCase();

    const validFiles = files.filter((file) =>
      file.name.toLowerCase().endsWith(targetExt)
    );

    if (validFiles.length === 0 || validFiles.length !== files.length) {
      this.errorMessage = `Por favor, selecciona únicamente archivos con extensión ${targetExt.toUpperCase()}`;
      return;
    }

    const totalFiles = [...this.selectedFiles, ...validFiles];

    if (totalFiles.length > this.maxFiles) {
      this.errorMessage = `Solo puedes subir un máximo de ${this.maxFiles} archivos por lote.`;
      this.selectedFiles = totalFiles.slice(0, this.maxFiles);
    } else {
      this.selectedFiles = totalFiles;
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.errorMessage = null;
  }

  clearFiles(): void {
    this.selectedFiles = [];
    this.errorMessage = null;
  }

  convertFiles(): void {
    if (this.selectedFiles.length === 0 || !this.selectedSourceFormat) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = false;

    this.vc_ser.convertVideoToZip(this.selectedFiles, this.targetFormat).subscribe({
      next: (blobData: Blob) => {
        const blob = new Blob([blobData], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `videos_${this.targetFormat}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.isLoading = false;
        this.successMessage = true;
        this.selectedFiles = [];
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
        this.errorMessage = 'Ocurrió un error al procesar la conversión de video en el servidor.';
      },
    });
  }

  formatFileSize(size: number): string {
    return (size / (1024 * 1024)).toFixed(2);
  }
}
