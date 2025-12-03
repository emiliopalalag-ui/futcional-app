import { Injectable } from '@angular/core';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore';

export interface Rol {
  id?: string;
  nombre: string;
  descripcion: string;
  AccesoApp: boolean;
  Estado: string;
  modulos?: string[]; // 🔥 NUEVO
}


@Injectable({ providedIn: 'root' })
export class RolesService {

  private db = getFirestore();
  private col = collection(this.db, 'roles');

  // =============================
  // 🔹 LISTAR
  // =============================
  async listar(): Promise<Rol[]> {
    const snap = await getDocs(this.col);

    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as any)
    })) as Rol[];
  }

  // =============================
  // 🔹 AGREGAR (ESTÁNDAR SISTEMA)
  // =============================
  async agregar(rol: Omit<Rol, 'id'>) {
    await addDoc(this.col, rol);
  }

  // =============================
  // 🔹 OBTENER POR ID
  // =============================
  async obtener(id: string): Promise<Rol | null> {
    const ref = doc(this.db, 'roles', id);
    const snap = await getDoc(ref);
    return snap.exists() ? { id: snap.id, ...(snap.data() as any) } : null;
  }

  // =============================
  // 🔹 ACTUALIZAR
  // =============================
  async actualizar(id: string, data: Partial<Rol>) {
    const ref = doc(this.db, 'roles', id);
    await setDoc(ref, data, { merge: true });
  }

  // =============================
  // 🔹 ELIMINAR
  // =============================
  async eliminar(id: string) {
    const ref = doc(this.db, 'roles', id);
    await deleteDoc(ref);
  }
}
