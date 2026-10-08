import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AudioConverterService } from '../../services/audio-convert.service';

interface FormatOption {
  label: string;
  extension: string;
  mime: string;
}

@Component({
  selector: 'app-audio-convert',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audio-convert.component.html',
  styleUrl: './audio-convert.component.scss'
})
export class AudioConvertComponent {
  selectedFiles: File[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  successMessage = false;
  readonly maxFiles = 10;

  detectedSourceFormat: string = '';

  readonly formats: FormatOption[] = [
    { label: 'OGG (.ogg)', extension: '.ogg', mime: 'audio/ogg' },
    { label: 'WAV (.wav)', extension: '.wav', mime: 'audio/wav' },
    { label: 'M4A (.m4a)', extension: '.m4a', mime: 'audio/m4a' },
    { label: 'AAC (.aac)', extension: '.aac', mime: 'audio/aac' },
    { label: 'WEBM (.webm)', extension: '.webm', mime: 'audio/webm' },
    { label: 'FLAC (.flac)', extension: '.flac', mime: 'audio/flac' },
  ];

  constructor(private ac_ser: AudioConverterService) {}

  get currentAccept(): string {
    return this.formats.map((f) => `${f.extension},${f.mime}`).join(',');
  }

  get summaryText(): string {
    if (this.selectedFiles.length === 0) return '';
    if (this.selectedFiles.length === 1) {
      return `${this.selectedFiles[0].name} (${this.formatFileSize(this.selectedFiles[0].size)} MB)`;
    }
    return `${this.selectedFiles.length} audios en formato ${this.detectedSourceFormat.replace('.', '').toUpperCase()}`;
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

    // 1. Filtrar por extensiones autorizadas
    const validFiles = files.filter((file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return this.formats.some((f) => f.extension === ext);
    });

    if (validFiles.length === 0) {
      this.errorMessage = 'Por favor, selecciona únicamente archivos de audio válidos (.ogg, .wav, .m4a, .aac, .webm, .flac)';
      return;
    }

    // 2. Mantener el formato actual si ya existen archivos, o usar el del primer archivo cargado
    const currentExt = this.selectedFiles.length > 0 
      ? this.detectedSourceFormat 
      : '.' + validFiles[0].name.split('.').pop()?.toLowerCase();

    const homogeneousFiles = validFiles.filter(f => '.' + f.name.split('.').pop()?.toLowerCase() === currentExt);

    if (homogeneousFiles.length !== validFiles.length) {
      this.errorMessage = `Solo se agregaron los audios con extensión ${currentExt.toUpperCase()} para mantener la homogeneidad del lote.`;
    }

    if (homogeneousFiles.length === 0) return;

    this.detectedSourceFormat = currentExt;

    // 3. Control de duplicados mediante Map (llave: nombre_tamaño)
    // Si un archivo ya existe, el nuevo lo reemplaza en la misma posición/registro
    const fileMap = new Map<string, File>();

    // Cargar existentes del mismo formato
    this.selectedFiles
      .filter(f => '.' + f.name.split('.').pop()?.toLowerCase() === currentExt)
      .forEach(f => fileMap.set(`${f.name}_${f.size}`, f));

    // Agregar/reemplazar nuevos
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

    this.ac_ser.convertAudioToZip(this.selectedFiles).subscribe({
      next: (blobData: Blob) => {
        const blob = new Blob([blobData], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audios_${this.detectedSourceFormat.replace('.', '')}_a_mp3.zip`;
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
        this.errorMessage = 'Ocurrió un error al procesar la conversión de audio en el servidor.';
      },
    });
  }

  formatFileSize(size: number): string {
    return (size / (1024 * 1024)).toFixed(2);
  }
}