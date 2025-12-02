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
} from 'firebase/firestore';

export interface Gasto {
  id?: string;
  descripcion: string;
  monto: number;
  fecha: string;
  idActividad: string;   // ID del doc de actividad
  observacion: string;
  estado: string;        // Activo | Inactivo
}

@Injectable({ providedIn: 'root' })
export class GastosService {
  private db = getFirestore();

  /** 🔹 Listar todos los gastos (activos + inactivos) */
  async listar(): Promise<any[]> {
    const snap = await getDocs(collection(this.db, 'gastos'));

    return snap.docs.map((d) => {
      const data = d.data() as any;

      return {
        id: d.id,
        descripcion: data.descripcion,
        monto: data.monto,
        fecha: data.fecha,
        observacion: data.observacion ?? '',
        estado: data.estado ?? 'Activo',
        // recuperar id de la actividad (DocumentReference)
        idActividad:
          (data.id_actividad && (data.id_actividad as any).id) ||
          data.idActividad ||
          '',
      };
    });
  }

  /** 🔹 Agregar gasto */
  async agregar(g: Gasto) {
    const id = g.id?.trim() || crypto.randomUUID();
    const ref = doc(this.db, 'gastos', id);

    const actRef = doc(this.db, 'actividades', g.idActividad);

    await setDoc(ref, {
      descripcion: g.descripcion,
      monto: g.monto,
      fecha: g.fecha,
      observacion: g.observacion ?? '',
      estado: g.estado || 'Activo',
      id_actividad: actRef,
    });
  }

  /** 🔹 Actualizar gasto */
  async actualizar(g: Gasto) {
    if (!g.id) throw new Error('ID requerido para actualizar');

    const ref = doc(this.db, 'gastos', g.id);
    const actRef = doc(this.db, 'actividades', g.idActividad);

    await setDoc(
      ref,
      {
        descripcion: g.descripcion,
        monto: g.monto,
        fecha: g.fecha,
        observacion: g.observacion ?? '',
        estado: g.estado,
        id_actividad: actRef,
      },
      { merge: true }
    );
  }

  /** 🔹 Eliminar lógico (Inactivo) */
  async eliminar(id: string) {
    const ref = doc(this.db, 'gastos', id);

    await setDoc(
      ref,
      {
        estado: 'Inactivo',
      },
      { merge: true }
    );
  }

  /** 🔹 Listar gastos por actividad */
  async listarPorActividad(idActividad: string): Promise<any[]> {
    const actRef = doc(this.db, 'actividades', idActividad);

    const q = query(
      collection(this.db, 'gastos'),
      where('id_actividad', '==', actRef)
    );

    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      const data = d.data() as any;

      return {
        id: d.id,
        descripcion: data.descripcion,
        monto: data.monto,
        fecha: data.fecha,
        observacion: data.observacion ?? '',
        estado: data.estado ?? 'Activo',
        idActividad,
      };
    });
  }
}
