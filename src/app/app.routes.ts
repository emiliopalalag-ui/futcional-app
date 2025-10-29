import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  // 🔹 Página pública (fuera del layout)
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },

  // 🔹 Área privada (usa layout con menú y header)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'home', loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage) },
      { path: 'perfil', loadComponent: () => import('./pages/perfil/perfil.page').then((m) => m.PerfilPage) },
      { path: 'inscripciones', loadComponent: () => import('./pages/inscripciones/inscripciones.page').then((m) => m.InscripcionesPage) },
      { path: 'entrenamientos', loadComponent: () => import('./pages/entrenamientos/entrenamientos.page').then((m) => m.EntrenamientosPage) },
      { path: 'actividades', loadComponent: () => import('./pages/actividades/actividades.page').then((m) => m.ActividadesPage) },
      { path: 'informes', loadComponent: () => import('./pages/informes/informes.page').then((m) => m.InformesPage) },
      { path: 'usuarios', loadComponent: () => import('./pages/usuarios/usuarios.page').then((m) => m.UsuariosPage) },
      { path: 'roles', loadComponent: () => import('./pages/roles/roles.page').then((m) => m.RolesPage) },
    ],
  },

  // 🔹 Redirección por defecto
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];
