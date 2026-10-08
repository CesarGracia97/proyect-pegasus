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
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './video-convert.component.html',
  styleUrl: './video-convert.component.scss'
})
export class VideoConvertComponent {
  selectedFiles: File[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  successMessage = false;
  readonly maxFiles = 10;

  detectedSourceFormat: string = '';
  targetFormat: VideoTargetFormat = 'mp4';

  readonly allowedFormats: VideoFormatOption[] = [
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

  get currentAccept(): string {
    return this.allowedFormats.map((f) => `${f.extension},${f.mime}`).join(',');
  }

  get summaryText(): string {
    if (this.selectedFiles.length === 0) return '';
    if (this.selectedFiles.length === 1) {
      return `${this.selectedFiles[0].name} (${this.formatFileSize(this.selectedFiles[0].size)} MB)`;
    }
    return `${this.selectedFiles.length} videos en formato ${this.detectedSourceFormat.replace('.', '').toUpperCase()}`;
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    if (this.isLoading) return;
    fileInput.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFiles(Array.from(input.files));
      input.value = '';
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isLoading) return;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  private processFiles(files: File[]): void {
    this.errorMessage = null;
    this.successMessage = false;

    // 1. Filtro por whitelist de extensiones permitidas
    const validFiles = files.filter((file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return this.allowedFormats.some((f) => f.extension === ext);
    });

    if (validFiles.length === 0) {
      this.errorMessage = 'Por favor, selecciona únicamente archivos de video válidos (.mp4, .mov, .webm, .avi, .mkv)';
      return;
    }

    // 2. Determinar la extensión homogénea del lote
    const currentExt = this.selectedFiles.length > 0 
      ? this.detectedSourceFormat 
      : '.' + validFiles[0].name.split('.').pop()?.toLowerCase();

    const homogeneousFiles = validFiles.filter(f => '.' + f.name.split('.').pop()?.toLowerCase() === currentExt);

    if (homogeneousFiles.length !== validFiles.length) {
      this.errorMessage = `Solo se agregaron los videos con extensión ${currentExt.toUpperCase()} para mantener la homogeneidad del lote.`;
    }

    if (homogeneousFiles.length === 0) return;

    this.detectedSourceFormat = currentExt;

    // 3. Control de duplicados mediante Map (llave única: nombre_tamaño)
    const fileMap = new Map<string, File>();

    // Cargar archivos previamente guardados del mismo formato
    this.selectedFiles
      .filter(f => '.' + f.name.split('.').pop()?.toLowerCase() === currentExt)
      .forEach(f => fileMap.set(`${f.name}_${f.size}`, f));

    // Insertar/Reemplazar archivos nuevos
    homogeneousFiles.forEach(f => fileMap.set(`${f.name}_${f.size}`, f));

    const uniqueFiles = Array.from(fileMap.values());

    // 4. Validar límite máximo de archivos
    if (uniqueFiles.length > this.maxFiles) {
      this.errorMessage = `Solo puedes subir un máximo de ${this.maxFiles} archivos por lote.`;
      this.selectedFiles = uniqueFiles.slice(0, this.maxFiles);
    } else {
      this.selectedFiles = uniqueFiles;
    }
  }

  clearFiles(event?: Event): void {
    if (event) event.stopPropagation();
    this.resetState();
  }

  resetState(): void {
    this.selectedFiles = [];
    this.detectedSourceFormat = '';
    this.errorMessage = null;
    this.successMessage = false;
  }

  convertFiles(): void {
    if (this.selectedFiles.length === 0 || !this.detectedSourceFormat) return;

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
        this.resetState();
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