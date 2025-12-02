import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
export interface Rol { id?: string; nombre: string; descripcion?: string; }

@Injectable({ providedIn: 'root' })
export class RolesService {
  private collectionName = 'roles';

  constructor(private firestore: Firestore) {}

  async listarRoles() {
    const querySnapshot = await getDocs(collection(this.firestore, this.collectionName));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  async agregarRol(rol: any) {
    await addDoc(collection(this.firestore, this.collectionName), rol);
  }

  async modificarRol(id: string, data: any) {
    const ref = doc(this.firestore, `${this.collectionName}/${id}`);
    await updateDoc(ref, data);
  }

  async eliminarRol(id: string) {
    const ref = doc(this.firestore, `${this.collectionName}/${id}`);
    await deleteDoc(ref);
  }
}
