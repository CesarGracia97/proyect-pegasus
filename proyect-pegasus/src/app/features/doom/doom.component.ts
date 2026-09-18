import { Component, ElementRef, ViewChild, NgZone, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

declare var Dos: any;

@Component({
  selector: 'app-doom',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doom.component.html',
  styleUrls: ['./doom.component.scss']
})
export class DoomComponent implements OnDestroy {

  @ViewChild('dosCanvas') dosCanvas!: ElementRef<HTMLCanvasElement>;

  juegoIniciado: boolean = false;
  private dosInstance: any = null;
  private dosCI: any = null;
  private title: string = '';

  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  iniciarJuego(): void {
    this.title = document.title || 'Proyecto Pegasus';
    this.juegoIniciado = true;

    setTimeout(() => {
      this.cargarScriptJsDos()
        .then(() => this.lanzarDoom())
        .catch((err) => console.error('Error al cargar JS-DOS:', err));
    }, 100);
  }

  cerrarJuego(): void {
    this.detenerEmulador();
    this.juegoIniciado = false;
    this.cdr.detectChanges();
  }

  capturarMouse(): void {
    const canvas = this.dosCanvas?.nativeElement;
    if (canvas) {
      canvas.focus();
      if (canvas.requestPointerLock) {
        canvas.requestPointerLock();
      }
    }
  }

  private cargarScriptJsDos(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof Dos !== 'undefined') {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js-dos.com/6.22/current/js-dos.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  }

  private lanzarDoom(): void {
    const canvasElement = this.dosCanvas?.nativeElement;

    if (!canvasElement || typeof Dos === 'undefined') {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      const originalLog = console.log;
      const originalInfo = console.info;
      const originalWarn = console.warn;

      const noop = () => {};
      console.log = noop;
      console.info = noop;
      console.warn = noop;

      const restaurarConsola = () => {
        console.log = originalLog;
        console.info = originalInfo;
        console.warn = originalWarn;
      };

      try {
        Dos(canvasElement, {
          wdosboxUrl: 'https://js-dos.com/6.22/current/wdosbox.js',
          logger: () => {}
        }).ready((dos: any, main: any) => {
          this.dosInstance = dos;

          dos.extract('/assets/game/doom.jsdos')
            .then(() => {
              return main(['-c', 'config -set cpu cycles=max', '-c', 'DOOM.EXE']);
            })
            .then((ci: any) => {
              this.dosCI = ci;
              setTimeout(restaurarConsola, 2000);
            })
            .catch((err: any) => {
              restaurarConsola();
              console.error('Error extrayendo o ejecutando DOOM:', err);
            });
        });
      } catch (e) {
        restaurarConsola();
      }
    });
  }

  private detenerEmulador(): void {
    if (this.title) {
      document.title = this.title;
    } else {
      document.title = 'Proyecto Pegasus';
    }

    // 2. Detener proceso de JS-DOS
    if (this.dosCI) {
      try {
        if (typeof this.dosCI.exit === 'function') {
          this.dosCI.exit();
        }
      } catch (e) {}
      this.dosCI = null;
    }

    if (this.dosInstance) {
      try {
        if (typeof this.dosInstance.stop === 'function') {
          this.dosInstance.stop();
        }
      } catch (e) {}
      this.dosInstance = null;
    }

    // 3. Liberar puntero del mouse
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    // 4. Detener audio WebAssembly / OpenAL
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.AL && win.AL.currentContext && win.AL.currentContext.audioCtx) {
        try {
          win.AL.currentContext.audioCtx.close();
        } catch (e) {}
      }
    }

    // 5. Destruir Canvas del DOM
    if (this.dosCanvas?.nativeElement) {
      const canvas = this.dosCanvas.nativeElement;
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }

  ngOnDestroy(): void {
    this.detenerEmulador();
  }
}