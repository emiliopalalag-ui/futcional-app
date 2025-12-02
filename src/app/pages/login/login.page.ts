import { Component } from '@angular/core';
import {
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonIcon,
  IonButton,
  IonSpinner,
} from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ToastController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonIcon,
    IonButton,
    IonSpinner,
  ],
})
export class LoginPage {

  email = '';
  password = '';
  showPassword = false;
  isLoading = false;

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private authSrv: AuthService
  ) {}

  async loginEmail() {
    if (!this.email || !this.password) {
      return this.showToast('Ingresa correo y contraseña');
    }

    const loading = await this.loadingCtrl.create({
      message: 'Validando...',
      spinner: 'crescent',
    });

    this.isLoading = true;
    await loading.present();

    try {
      const usuario = await this.authSrv.login(this.email, this.password);
      await loading.dismiss();
      this.isLoading = false;

      localStorage.setItem('usuario', JSON.stringify(usuario));
      this.router.navigateByUrl('/home', { replaceUrl: true });

    } catch (err: any) {
      this.isLoading = false;
      await loading.dismiss();
      this.showToast(err.message);
    }
  }

  private async showToast(message: string, color: string = 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
    });
    toast.present();
  }
  
}
