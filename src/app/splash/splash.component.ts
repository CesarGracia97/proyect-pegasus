import { Component, OnInit, signal, output } from '@angular/core';

@Component({
  selector: 'app-splash',
  standalone: true,
  templateUrl: './splash.component.html',
  styleUrl: './splash.component.scss'
})
export class SplashComponent implements OnInit {
  // Evento que notifica al componente padre cuando la intro ha terminado por completo
  animationFinished = output<void>();

  // Señal reactiva para activar la transición CSS de desvanecimiento (Fade Out)
  isFadingOut = signal(false);

  ngOnInit(): void {
    // A los 3.2 segundos iniciamos la transición de desaparición de la pantalla negra
    setTimeout(() => {
      this.isFadingOut.set(true);
    }, 3200);

    // A los 3.7 segundos destruimos por completo el componente Splash de la pantalla
    setTimeout(() => {
      this.animationFinished.emit();
    }, 3700);
  }
}