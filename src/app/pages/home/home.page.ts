import { Component, OnInit } from '@angular/core';
import { IonicModule, MenuController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class HomePage implements OnInit {
  displayName: string | null = null;
  email: string | null = null;
  photoURL: string | null = null;
  initials = 'U';

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private menuCtrl: MenuController
  ) {}

  ngOnInit(): void {
    const auth = getAuth();
    onAuthStateChanged(auth, (u) => {
      if (!u) return;
      this.displayName = u.displayName;
      this.email = u.email;
      this.photoURL = u.photoURL;
      this.initials = this.buildInitials(this.displayName || this.email || 'U');
    });
  }

  buildInitials(text: string): string {
    const parts = text.split('@')[0].split(/[.\s_-]+/).filter(Boolean);
    const ini = (parts[0]?.[0] || 'U') + (parts[1]?.[0] || '');
    return ini.toUpperCase();
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

  /** 🔹 Perfil */
  goToProfile() {
    this.router.navigateByUrl('/perfil');
  }

  /** 🔹 Usuarios */
  goToUsuarios() {
    this.router.navigate(['/usuarios']);
    this.menuCtrl.close(); // Cierra el menú al navegar
  }

  /** 🔹 Roles */
  goToRoles() {
    this.router.navigate(['/roles']);
    this.menuCtrl.close();
  }

  /** 🔹 Navegación genérica para los demás botones del menú */
  navigateTo(route: string) {
    this.router.navigate(['/' + route]);
    this.menuCtrl.close();
  }
}

