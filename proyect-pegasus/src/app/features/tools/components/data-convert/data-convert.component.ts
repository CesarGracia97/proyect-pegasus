import { Component, signal, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataConvertService } from '../../services/data-convert.service';

@Component({
  selector: 'app-data-convert',
  imports: [CommonModule, FormsModule],
  templateUrl: './data-convert.component.html',
  styleUrl: './data-convert.component.scss'
})
export class DataConvertComponent {private dataService = inject(DataConvertService);

  @Output() closePanel = new EventEmitter<void>();

  // Estados Reactivos (Signals)
  selectedFile = signal<File | null>(null);
  allowedFormats = signal<string[]>([]);
  selectedTargetFormat = signal<string>('');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  isDragOver = signal<boolean>(false);

  // Formatos soportados por el módulo de datos
  readonly supportedExtensions = ['.csv', '.xlsx', '.xls', '.json', '.sql'];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  private processFile(file: File): void {
    this.errorMessage.set(null);
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!this.supportedExtensions.includes(ext)) {
      this.errorMessage.set(`Formato no soportado. Usa: ${this.supportedExtensions.join(', ')}`);
      return;
    }

    this.selectedFile.set(file);
    this.fetchAllowedConversions(ext);
  }

  private fetchAllowedConversions(ext: string): void {
    this.dataService.getAllowedConversions(ext).subscribe({
      next: (res) => {
        // Se obtiene la propiedad allowed_targets del JSON de FastAPI
        const targets = res.allowed_targets || [];
        this.allowedFormats.set(targets);
        this.selectedTargetFormat.set(targets[0] || '');
      },
      error: (err) => {
        // Imprime el error real en la consola de Developer Tools
        console.error('Error al consultar formatos de destino:', err);
        this.errorMessage.set('Error al consultar formatos de destino disponibles.');
        this.allowedFormats.set([]);
      }
    });
  }

  executeConversion(): void {
    const file = this.selectedFile();
    const target = this.selectedTargetFormat();

    if (!file || !target) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.dataService.convertData(file, target).subscribe({
      next: (blob: Blob) => {
        this.downloadFile(blob, file.name, target);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Ocurrió un error al procesar la conversión de datos.');
        this.isLoading.set(false);
      }
    });
  }

  private downloadFile(blob: Blob, originalName: string, targetExt: string): void {
    const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
    const formattedExt = targetExt.startsWith('.') ? targetExt : `.${targetExt}`;
    const fileName = `${baseName}_convertido${formattedExt}`;

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  resetSelection(): void {
    this.selectedFile.set(null);
    this.allowedFormats.set([]);
    this.selectedTargetFormat.set('');
    this.errorMessage.set(null);
  }

  close(): void {
    this.closePanel.emit();
  }
}
