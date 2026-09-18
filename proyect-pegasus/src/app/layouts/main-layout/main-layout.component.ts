import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { 
  LucideAngularModule, 
  RefreshCw, 
  Star, 
  LayoutGrid, 
  User, 
  Box, 
  LucideIconData, 
  Home,
} from 'lucide-angular';

interface MenuItem {
  name: string;
  route: string;
  icon?: LucideIconData;
  customText?: string;
  svgPath?: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LucideAngularModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  activeMenu = signal('Convertidores');
  isExpanded = signal(false);

  menuItems: MenuItem[] = [
    { name: 'Inicio', route: '/', icon: Home },
    { name: 'Convertidores', route: '/herramientas', icon: RefreshCw },
    { name: 'Área R7', route: '/shirt-brands', icon: Star },
    { name: 'K-SS Engine', route: '/engine', customText: 'K➔SS' },
    { name: 'Proyectos', route: '/proyectos', icon: LayoutGrid },
    { name: 'Sobre mí', route: '/sobre-mi', icon: User },
    { name: 'SandBox', route: '/sandbox', icon: Box },
    { name: 'Doom', route: '/doom',  svgPath: 'assets/img/Doom.svg' }
  ];

  constructor(private router: Router) {}

  onItemClick(item: MenuItem): void {
    if (!this.isExpanded()) {
      this.isExpanded.set(true);
      return;
    }

    this.activeMenu.set(item.name);
    this.router.navigate([item.route]);
  }

  toggleSidebar(): void {
    this.isExpanded.update(value => !value);
  }
}