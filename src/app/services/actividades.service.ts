import { Injectable } from '@angular/core';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  getDoc,
} from 'firebase/firestore';

export interface Actividad {
  id?: string;
  nombre: string;
  descripcion: string;
  fecha: string;
  idEntrenamiento: string;
  estado: string; // ✔ agregado
}

@Injectable({ providedIn: 'root' })
export class ActividadesService {
  private db = getFirestore();

  // 🔹 Listar todas las actividades activas e inactivas
  async listar(): Promise<any[]> {
    const snap = await getDocs(collection(this.db, 'actividades'));
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      idEntrenamiento:
        (d.data() as any).id_entrenamiento?.id || (d.data() as any).idEntrenamiento,
    }));
  }

  // 🔹 Agregar actividad
  async agregar(a: Actividad) {
    const id = a.id?.trim() || crypto.randomUUID();
    const ref = doc(this.db, 'actividades', id);

    const entrenamientoRef = doc(this.db, 'entrenamientos', a.idEntrenamiento);

    await setDoc(ref, {
      nombre: a.nombre,
      descripcion: a.descripcion,
      fecha: a.fecha,
      estado: a.estado || 'Activo',
      id_entrenamiento: entrenamientoRef,
    });
  }

  // 🔹 Actualizar actividad
  async actualizar(a: Actividad) {
    if (!a.id) throw new Error('ID requerido para actualizar');

    const ref = doc(this.db, 'actividades', a.id);
    const entrenamientoRef = doc(this.db, 'entrenamientos', a.idEntrenamiento);

    await setDoc(
      ref,
      {
        nombre: a.nombre,
        descripcion: a.descripcion,
        fecha: a.fecha,
        estado: a.estado,
        id_entrenamiento: entrenamientoRef,
      },
      { merge: true }
    );
  }

  // 🔹 Eliminar (cambiar estado a inactivo)
  async eliminar(id: string) {
    const ref = doc(this.db, 'actividades', id);

    await setDoc(
      ref,
      {
        estado: 'Inactivo',
      },
      { merge: true }
    );
  }

  // 🔹 Listar por entrenamiento
  async listarPorEntrenamiento(idEntrenamiento: string): Promise<any[]> {
    const entrenamientoRef = doc(this.db, 'entrenamientos', idEntrenamiento);
    const q = query(
      collection(this.db, 'actividades'),
      where('id_entrenamiento', '==', entrenamientoRef)
    );

    const snap = await getDocs(q);

    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      idEntrenamiento,
    }));
  }
}
