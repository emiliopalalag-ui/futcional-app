import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  getDoc,
  CollectionReference,
  DocumentData
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  private usuariosCollection: CollectionReference<DocumentData>;
  private rolesCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.usuariosCollection = collection(this.firestore, 'usuarios');
    this.rolesCollection = collection(this.firestore, 'roles');
  }

  // ======================
  // ==== CRUD ROLES ======
  // ======================

  async obtenerRoles() {
    const snapshot = await getDocs(this.rolesCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async agregarRol(rol: any) {
    return await addDoc(this.rolesCollection, rol);
  }

  async actualizarRol(id: string, rol: any) {
    const ref = doc(this.firestore, `roles/${id}`);
    await updateDoc(ref, rol);
  }

  async eliminarRol(id: string) {
    const ref = doc(this.firestore, `roles/${id}`);
    await deleteDoc(ref);
  }

  // ==========================
  // ==== CRUD USUARIOS ======
  // ==========================

  async obtenerUsuarios() {
    const snapshot = await getDocs(this.usuariosCollection);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async obtenerUsuario(id: string) {
    const ref = doc(this.firestore, `usuarios/${id}`);
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  }

  async agregarUsuario(usuario: any) {
    return await addDoc(this.usuariosCollection, usuario);
  }

  async actualizarUsuario(id: string, usuario: any) {
    const ref = doc(this.firestore, `usuarios/${id}`);
    await updateDoc(ref, usuario);
  }

  async eliminarUsuario(id: string) {
    const ref = doc(this.firestore, `usuarios/${id}`);
    await deleteDoc(ref);
  }
}
