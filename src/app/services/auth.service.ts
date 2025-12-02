import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private firestore: Firestore) {}

  async login(email: string, password: string): Promise<any> {
    const auth = getAuth();

    // 1️⃣ LOGIN EN FIREBASE AUTH
    const cred = await signInWithEmailAndPassword(auth, email, password);

    if (!cred.user.email) {
      throw new Error('El usuario no tiene correo válido');
    }

    // 2️⃣ BUSCAR USUARIO EN FIRESTORE
    const usuariosRef = collection(this.firestore, 'usuarios');
    const q = query(usuariosRef, where('correo', '==', email));
    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error('El usuario no existe en la base de datos');
    }

    const data = snap.docs[0].data();

    // 3️⃣ RETORNAR DATOS COMPLETOS AL LOGIN
    return {
      uid: cred.user.uid,
      email: cred.user.email,
      nombre: data['nombre'],
      apellido: data['apellido'],
      rol: data['rol'],
      carnet: data['carnet'],
      estado: data['estado'],
      telefono: data['telefono'],
      fecha_nacimiento: data['fecha_nacimiento'],
      genero: data['genero'],
      ...data
    };
  }
  // =======================================================
// 🔒 VERIFICAR SI HAY SESIÓN ACTIVA
// =======================================================
isLoggedIn(): boolean {
  const user = localStorage.getItem('usuario');
  return user !== null;
}

// =======================================================
// 🔒 OBTENER USUARIO ACTUAL
// =======================================================
getUsuarioActual(): any {
  const u = localStorage.getItem('usuario');
  return u ? JSON.parse(u) : null;
}

// =======================================================
// 🔒 CERRAR SESIÓN DESDE EL SERVICE
// =======================================================
logout() {
  localStorage.removeItem('usuario');
  const auth = getAuth();
  auth.signOut();
}
// =======================================================
// 🔥 GUARD PARA PROTEGER RUTAS
// =======================================================
canActivate(): boolean {
  if (this.isLoggedIn()) {
    return true;
  }
  window.location.href = '/login';
  return false;
}

}
