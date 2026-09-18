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
  imports: [CommonModule, FormsModule],
  templateUrl: './audio-convert.component.html',
  styleUrl: './audio-convert.component.scss'
})
export class AudioConvertComponent {selectedFiles: File[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  successMessage = false;
  readonly maxFiles = 10;
  selectedFormat: string = '';

  readonly formats: FormatOption[] = [
    { label: 'OGG (.ogg)', extension: '.ogg', mime: 'audio/ogg' },
    { label: 'WAV (.wav)', extension: '.wav', mime: 'audio/wav' },
    { label: 'M4A (.m4a)', extension: '.m4a', mime: 'audio/m4a' },
    { label: 'AAC (.aac)', extension: '.aac', mime: 'audio/aac' },
    { label: 'WEBM (.webm)', extension: '.webm', mime: 'audio/webm' },
    { label: 'FLAC (.flac)', extension: '.flac', mime: 'audio/flac' },
  ];

  constructor(private ac_ser: AudioConverterService) {}

  onFormatChange(): void {
    this.selectedFiles = [];
    this.errorMessage = null;
    this.successMessage = false;
  }

  get currentAccept(): string {
    if (!this.selectedFormat) return '';
    const current = this.formats.find((f) => f.extension === this.selectedFormat);
    return current ? `${current.extension},${current.mime}` : '';
  }

  triggerFileInput(fileInput: HTMLInputElement): void {
    if (!this.selectedFormat || this.isLoading) return;
    fileInput.click();
  }

  onFileSelected(event: Event): void {
    if (!this.selectedFormat) return;
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
    if (!this.selectedFormat || this.isLoading) return;

    if (event.dataTransfer?.files) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  private processFiles(files: File[]): void {
    this.errorMessage = null;
    this.successMessage = false;
    const targetExt = this.selectedFormat.toLowerCase();

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
    if (this.selectedFiles.length === 0 || !this.selectedFormat) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = false;

    this.ac_ser.convertAudioToZip(this.selectedFiles).subscribe({
      next: (blobData: Blob) => {
        const blob = new Blob([blobData], { type: 'application/zip' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audios_${this.selectedFormat.replace('.', '')}_a_mp3.zip`;
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
        this.errorMessage = 'Ocurrió un error al procesar la conversión en el servidor.';
      },
    });
  }

  formatFileSize(size: number): string {
    return (size / (1024 * 1024)).toFixed(2);
  }
}
