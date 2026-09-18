import { Component, signal, OnInit, inject } from '@angular/core';
import { SplashComponent } from './features/splash/splash.component';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SplashComponent],
  templateUrl: './app.component.html',
  styleUrls: [
  './app.component.scss', 
  '../styles/transitions.scss'
]
})
export class AppComponent implements OnInit {

  showIntro = signal(true); // Estado maestro inicializado estrictamente en true para asegurar que la intro corra
  
  onIntroEnded(): void { // Manejador que se ejecuta al terminar la intro para dar paso definitivo al portafolio
    this.showIntro.set(false);
  }
  
  private router = inject(Router);
  
  // Señal global para activar la cortina
  isNavigating = signal<boolean>(false);

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isNavigating.set(true);
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => {
          this.isNavigating.set(false);
        }, 250);
      }
    });
  }

}