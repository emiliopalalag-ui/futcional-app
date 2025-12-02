import { Injectable } from '@angular/core';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

export interface Usuario {
  id?: string;              
  carnet?: string;          
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  telefono: string;
  fecha_nacimiento: string;
  genero: string;
  rol: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private db = getFirestore();
  private col = collection(this.db, 'usuarios');

  /** 🔹 Listar (solo activos + inactivos) */
  async listarUsuarios(): Promise<Usuario[]> {
    const snap = await getDocs(this.col);

    return snap.docs
      .map((d) => {
        const data = d.data() as any;

        return {
          id: d.id,
          carnet: data.carnet,
          nombre: data.nombre,
          apellido: data.apellido,
          correo: data.correo,
          password: data.password,
          telefono: data.telefono,
          fecha_nacimiento: data.fecha_nacimiento,
          genero: data.genero,
          estado: data.estado,
          rol: typeof data.rol === 'object' && data.rol.id ? data.rol.id : data.rol
        } as Usuario;
      })
      .filter(u => u.estado !== "Suspendido"); // ← NO mostrar suspendidos
  }

  /** 🔹 Agregar usuario con AUTO-ID */
  async agregarUsuario(u: Usuario) {

    // Crear ID autogenerado
    const ref = doc(this.col);

    const rolRef = doc(this.db, 'roles', u.rol);

    await setDoc(ref, {
      carnet: u.carnet ?? "",
      nombre: u.nombre,
      apellido: u.apellido,
      correo: u.correo,
      password: u.password,
      telefono: u.telefono,
      fecha_nacimiento: u.fecha_nacimiento,
      genero: u.genero,
      estado: u.estado ?? "Activo",
      rol: rolRef
    });
  }

  /** 🔹 Obtener */
  async obtenerPorId(id: string): Promise<Usuario | null> {
    const ref = doc(this.db, 'usuarios', id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const data = snap.data() as any;

    return {
      id: snap.id,
      carnet: data.carnet,
      nombre: data.nombre,
      apellido: data.apellido,
      correo: data.correo,
      password: data.password,
      telefono: data.telefono,
      fecha_nacimiento: data.fecha_nacimiento,
      genero: data.genero,
      estado: data.estado,
      rol: typeof data.rol === 'object' && data.rol.id ? data.rol.id : data.rol
    };
  }

  /** 🔹 Actualizar */
  async actualizarUsuario(u: Usuario) {
    const ref = doc(this.db, 'usuarios', u.id!);
    const rolRef = doc(this.db, 'roles', u.rol);

    await setDoc(ref, {
      carnet: u.carnet,
      nombre: u.nombre,
      apellido: u.apellido,
      correo: u.correo,
      password: u.password,
      telefono: u.telefono,
      fecha_nacimiento: u.fecha_nacimiento,
      genero: u.genero,
      estado: u.estado,
      rol: rolRef
    }, { merge: true });
  }

  /** 🔹 "Eliminar" = SUSPENDER */
  async eliminarUsuario(id: string) {
    const ref = doc(this.db, 'usuarios', id);

    await setDoc(ref, {
      estado: "Suspendido"
    }, { merge: true });
  }
}
