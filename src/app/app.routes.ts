import { Routes } from '@angular/router';
import { Inicio } from './inicio/inicio';
import { Login } from './login/login';

export const routes: Routes = [
  {
    path: '',
    component: Inicio,
  },
  {
    path: 'login',
    component: Login,
  },
];
