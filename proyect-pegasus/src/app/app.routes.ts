import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { ToolsComponent } from './features/tools/tools.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
  // Ruta por defecto (Redirige al Home)
  // Layout principal
{
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent }, 
    ]
  },
  
  // GRUPO 2: Páginas de herramientas con el Layout de Sidebar (Barra Lateral)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { 
        path: 'herramientas', 
        loadComponent: () => import('./features/tools/tools.component').then(m => m.ToolsComponent) 
      },
      {
        path:'shirt-brands',
        loadComponent: () => import('./features/shirt-brands/shirt-brands.component').then(m => m.ShirtBrandsComponent)
      },
    ]
  },
  
  

  { path: '**', redirectTo: '' }
];
