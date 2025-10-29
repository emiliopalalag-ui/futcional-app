import { Component } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule, RouterModule],
})
export class LoginPage {
  // 👇 Variables que ngModel usará
  email = '';
  password = '';

  constructor(private router: Router, private toastCtrl: ToastController) {}

  async loginEmail() {
    console.log('click detectado:', this.email, this.password); // <-- para verificar
    const auth = getAuth();
    try {
      const user = await signInWithEmailAndPassword(auth, this.email, this.password);
      console.log('Usuario logueado:', user.user.email);
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (error: any) {
      this.showToast('Error: ' + error.message);
    }
  }

  async loginGoogle() {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    try {
      await signInWithPopup(auth, provider);
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (error: any) {
      this.showToast('Error con Google: ' + error.message);
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color: 'danger',
    });
    await toast.present();
  }
}
