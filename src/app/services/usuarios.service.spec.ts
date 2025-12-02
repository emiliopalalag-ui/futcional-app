import { Injectable } from '@angular/core';
import {
  getFirestore, collection, getDocs,
  addDoc, updateDoc, deleteDoc, doc, getDoc, query, where
} from 'firebase/firestore';

export interface Usuario {
  id?: string;              // CI
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  telefono: string;
  fecha_nacimiento: string;
  genero: string;
  rol: string;              // ID del rol
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private db = getFirestore();
  private colRef = collection(this.db, 'usuarios');

  /** 🔹 Listar todos los usuarios */
  async listar(): Promise<Usuario[]> {
    const snapshot = await getDocs(this.colRef);
    return snapshot.docs.map(docu => ({
      id: docu.id,
      ...(docu.data() as Usuario)
    }));
  }

  /** 🔹 Obtener un usuario por su ID */
  async obtenerPorId(id: string): Promise<Usuario | null> {
    try {
      const ref = doc(this.db, 'usuarios', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return { id: snap.id, ...(snap.data() as Usuario) };
      } else {
        console.warn(`Usuario con id ${id} no encontrado`);
        return null;
      }
    } catch (err) {
      console.error('Error al obtener usuario:', err);
      return null;
    }
  }

  /** 🔹 (Opcional) Listar solo los usuarios con rol "atleta" */
  async listarAtletas(): Promise<Usuario[]> {
    try {
      const q = query(this.colRef, where('rol', '==', '/roles/atleta'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(docu => ({
        id: docu.id,
        ...(docu.data() as Usuario)
      }));
    } catch (err) {
      console.error('Error al listar atletas:', err);
      return [];
    }
  }

  async agregar(usuario: Usuario) {
    await addDoc(this.colRef, usuario as any);
  }

  async actualizar(id: string, usuario: Usuario) {
    await updateDoc(doc(this.db, 'usuarios', id), usuario as any);
  }

  async eliminar(id: string) {
    await deleteDoc(doc(this.db, 'usuarios', id));
  }
}
