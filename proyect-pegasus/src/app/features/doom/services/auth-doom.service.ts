import { Injectable } from '@angular/core';

export interface KonamiState {
  teclasIngresadas: string[];
  esError: boolean;
  bloqueado: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthDoomService {

  private readonly PASSWORD_CORRECTA = 'pegasus1997';
  private readonly KONAMI_SEQUENCE = [
    'ArrowUp', 'ArrowUp', 
    'ArrowDown', 'ArrowDown', 
    'ArrowLeft', 'ArrowRight', 
    'ArrowLeft', 'ArrowRight', 
    'b', 'a'
  ];

  validarPassword(input: string): boolean {
    return input.trim().toUpperCase() === this.PASSWORD_CORRECTA;
  }

  procesarTeclaKonami(key: string, estadoActual: KonamiState): { nuevoEstado: KonamiState; desbloqueado: boolean } {
    const indiceActual = estadoActual.teclasIngresadas.length;
    const teclaEsperada = this.KONAMI_SEQUENCE[indiceActual];

    let etiquetaTecla = key.toUpperCase();
    if (key === 'ArrowUp') etiquetaTecla = '↑';
    if (key === 'ArrowDown') etiquetaTecla = '↓';
    if (key === 'ArrowLeft') etiquetaTecla = '←';
    if (key === 'ArrowRight') etiquetaTecla = '→';

    if (key.toLowerCase() === teclaEsperada.toLowerCase()) {
      const teclas = [...estadoActual.teclasIngresadas, etiquetaTecla];
      const esUltima = teclas.length === this.KONAMI_SEQUENCE.length;

      return {
        nuevoEstado: { ...estadoActual, teclasIngresadas: teclas },
        desbloqueado: esUltima
      };
    } else {
      return {
        nuevoEstado: {
          teclasIngresadas: [...estadoActual.teclasIngresadas, etiquetaTecla],
          esError: true,
          bloqueado: true
        },
        desbloqueado: false
      };
    }
  }
}