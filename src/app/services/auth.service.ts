import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private auth = getAuth();
  private isLogged = false;
  private userLoaded = false;

  constructor(private firestore: Firestore, private router: Router) {

    // Detectar sesión apenas inicia la app
    onAuthStateChanged(this.auth, (user) => {
      this.isLogged = !!user;

      if (user) {
        const uLS = localStorage.getItem('usuario');
        if (!uLS) {
          localStorage.setItem('usuario', JSON.stringify({
            uid: user.uid,
            email: user.email
          }));
        }
      }

      this.userLoaded = true;
    });
  }

  // ================================
  // LOGIN
  // ================================
  async login(email: string, password: string): Promise<any> {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);

    const usuariosRef = collection(this.firestore, 'usuarios');
    const q = query(usuariosRef, where('correo', '==', email));
    const snap = await getDocs(q);

    if (snap.empty) throw new Error('Usuario no encontrado');

    const data = snap.docs[0].data();

    const usuario = {
      uid: cred.user.uid,
      email: cred.user.email,
      ...data
    };

    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.isLogged = true;

    return usuario;
  }

  // ================================
  // VERIFICAR SESIÓN
  // ================================
  isLoggedIn(): boolean {
    return this.isLogged && localStorage.getItem('usuario') !== null;
  }

  getUsuarioActual(): any {
    const u = localStorage.getItem('usuario');
    return u ? JSON.parse(u) : null;
  }

  // ================================
  // LOGOUT
  // ================================
  logout() {
    localStorage.removeItem('usuario');
    this.auth.signOut();
    this.isLogged = false;
    this.router.navigate(['/login']);
  }

  // ================================
  // GUARD
  // ================================
  canActivate(): boolean {
    if (!this.userLoaded) return false;

    if (!this.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    return true;
  }
}
