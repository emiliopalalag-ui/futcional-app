import { Component } from '@angular/core';
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonMenuToggle,
  IonFooter,
  IonButtons,
  IonButton,
  IonAvatar,
  IonMenuButton,
} from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MenuController, ToastController } from '@ionic/angular';
import { filter } from 'rxjs/operators';

import { GoogleAuthProvider, signInWithPopup,getAuth, onAuthStateChanged, signOut } from 'firebase/auth';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  imports: [
    CommonModule,
    RouterModule,

    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonMenuToggle,
    IonFooter,
    IonButtons,
    IonButton,
    IonAvatar,
    IonMenuButton,
  ],
})




export class MainLayoutComponent {

  isLogin = false;
  currentTime = '';
  displayName: string | null = null;
  email: string | null = null;
  photoURL: string | null = null;
  initials = 'U';

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private menuCtrl: MenuController
  ) {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.isLogin = this.router.url.startsWith('/login');
    });

    const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    this.displayName = user.displayName || 'Invitado';
    this.email = user.email || '';
    this.photoURL = user.photoURL || null;
    this.initials = this.buildInitials(this.displayName);
  }
});
  }

  buildInitials(text: string) {
    const p = text.split(/[.\s_-]+/).filter(Boolean);
    return ((p[0]?.[0] || 'U') + (p[1]?.[0] || '')).toUpperCase();
  }

  async logout() {
    await signOut(getAuth());
    const toast = await this.toastCtrl.create({
      message: 'Sesión cerrada.',
      duration: 1500,
      color: 'success',
    });
    await toast.present();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  navigateTo(route: string) {
    this.menuCtrl.close();
    this.router.navigate(['/' + route]);
  }

  goToProfile() {
    this.menuCtrl.close();
    this.router.navigate(['/perfil']);
  }

  ngOnInit() {
    setInterval(() => {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString('es-BO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    }, 1000);
  }
  async loginGoogle() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  localStorage.setItem("usuario", JSON.stringify(result.user));
  this.router.navigateByUrl('/home', { replaceUrl: true });
}
}
