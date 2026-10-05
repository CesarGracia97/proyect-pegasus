import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentConvertService } from '../../services/document-convert.service';

@Component({
  selector: 'app-document-convert',
  imports: [CommonModule, FormsModule],
  templateUrl: './document-convert.component.html',
  styleUrl: './document-convert.component.scss'
})
export class DocumentConvertComponent {
  private docService = inject(DocumentConvertService);

  // Estados reactivos con Signals
  selectedFile = signal<File | null>(null);
  allowedTargets = signal<string[]>([]);
  selectedTarget = signal<string>('');
  engineName = signal<string>('');

  isDragOver = signal<boolean>(false);
  isLoadingTargets = signal<boolean>(false);
  isConverting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.processFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.processFile(event.dataTransfer.files[0]);
    }
  }

  private processFile(file: File): void {
    this.resetState();
    this.selectedFile.set(file);

    const ext = file.name.substring(file.name.lastIndexOf('.'));
    if (!ext || ext === file.name) {
      this.errorMessage.set('El archivo no posee una extensión válida.');
      return;
    }

    this.isLoadingTargets.set(true);

    // Consulta de la Whitelist en el Backend
    this.docService.getAllowedConversions(ext).subscribe({
      next: (response) => {
        this.isLoadingTargets.set(false);
        
        // Normalización para garantizar que siempre sea un string[]
        const targets: string[] = Array.isArray(response.allowed_targets)
          ? response.allowed_targets
          : [response.allowed_targets];

        this.allowedTargets.set(targets);
        this.engineName.set(response.engine);

        if (targets.length > 0) {
          this.selectedTarget.set(targets[0]);
        }
      },
      error: (err) => {
        this.isLoadingTargets.set(false);
        const detail = err.error?.detail || 'La extensión del archivo no está soportada en el sistema.';
        this.errorMessage.set(detail);
      }
    });
  }

  executeConversion(): void {
    const file = this.selectedFile();
    const target = this.selectedTarget();

    if (!file || !target) return;

    this.isConverting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.docService.convertDocument(file, target).subscribe({
      next: (blob: Blob | MediaSource) => {
        this.isConverting.set(false);
        this.successMessage.set('Documento convertido con éxito.');

        // Generar descarga automática
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
        const cleanExt = target.startsWith('.') ? target : `.${target}`;

        a.href = url;
        a.download = `${baseName}${cleanExt}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.isConverting.set(false);
        this.errorMessage.set('Ocurrió un error al procesar la conversión del archivo.');
      }
    });
  }

  resetState(): void {
    this.selectedFile.set(null);
    this.allowedTargets.set([]);
    this.selectedTarget.set('');
    this.engineName.set('');
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }
}
