import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  query,
  where
} from 'firebase/firestore';

import { Router } from '@angular/router';
import { InscripcionesService, Inscripcion } from 'src/app/services/inscripciones.service';

interface InscripcionConNombres extends Inscripcion {
  nombreEntrenamiento?: string;
  nombreAtleta?: string;
}

@Component({
  selector: 'app-inscripciones',
  standalone: true,
  templateUrl: './inscripciones.page.html',
  styleUrls: ['./inscripciones.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class InscripcionesPage implements OnInit {

  private db = getFirestore();

  entrenamientos: any[] = [];
  atletas: any[] = [];
  inscripciones: InscripcionConNombres[] = [];

  atletasFiltrados: any[] = [];

  modalAgregar = false;
  modalEditar = false;
  modalEliminar = false;

  nuevo: Inscripcion = {
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'Activo',
    idEntrenamiento: '',
    idAtleta: '',
    observaciones: '',
    monto_pagado: 0,
    metodo_pago: 'Efectivo'
  };
modalLista = false;

buscarInsc = "";
filtroEstadoInsc = "";

inscripcionesFiltradas: InscripcionConNombres[] = [];
filtrarInscripciones() {

  const texto = this.buscarInsc.toLowerCase().trim();

  this.inscripcionesFiltradas = this.inscripciones.filter(i => {

    const coincideTexto =
      (i.nombreAtleta?.toLowerCase().includes(texto)) ||
      (i.nombreEntrenamiento?.toLowerCase().includes(texto));

    const coincideEstado =
      this.filtroEstadoInsc === "" || i.estado === this.filtroEstadoInsc;

    return coincideTexto && coincideEstado;
  });
}

  inscripcionEditarId: string | null = null;
  inscripcionEditar: InscripcionConNombres | null = null;

  constructor(
    private inscSrv: InscripcionesService,
    private toastCtrl: ToastController,
    private router: Router
  ) {}

  formatearFecha(fechaISO: string) {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);

    return fecha.toLocaleString('es-BO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // ================= INITIALIZAR =====================
  async ngOnInit() {
    await this.cargarEntrenamientos();
    await this.cargarAtletas();
    await this.listarInscripciones();
  }

  async cargarEntrenamientos() {
    const snap = await getDocs(collection(this.db, 'entrenamientos'));
    this.entrenamientos = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  }

  async cargarAtletas() {
    const rolRef = doc(this.db, 'roles', 'Atleta');
    const q = query(collection(this.db, 'usuarios'), where('rol', '==', rolRef));
    const snap = await getDocs(q);
    this.atletas = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    this.atletasFiltrados = [...this.atletas];
  }

 async listarInscripciones() {
  this.inscripciones = await this.inscSrv.listar();
  this.filtrarInscripciones();
}
abrirModalLista() {
  this.filtrarInscripciones();
  this.modalLista = true;
}
editarDesdeListaInsc(i: InscripcionConNombres) {
  this.inscripcionEditarId = i.id || null;
  this.selectInscripcionEditar();
  this.modalLista = false;
  this.modalEditar = true;
}
eliminarDesdeListaInsc(i: InscripcionConNombres) {
  this.inscripcionEditarId = i.id || null;
  this.modalLista = false;
  this.modalEliminar = true;
}



  // ==================== FILTRAR ATLETAS ====================
  filtrarAtletas(entrenamientoId: string) {
    if (!entrenamientoId) {
      this.atletasFiltrados = [...this.atletas];
      return;
    }

    const inscritos = this.inscripciones
      .filter(i =>
        i.idEntrenamiento === entrenamientoId ||
        (i as any).id_entrenamiento === entrenamientoId
      )
      .map(i => i.idAtleta || (i as any).id_atleta);

    this.atletasFiltrados = this.atletas.filter(a => !inscritos.includes(a.id));

    if (inscritos.includes(this.nuevo.idAtleta)) {
      this.nuevo.idAtleta = '';
    }
  }

  // ==================== FECHAS ====================
  seleccionarFecha(event: any) {
    const fecha = event.detail.value;
    if (!fecha) return;

    this.nuevo.fecha_inicio = fecha;

    const fini = new Date(fecha);
    fini.setMonth(fini.getMonth() + 1);

    this.nuevo.fecha_fin = fini.toISOString();
  }

  // ==================== AGREGAR ====================
  abrirModalAgregar() {
    this.modalAgregar = true;
  }

  cerrarModalAgregar() {
    this.modalAgregar = false;

    // Reiniciar datos
    this.nuevo = {
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'Activo',
      idEntrenamiento: '',
      idAtleta: '',
      observaciones: '',
      monto_pagado: 0,
      metodo_pago: 'Efectivo'
    };

    this.atletasFiltrados = [...this.atletas];
  }

  async guardar() {
    if (!this.nuevo.fecha_inicio || !this.nuevo.idAtleta || !this.nuevo.idEntrenamiento) {
      this.mostrarToast("Completa todos los campos");
      return;
    }

    await this.inscSrv.agregar(this.nuevo);
    this.mostrarToast("Inscripción creada");

    this.cerrarModalAgregar();
    this.listarInscripciones();
  }

  // ==================== EDITAR ====================
  abrirModalEditar() {
    this.modalEditar = true;
  }

  cerrarModalEditar() {
    this.modalEditar = false;
  }

  selectInscripcionEditar() {
    const ins = this.inscripciones.find(x => x.id === this.inscripcionEditarId);
    if (ins) {
      this.inscripcionEditar = { ...ins };
    }
  }

  async actualizar() {
    if (!this.inscripcionEditar) return;

    await this.inscSrv.actualizar(this.inscripcionEditar);
    this.mostrarToast("Inscripción actualizada");
    this.cerrarModalEditar();
    this.listarInscripciones();
  }

  // ==================== ELIMINAR ====================
  abrirModalEliminar() {
    this.modalEliminar = true;
  }

  cerrarModalEliminar() {
    this.modalEliminar = false;
  }

  async eliminar() {
    if (!this.inscripcionEditarId) return;

    await this.inscSrv.eliminar(this.inscripcionEditarId);
    this.mostrarToast("Inscripción suspendida");
    this.cerrarModalEliminar();
    this.listarInscripciones();
  }

  // ==================== UTIL ====================
  async mostrarToast(msg: string) {
    const t = await this.toastCtrl.create({
      message: msg,
      duration: 1800
    });
    t.present();
  }

  irAPagos() {
    this.router.navigate(['/pagos']);
  }
}

