import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {activeMenu = signal('Convertidores');

  menuItems = [
    { name: 'Convertidores', route: '/herramientas' },
    { name: 'Prueba tu Logo', route: '/logo' }, // Ajusta tus rutas según configures
    { name: 'Generador de Convinadas', route: '/combinadas' },
    { name: 'Notificador RH', route: '/notificador' },
    { name: 'Patio de Juegos', route: '/patio' }
  ];

  constructor(private router: Router) {}

  setMenu(item: { name: string, route: string }): void {
    this.activeMenu.set(item.name);
    this.router.navigate([item.route]);
  }
}
