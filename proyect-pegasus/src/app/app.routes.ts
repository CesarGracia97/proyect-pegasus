import { Routes, ResolveFn } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

// Resolver que mantiene la navegación en espera 280ms mientras se cierran las cortinas
export const curtainResolver: ResolveFn<boolean> = () => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 280));
};

export const routes: Routes = [
  // GRUPO 1: Layout principal
  {
    path: '',
    component: PublicLayoutComponent,
    resolve: { curtain: curtainResolver },
    runGuardsAndResolvers: 'always',
    children: [
      { path: '', component: HomeComponent }, 
    ]
  },
  
  // GRUPO 2: Páginas de herramientas con el Layout de Sidebar
  {
    path: '',
    component: MainLayoutComponent,
    resolve: { curtain: curtainResolver },
    runGuardsAndResolvers: 'always',
    children: [
      { 
        path: 'herramientas', 
        loadComponent: () => import('./features/tools/tools.component').then(m => m.ToolsComponent) 
      },
      {
        path: 'shirt-brands',
        loadComponent: () => import('./features/shirt-brands/shirt-brands.component').then(m => m.ShirtBrandsComponent)
      },
      {
        path: 'doom',
        loadComponent: () => import('./features/doom/doom.component').then(m => m.DoomComponent)
      }
    ]
  },

  { path: '**', redirectTo: '' }
];