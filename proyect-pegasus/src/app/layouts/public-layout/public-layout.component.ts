import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './public-layout.component.html',
  styleUrls: ['./public-layout.component.scss']
  // styleUrls: ['./public-layout.component.scss', './public-layout.responsive.scss']
})
export class PublicLayoutComponent implements OnInit, OnDestroy {
  private now = signal(new Date());
  private timerId: any;

  // Señal para la ruta de la animación elegida aleatoriamente
  timeAnimation = signal<string>('');

  // Señales computadas para horas, minutos y período (AM/PM)
  hours = computed(() => {
    const h = this.now().getHours() % 12 || 12;
    return h.toString().padStart(2, '0');
  });

  minutes = computed(() => {
    return this.now().getMinutes().toString().padStart(2, '0');
  });

  period = computed(() => {
    return this.now().getHours() >= 12 ? 'PM' : 'AM';
  });

  ngOnInit(): void {
    // Seleccionamos un GIF/WebP aleatorio inicial según la hora actual
    this.selectRandomAnimation(this.now().getHours());

    let lastHour = this.now().getHours();

    this.timerId = setInterval(() => {
      const current = new Date();
      this.now.set(current);

      // Si cambia de hora, elegimos una nueva animación al azar
      if (current.getHours() !== lastHour) {
        lastHour = current.getHours();
        this.selectRandomAnimation(lastHour);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  // Método que escoge una imagen aleatoria según la franja horaria
  private selectRandomAnimation(hours: number): void {
    const basePath = 'assets/img/animations/';
    let availableGifs: string[] = [];

    if (hours >= 5 && hours < 9) {
      // Amanecer (5 AM - 8 AM)
      availableGifs = ['amanecer_001.webp'];
    } else if (hours >= 9 && hours < 18) {
      // Mediodía / Día (9 AM - 5 PM)
      availableGifs = ['mediodia_001.gif', 'mediodia_002.gif', 'mediodia_003.gif', 'mediodia_004.gif'];
    } else if (hours >= 18 && hours < 19) {
      // Atardecer (6 PM - 7 PM)
      availableGifs = ['Atardecer_001.gif', 'Atardecer_002.gif'];
    } else {
      // Noche (8 PM - 4 AM)
      availableGifs = ['noche_001.gif', 'noche_002.gif', 'noche_003.gif'];
    }

    // Elegir índice al azar
    const randomIndex = Math.floor(Math.random() * availableGifs.length);
    this.timeAnimation.set(`${basePath}${availableGifs[randomIndex]}`);
  }
}