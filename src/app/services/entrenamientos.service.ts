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
  DocumentReference,
} from 'firebase/firestore';

export interface Entrenamiento {
  id?: string;
  nombre: string;
  descripcion: string;
  horario: string;
  idEntrenador: DocumentReference;
  dias: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class EntrenamientosService {

  private db = getFirestore();
  private col = collection(this.db, 'entrenamientos');

  /** LISTAR */
  async listarEntrenamientos(): Promise<Entrenamiento[]> {
    const snap = await getDocs(this.col);
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as any),
    })) as Entrenamiento[];
  }

  /** AGREGAR */
  async agregarEntrenamiento(e: Omit<Entrenamiento, 'id'>) {
    await addDoc(this.col, e);
  }

  /** OBTENER */
  async obtenerPorId(id: string): Promise<Entrenamiento | null> {
    const ref = doc(this.db, 'entrenamientos', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) };
  }

  /** ACTUALIZAR */
  async actualizarEntrenamiento(id: string, data: Partial<Entrenamiento>) {
    const ref = doc(this.db, 'entrenamientos', id);
    await setDoc(ref, data, { merge: true });
  }

  /** ELIMINAR */
  async eliminarEntrenamiento(id: string) {
    const ref = doc(this.db, 'entrenamientos', id);
    await deleteDoc(ref);
  }
}
