import { Injectable } from '@angular/core';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc
} from 'firebase/firestore';

export interface Pago {
  id?: string;
  id_inscripcion: string;
  fecha_inicio: string;   // periodo pagado
  fecha_fin: string;      // periodo pagado
  fecha_pago: string;     // fecha real del pago
  monto: number;
  metodo_pago: string;
  numero_pago: number;
}

@Injectable({ providedIn: 'root' })
export class PagosService {
  private db = getFirestore();

  async crear(p: Pago) {
    const id = p.id?.trim() || crypto.randomUUID();
    const ref = doc(this.db, 'pagos', id);

    const inscRef = doc(this.db, 'inscripciones', p.id_inscripcion);

    await setDoc(ref, {
      id_inscripcion: inscRef,
      fecha_inicio: p.fecha_inicio,
      fecha_fin: p.fecha_fin,
      fecha_pago: p.fecha_pago,
      monto: p.monto,
      metodo_pago: p.metodo_pago,
      numero_pago: p.numero_pago
    });

    return id;
  }

  async listar(): Promise<any[]> {
    const snap = await getDocs(collection(this.db, 'pagos'));
    const lista: any[] = [];

    for (const d of snap.docs) {
      const data = d.data() as any;

      lista.push({
        id: d.id,
        id_inscripcion: data.id_inscripcion?.id,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        fecha_pago: data.fecha_pago,
        monto: data.monto,
        metodo_pago: data.metodo_pago,
        numero_pago: data.numero_pago
      });
    }

    return lista;
  }

  async eliminar(id: string) {
    const ref = doc(this.db, 'pagos', id);
    await deleteDoc(ref);
  }
  async listarPorInscripcion(idInscripcion: string) {
  const all = await this.listar();
  return all.filter(x => x.id_inscripcion === idInscripcion);
}

}
