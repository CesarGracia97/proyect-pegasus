import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
  // Ruta por defecto (Redirige al Home)
  { path: '', component: HomeComponent },
  
  { 
    path: 'herramientas', 
    loadComponent: () => import('./features/tools/tools.component').then(m => m.ToolsComponent) 
  },

  { path: '**', redirectTo: '' }
];
