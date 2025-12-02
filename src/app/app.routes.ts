import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthService } from './services/auth.service';

export const routes: Routes = [

  // ======================================================
  // 🔹 LOGIN (no necesita guard)
  // ======================================================
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },

  // ======================================================
  // 🔹 RUTAS INTERNAS (PROTEGIDAS POR EL GUARD)
  // ======================================================
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthService],   // 🔥 PROTECCIÓN AQUÍ
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.page').then((m) => m.HomePage),
      },

      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/usuarios/usuarios.page').then((m) => m.UsuariosPage),
      },

      {
        path: 'roles',
        loadComponent: () =>
          import('./pages/roles/roles.page').then((m) => m.RolesPage),
      },

      {
        path: 'entrenamientos',
        loadComponent: () =>
          import('./pages/entrenamientos/entrenamientos.page').then(
            (m) => m.EntrenamientosPage
          ),
      },

      {
        path: 'inscripciones',
        loadComponent: () =>
          import('./pages/inscripciones/inscripciones.page').then(
            (m) => m.InscripcionesPage
          ),
      },

      {
        path: 'actividades',
        loadComponent: () =>
          import('./pages/actividades/actividades.page').then(
            (m) => m.ActividadesPage
          ),
      },

      {
        path: 'informes',
        loadComponent: () =>
          import('./pages/informes/informes.page').then(
            (m) => m.InformesPage
          ),
      },

      {
        path: 'pagos',
        loadComponent: () =>
          import('./pages/pagos/pagos.page').then((m) => m.PagosPage),
      },
       {
        path: 'gastos',
        loadComponent: () =>
          import('./pages/gastos/gastos.page').then((m) => m.GastosPage),
      },
      {
  path: 'responsables',
  loadComponent: () => import('./pages/responsables/responsables.page').then(m => m.ResponsablesPage)
}

    ],
  },

  // ======================================================
  // 🔹 RUTA INVÁLIDA → LOGIN
  // ======================================================
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'pagos',
    loadComponent: () => import('./pages/pagos/pagos.page').then( m => m.PagosPage)
  },
  {
    path: 'gastos',
    loadComponent: () => import('./pages/gastos/gastos.page').then( m => m.GastosPage)
  },
  {
    path: 'responsables',
    loadComponent: () => import('./pages/responsables/responsables.page').then( m => m.ResponsablesPage)
  },
];
