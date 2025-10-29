import { Component } from '@angular/core';
import { IonicModule, MenuController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  imports: [IonicModule, CommonModule, RouterModule],
})
export class MainLayoutComponent {
  pageTitle = 'Panel Principal';
  displayName: string | null = null;
  email: string | null = null;
  photoURL: string | null = null;
  initials = 'U';

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private menuCtrl: MenuController
  ) {
    // 🔹 Cambiar título dinámicamente según la ruta
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      const current = this.router.url.split('/')[1];
      this.pageTitle = this.getPageTitle(current);
    });

    // 🔹 Obtener datos del usuario logueado
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (!user) return;
      this.displayName = user.displayName;
      this.email = user.email;
      this.photoURL = user.photoURL;
      this.initials = this.buildInitials(this.displayName || this.email || 'U');
    });
  }

  /** 🔹 Generar iniciales si no hay foto */
  buildInitials(text: string): string {
    const parts = text.split('@')[0].split(/[.\s_-]+/).filter(Boolean);
    const ini = (parts[0]?.[0] || 'U') + (parts[1]?.[0] || '');
    return ini.toUpperCase();
  }

  /** 🔹 Obtener título de cada página */
  getPageTitle(route: string): string {
    switch (route) {
      case 'usuarios': return 'Gestión de Usuarios';
      case 'roles': return 'Gestión de Roles';
      case 'entrenamientos': return 'Gestión de Entrenamientos';
      case 'inscripciones': return 'Gestión de Inscripciones';
      case 'actividades': return 'Gestión de Actividades';
      case 'informes': return 'Informes y Reportes';
      default: return 'Panel Principal';
    }
  }

  /** 🔹 Cerrar sesión */
  async logout() {
    const auth = getAuth();
    await signOut(auth);
    const toast = await this.toastCtrl.create({
      message: 'Sesión cerrada.',
      duration: 1600,
      color: 'success',
    });
    await toast.present();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  /** 🔹 Ir al perfil */
  goToProfile() {
    this.router.navigateByUrl('/perfil');
  }

  /** 🔹 Navegación del menú */
  navigateTo(route: string) {
    this.router.navigate(['/' + route]);
    this.menuCtrl.close();
  }
}
