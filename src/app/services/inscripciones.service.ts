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

import { PagosService } from './pagos.service';

export interface Inscripcion {
  id?: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  idEntrenamiento: string;
  idAtleta: string;
  observaciones?: string;
  monto_pagado?: number;
  metodo_pago?: string;
}

@Injectable({ providedIn: 'root' })
export class InscripcionesService {
  private db = getFirestore();

  constructor(private pagoSrv: PagosService) {}

  // ============================================================
  // 🔹 LISTAR INSCRIPCIONES (CON NOMBRES)
  // ============================================================
  async listar(): Promise<any[]> {
    const snap = await getDocs(collection(this.db, 'inscripciones'));
    const lista: any[] = [];

    for (const d of snap.docs) {
      const data = d.data() as any;

      const entRef = data.id_entrenamiento;
      const atlRef = data.id_atleta;

      let nombreEntrenamiento = "";
      let nombreAtleta = "";

      // ENTRENAMIENTO ------------------------------------------
      if (entRef) {
        const entSnap = await getDoc(entRef);
        if (entSnap.exists()) {
          const e = entSnap.data() as any;
          nombreEntrenamiento = e.nombre || "";
        }
      }

      // ATLETA --------------------------------------------------
      if (atlRef) {
        const atlSnap = await getDoc(atlRef);
        if (atlSnap.exists()) {
          const a = atlSnap.data() as any;
          nombreAtleta = `${a.nombre || ""} ${a.apellido || ""}`.trim();
        }
      }

      lista.push({
        id: d.id,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        estado: data.estado || "Activo",
        idEntrenamiento: entRef?.id || "",
        idAtleta: atlRef?.id || "",
        observaciones: data.observaciones || "",
        monto_pagado: data.monto_pagado || 0,
        metodo_pago: data.metodo_pago || "",

        // ➕ Nombres añadidos
        nombreEntrenamiento,
        nombreAtleta,
      });
    }

    return lista;
  }

  // ============================================================
  // 🔹 AGREGAR INSCRIPCIÓN + PRIMER PAGO
  // ============================================================
  async agregar(i: Inscripcion) {
    const id = i.id?.trim() || crypto.randomUUID();
    const ref = doc(this.db, 'inscripciones', id);

    const entrenamientoRef = doc(this.db, 'entrenamientos', i.idEntrenamiento);
    const atletaRef = doc(this.db, 'usuarios', i.idAtleta);

    // Guardar inscripción --------------------------------------
    await setDoc(ref, {
      fecha_inicio: i.fecha_inicio,
      fecha_fin: i.fecha_fin,
      estado: i.estado || 'Activo',
      id_entrenamiento: entrenamientoRef,
      id_atleta: atletaRef,
      observaciones: i.observaciones || '',
      monto_pagado: i.monto_pagado ?? 0,
      metodo_pago: i.metodo_pago || 'Efectivo'
    });

    // Crear el PRIMER PAGO -------------------------------------
    await this.pagoSrv.crear({
      id_inscripcion: id,
      fecha_inicio: i.fecha_inicio,
      fecha_fin: i.fecha_fin,
      fecha_pago: i.fecha_inicio, // fecha real del pago
      monto: i.monto_pagado ?? 0,
      metodo_pago: i.metodo_pago || 'Efectivo',
      numero_pago: 1
    });
  }

  // ============================================================
  // 🔹 ACTUALIZAR INSCRIPCIÓN
  // ============================================================
  async actualizar(i: Inscripcion) {
    if (!i.id) throw new Error('ID requerido');

    const ref = doc(this.db, 'inscripciones', i.id);
    const entrenamientoRef = doc(this.db, 'entrenamientos', i.idEntrenamiento);
    const atletaRef = doc(this.db, 'usuarios', i.idAtleta);

    await setDoc(
      ref,
      {
        fecha_inicio: i.fecha_inicio,
        fecha_fin: i.fecha_fin,
        estado: i.estado || 'Activo',
        id_entrenamiento: entrenamientoRef,
        id_atleta: atletaRef,
        observaciones: i.observaciones || '',
        monto_pagado: i.monto_pagado ?? 0,
        metodo_pago: i.metodo_pago || '',
      },
      { merge: true }
    );
  }

  // ============================================================
  // 🔹 SUSPENDER INSCRIPCIÓN
  // ============================================================
  async eliminar(id: string) {
    const ref = doc(this.db, 'inscripciones', id);
    await setDoc(ref, { estado: "Suspendido" }, { merge: true });
  }

  // ============================================================
  // 🔹 LISTAR INSCRITOS POR ENTRENAMIENTO
  // ============================================================
  async listarPorEntrenamiento(idEntrenamiento: string): Promise<any[]> {
    const entrenamientoRef = doc(this.db, 'entrenamientos', idEntrenamiento);

    const q = query(
      collection(this.db, 'inscripciones'),
      where('id_entrenamiento', '==', entrenamientoRef)
    );

    const snap = await getDocs(q);
    const inscritos: any[] = [];

    for (const insc of snap.docs) {
      const data = insc.data() as any;

      if (data.id_atleta) {
        const atletaSnap = await getDoc(data.id_atleta);

        if (atletaSnap.exists()) {
          const a = atletaSnap.data() as any;

          inscritos.push({
            id: insc.id,
            nombre: `${a.nombre} ${a.apellido}`,
            correo: a.correo,
            estado: data.estado,
            observaciones: data.observaciones || '',
            monto: data.monto_pagado || 0,
          });
        }
      }
    }

    return inscritos;
  }

  // ============================================================
  // 🔹 Obtener ATLETA (para pagos.page.ts)
  // ============================================================
  async obtenerAtleta(id: string): Promise<any> {
    if (!id) return null;
    const ref = doc(this.db, 'usuarios', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as any;
  }

  // ============================================================
  // 🔹 Obtener ENTRENAMIENTO (para pagos.page.ts)
  // ============================================================
  async obtenerEntrenamiento(id: string): Promise<any> {
    if (!id) return null;
    const ref = doc(this.db, 'entrenamientos', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as any;
  }
}
