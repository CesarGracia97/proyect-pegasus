import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { 
  LucideAngularModule, 
  RefreshCw, 
  Star, 
  Bell, 
  Gamepad2, 
  LucideIconData 
} from 'lucide-angular';

interface MenuItem {
  name: string;
  route: string;
  icon?: LucideIconData;
  customText?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LucideAngularModule],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss', './main-layout.responsive.scss']
})
export class MainLayoutComponent {
  activeMenu = signal('Convertidores');
  isExpanded = signal(false);

  menuItems: MenuItem[] = [
    { name: 'Convertidores', route: '/herramientas', icon: RefreshCw },
    { name: 'Área R7', route: '/shirt-brands', icon: Star },
    { name: 'K-SS Engine', route: '/engine', customText: 'K➔SS' },
    { name: 'Notificador RH', route: '/notificador', icon: Bell },
    { name: 'Patio de Juegos', route: '/patio', icon: Gamepad2 }
  ];

  constructor(private router: Router) {}

  onItemClick(item: MenuItem): void {
    // 1. Si la barra está colapsada (estado pasivo), solo la desplegamos
    if (!this.isExpanded()) {
      this.isExpanded.set(true);
      return;
    }

    // 2. Si la barra ya está activa (desplegada), navegamos a la ruta y actualizamos el ícono
    this.activeMenu.set(item.name);
    this.router.navigate([item.route]);
  }

  toggleSidebar(): void {
    this.isExpanded.update(value => !value);
  }
}