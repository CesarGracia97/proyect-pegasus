import { Component, signal } from '@angular/core';
import { SplashComponent } from './splash/splash.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SplashComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Estado maestro inicializado estrictamente en true para asegurar que la intro corra
  showIntro = signal(true);

  // Manejador que se ejecuta al terminar la intro para dar paso definitivo al portafolio
  onIntroEnded(): void {
    this.showIntro.set(false);
  }
}