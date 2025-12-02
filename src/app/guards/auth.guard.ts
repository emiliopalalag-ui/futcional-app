import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  private isLogged = false;

  constructor(private auth: Auth, private router: Router) {
    onAuthStateChanged(this.auth, user => {
      this.isLogged = !!user;
    });
  }

  canActivate(): boolean {
    if (!this.isLogged) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
