import { Component, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthDoomService, KonamiState } from './services/auth-doom.service';
import { DoomEmulatorService } from './services/doom-emulator.service';

@Component({
  selector: 'app-doom',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doom.component.html',
  styleUrls: ['./doom.component.scss']
})
export class DoomComponent implements OnInit, OnDestroy {

  @ViewChild('dosCanvas') dosCanvas!: ElementRef<HTMLCanvasElement>;

  // Estado UI
  bloqueado: boolean = true;
  modoModal: 'password' | 'konami' = 'password';

  // Modal Password
  passwordInput: string = '';
  passwordError: boolean = false;

  konamiState: KonamiState = {
    teclasIngresadas: [],
    esError: false,
    bloqueado: false
  };

  juegoIniciado: boolean = false;

  constructor(
    private authDoomService: AuthDoomService,
    private emulatorService: DoomEmulatorService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.bloqueado = true;
    localStorage.removeItem('pegasus_doom_unlocked');
  }

  @HostListener('window:keydown', ['$event'])
  manejarTeclado(event: KeyboardEvent): void {
    if (!this.bloqueado || this.modoModal !== 'konami' || this.konamiState.bloqueado) {
      return;
    }

    const { nuevoEstado, desbloqueado } = this.authDoomService.procesarTeclaKonami(event.key, this.konamiState);
    this.konamiState = nuevoEstado;

    if (desbloqueado) {
      setTimeout(() => this.desbloquear(), 300);
    } else if (this.konamiState.esError) {
      setTimeout(() => {
        this.konamiState = { teclasIngresadas: [], esError: false, bloqueado: false };
        this.cdr.detectChanges();
      }, 3000);
    }
  }

  validarPassword(): void {
    if (this.authDoomService.validarPassword(this.passwordInput)) {
      this.desbloquear();
    } else {
      this.passwordError = true;
      setTimeout(() => {
        this.passwordError = false;
        this.passwordInput = '';
      }, 2000);
    }
  }

  desbloquear(): void {
    this.bloqueado = false;
  }

  cambiarModo(modo: 'password' | 'konami'): void {
    this.modoModal = modo;
    this.passwordError = false;
    this.konamiState = { teclasIngresadas: [], esError: false, bloqueado: false };
  }

  iniciarJuego(): void {
    this.juegoIniciado = true;
    setTimeout(() => {
      if (this.dosCanvas?.nativeElement) {
        this.emulatorService.iniciarEmulador(this.dosCanvas.nativeElement)
          .catch(err => console.error('Error al iniciar emulador:', err));
      }
    }, 100);
  }

  cerrarJuego(): void {
    this.emulatorService.detenerEmulador(this.dosCanvas?.nativeElement);
    this.juegoIniciado = false;
    this.cdr.detectChanges();
  }

  capturarMouse(): void {
    if (this.dosCanvas?.nativeElement) {
      this.emulatorService.capturarMouse(this.dosCanvas.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.emulatorService.detenerEmulador(this.dosCanvas?.nativeElement);
    this.bloqueado = true;
    this.passwordInput = '';
  }
}