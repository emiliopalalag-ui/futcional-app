import { Injectable } from '@angular/core';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';

export interface ResponsableAtleta {
  id?: string;
  id_responsable: string;   // Padre o Responsable
  id_atleta: string;        // Atleta
  parentesco: string;
}

@Injectable({ providedIn: 'root' })
export class ResponsablesService {

  private db = getFirestore();
  private col = collection(this.db, 'responsables');

  /** LISTAR */
  async listar(): Promise<ResponsableAtleta[]> {
    const snap = await getDocs(this.col);
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as any)
    }));
  }

  /** AGREGAR */
  async agregar(data: ResponsableAtleta) {
    const ref = doc(this.col);
    await setDoc(ref, data);
  }

  /** ACTUALIZAR */
  async actualizar(data: ResponsableAtleta) {
    if (!data.id) return;
    const ref = doc(this.db, 'responsables', data.id);
    await setDoc(ref, data, { merge: true });
  }

  /** ELIMINAR */
  async eliminar(id: string) {
    const ref = doc(this.db, 'responsables', id);
    await deleteDoc(ref);
  }
}

