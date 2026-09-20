import { Injectable, ElementRef, NgZone } from '@angular/core';

declare var Dos: any;

@Injectable({
  providedIn: 'root'
})
export class DoomEmulatorService {

  private dosInstance: any = null;
  private dosCI: any = null;
  private originalTitle: string = '';

  constructor(private ngZone: NgZone) {}

  iniciarEmulador(canvasElement: HTMLCanvasElement): Promise<void> {
    this.originalTitle = document.title || 'Proyecto Pegasus';

    return this.cargarScriptJsDos().then(() => {
      this.lanzarDoom(canvasElement);
    });
  }

  detenerEmulador(canvasElement?: HTMLCanvasElement): void {
    if (this.originalTitle) {
      document.title = this.originalTitle;
    }

    if (this.dosCI) {
      try {
        if (typeof this.dosCI.exit === 'function') this.dosCI.exit();
      } catch (e) {}
      this.dosCI = null;
    }

    if (this.dosInstance) {
      try {
        if (typeof this.dosInstance.stop === 'function') this.dosInstance.stop();
      } catch (e) {}
      this.dosInstance = null;
    }

    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.AL && win.AL.currentContext && win.AL.currentContext.audioCtx) {
        try {
          win.AL.currentContext.audioCtx.close();
        } catch (e) {}
      }
    }

    if (canvasElement && canvasElement.parentNode) {
      canvasElement.parentNode.removeChild(canvasElement);
    }
  }

  capturarMouse(canvasElement: HTMLCanvasElement): void {
    if (canvasElement) {
      canvasElement.focus();
      if (canvasElement.requestPointerLock) {
        canvasElement.requestPointerLock();
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

  private lanzarDoom(canvasElement: HTMLCanvasElement): void {
    if (!canvasElement || typeof Dos === 'undefined') return;

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
}