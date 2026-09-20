import { CommonModule } from '@angular/common';
import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { 
  LucideAngularModule, 
  RefreshCw, 
  Star, 
  LayoutGrid, 
  Box, 
  Gamepad2,
  LucideIconData, 
  Home
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
export class MainLayoutComponent implements OnInit {
  activeMenu = signal('');
  isExpanded = signal(false);

  menuItems: MenuItem[] = [
    { name: 'Inicio', route: '/', icon: Home },
    { name: 'Convertidores', route: '/herramientas', icon: RefreshCw },
    { name: 'Área R7', route: '/shirt-brands', icon: Star },
    { name: 'K-SS Engine', route: '/kssengine', customText: 'K➔SS' },
    { name: 'Proyectos', route: '/proyectos', icon: LayoutGrid },
    { name: 'SdX', route: '/sdx', svgPath: 'assets/img/Logo-SdX.svg' },
    { name: 'SandBox', route: '/sandbox', icon: Box },
    { name: 'Doom', route: '/doom',  svgPath: 'assets/img/Doom.svg' }
  ];
  constructor(private router: Router) {
    // Escucha los cambios de ruta para mantener siempre encendido el icono correcto
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.syncActiveMenuWithUrl(event.urlAfterRedirects || event.url);
    });
  }

  ngOnInit(): void {
    // Sincroniza el menú activo al cargar o refrescar la página
    this.syncActiveMenuWithUrl(this.router.url);
  }

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

  private syncActiveMenuWithUrl(currentUrl: string): void {
    const foundItem = this.menuItems.find(item => {
      if (item.route === '/') {
        return currentUrl === '/';
      }
      return currentUrl.startsWith(item.route);
    });

    if (foundItem) {
      this.activeMenu.set(foundItem.name);
    }
  }
}