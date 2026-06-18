import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '',        loadComponent: () => import('./intro/intro.component').then(m => m.IntroComponent) },
  { path: 'village', loadComponent: () => import('./game/game.component').then(m => m.GameComponent) },
];
