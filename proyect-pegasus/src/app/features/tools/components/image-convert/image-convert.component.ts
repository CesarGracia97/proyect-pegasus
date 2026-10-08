import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageConvertService } from '../../services/image-convert.service';

@Component({
  selector: 'app-image-convert',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-convert.component.html',
  styleUrl: './image-convert.component.scss',
})
export class ImageConvertComponent {
  private imageService = inject(ImageConvertService);

  readonly maxFiles = 10;
  readonly currentAccept = 'image/*,.heic,.heif,.svg,.raw,.ico,.bmp,.tiff';

  // Signals de Estado
  selectedFiles = signal<File[]>([]);
  allowedTargets = signal<string[]>([]);
  selectedTarget = signal<string>('');
  quality = signal<number>(80);

  isLoadingTargets = signal<boolean>(false);
  isConverting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Texto resumido para el estado cargado
  summaryText = computed(() => {
    const files = this.selectedFiles();
    if (files.length === 0) return '';
    return files.map((f) => f.name).join(', ');
  });

  triggerFileInput(input: HTMLInputElement): void {
    input.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
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
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFiles(Array.from(event.dataTransfer.files));
    }
  }

  clearFiles(event: Event): void {
    event.stopPropagation();
    this.resetState();
  }

  private processFiles(files: File[]): void {
    this.resetState();

    const limitedFiles = files.slice(0, this.maxFiles);
    this.selectedFiles.set(limitedFiles);

    const firstFile = limitedFiles[0];
    const ext = firstFile.name.substring(firstFile.name.lastIndexOf('.'));

    if (!ext || ext === firstFile.name) {
      this.errorMessage.set('El archivo no posee una extensión válida.');
      return;
    }

    this.isLoadingTargets.set(true);

    this.imageService.getAllowedConversions(ext).subscribe({
      next: (response) => {
        this.isLoadingTargets.set(false);
        const targets = response.allowed_targets || [];
        this.allowedTargets.set(targets);

        if (targets.length > 0) {
          this.selectedTarget.set(targets[0]);
        }
        if (response.recommended_quality) {
          this.quality.set(response.recommended_quality);
        }
      },
      error: (err) => {
        this.isLoadingTargets.set(false);
        const detail =
          err.error?.detail || 'La extensión de la imagen no está soportada.';
        this.errorMessage.set(detail);
      },
    });
  }

  resetState(): void {
    this.selectedFiles.set([]);
    this.allowedTargets.set([]);
    this.selectedTarget.set('');
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  executeConversion(): void {
    const files = this.selectedFiles();
    const target = this.selectedTarget();

    if (files.length === 0 || !target) return;

    this.isConverting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.imageService.convertImages(files, target, this.quality()).subscribe({
      next: (blob: Blob) => {
        this.isConverting.set(false);
        this.successMessage.set('¡Proceso completado! La descarga inició automáticamente.');
        this.downloadFile(blob, `imagenes_convertidas_${target}.zip`);
      },
      error: () => {
        this.isConverting.set(false);
        this.errorMessage.set(
          'Ocurrió un error al procesar la conversión de las imágenes.',
        );
      },
    });
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}