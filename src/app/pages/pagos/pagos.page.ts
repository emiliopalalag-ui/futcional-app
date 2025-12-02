import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PagosService } from 'src/app/services/pagos.service';
import { InscripcionesService } from 'src/app/services/inscripciones.service';

@Component({
  selector: 'app-pagos',
  standalone: true,
  templateUrl: './pagos.page.html',
  styleUrls: ['./pagos.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class PagosPage implements OnInit {

  // 🔵 MODALES
  modalAgregar = false;
  modalLista = false;
  modalHistorial = false;
  modalEliminar = false;

  // 🔵 LISTAS PRINCIPALES
  inscripciones: any[] = [];
  inscripcionesBonitas: any[] = [];
  pagos: any[] = [];
  pagosFiltrados: any[] = [];
  historialPagos: any[] = [];

  // 🔵 NUEVO PAGO (RENOVACIÓN)
  pagoNuevo: any = {
    id_inscripcion: '',
    atleta: '',
    entrenamiento: '',
    monto: 0,
    metodo_pago: 'Efectivo',
    fecha_pago: new Date().toISOString(),
  };

  // 🔵 BUSQUEDA Y FILTROS
  buscar = '';
  filtroMetodo = '';
  ordenarPor = '';

  // 🔵 ELIMINAR
  pagoEliminar: any = null;


  constructor(
    private pagosSrv: PagosService,
    private inscSrv: InscripcionesService,
    private toastCtrl: ToastController
  ) {}

  // =========================================================
  // INIT
  // =========================================================
  async ngOnInit() {
    await this.cargarInscripciones();
    await this.cargarPagos();
  }


  // =========================================================
  // CARGAR INSCRIPCIONES
  // =========================================================
  async cargarInscripciones() {
    const lista = await this.inscSrv.listar();
    this.inscripciones = lista;

    // Crear lista "bonita" para el select
    this.inscripcionesBonitas = [];

    for (const i of lista) {
      // Obtener atleta
      const atletaSnap = await this.inscSrv.obtenerAtleta(i.idAtleta);
      const atleta = (atletaSnap?.nombre || '') + ' ' + (atletaSnap?.apellido || '');

      // Obtener entrenamiento
      const entSnap = await this.inscSrv.obtenerEntrenamiento(i.idEntrenamiento);
      const entrenamiento = entSnap?.nombre || '';

      this.inscripcionesBonitas.push({
        id: i.id,
        atleta,
        entrenamiento,
        texto: `${atleta} — ${entrenamiento} — ${i.estado}`,
      });
    }
  }


  // =========================================================
  // CARGAR PAGOS
  // =========================================================
  async cargarPagos() {
    const raw = await this.pagosSrv.listar();
    this.pagos = [];

    for (const p of raw) {
      // Obtener inscripción relacionada
      const ins = this.inscripciones.find(x => x.id === p.id_inscripcion);
      if (!ins) continue;

      // Obtener atleta
      const atletaSnap = await this.inscSrv.obtenerAtleta(ins.idAtleta);
      const atleta = (atletaSnap?.nombre || '') + ' ' + (atletaSnap?.apellido || '');

      // Obtener entrenamiento
      const entSnap = await this.inscSrv.obtenerEntrenamiento(ins.idEntrenamiento);
      const entrenamiento = entSnap?.nombre || '';

      // Número de pago (contar pagos de esa inscripción)
      const listaPagosIns = await this.pagosSrv.listarPorInscripcion(ins.id);
      const numeroPago = listaPagosIns.length > 0
        ? Math.max(...listaPagosIns.map((x: any) => x.numero_pago || 1))
        : 1;

      this.pagos.push({
        ...p,
        atleta,
        entrenamiento,
        numero_pago: numeroPago,
      });
    }

    this.pagosFiltrados = [...this.pagos];
  }


  // =========================================================
  // ABRIR AGREGAR (RENOVAR)
  // =========================================================
  abrirModalAgregar() {
    this.pagoNuevo = {
      id_inscripcion: '',
      atleta: '',
      entrenamiento: '',
      monto: 0,
      metodo_pago: 'Efectivo',
      fecha_pago: new Date().toISOString(),
    };
    this.modalAgregar = true;
  }


  seleccionarInscripcionNuevo() {
    const ins = this.inscripcionesBonitas.find(
      x => x.id === this.pagoNuevo.id_inscripcion
    );

    if (!ins) return;

    this.pagoNuevo.atleta = ins.atleta;
    this.pagoNuevo.entrenamiento = ins.entrenamiento;
  }


  // =========================================================
  // GUARDAR NUEVO PAGO (RENOVACIÓN)
  // =========================================================
  async guardarNuevoPago() {
    if (!this.pagoNuevo.id_inscripcion || !this.pagoNuevo.monto) {
      return this.mostrarToast('Completa todos los campos');
    }

    // 1️⃣ Buscar inscripción base
    const ins = this.inscripciones.find(
      x => x.id === this.pagoNuevo.id_inscripcion
    );

    if (!ins) {
      return this.mostrarToast('No se encontró la inscripción seleccionada');
    }

    // 2️⃣ Listar pagos anteriores de esa inscripción
    const pagosIns = await this.pagosSrv.listarPorInscripcion(ins.id);
    let numero_pago = 1;
    let fecha_inicio: string;

    if (pagosIns.length > 0) {
      // Tomar el pago con mayor numero_pago como último
      const ultimo = pagosIns.reduce((acc: any, cur: any) =>
        (cur.numero_pago || 1) > (acc.numero_pago || 1) ? cur : acc,
        pagosIns[0]
      );

      numero_pago = (ultimo.numero_pago || 1) + 1;
      fecha_inicio = ultimo.fecha_fin;   // 👉 opción C: inicia donde termina el último pago
    } else {
      // No hay pagos → primer pago de renovación: partir de la propia inscripción
      numero_pago = 1;
      fecha_inicio = ins.fecha_inicio;   // viene de inscripciones.service.ts
    }

    // 3️⃣ Calcular fecha_fin = fecha_inicio + 1 mes
    const baseDate = new Date(fecha_inicio);
    baseDate.setMonth(baseDate.getMonth() + 1);
    const fecha_fin = baseDate.toISOString();

    // 4️⃣ fecha_pago = lo que el usuario seleccionó (o ahora)
    const fecha_pago = this.pagoNuevo.fecha_pago || new Date().toISOString();

    // 5️⃣ Crear pago en Firestore con el nuevo modelo
    await this.pagosSrv.crear({
      id_inscripcion: ins.id,
      fecha_inicio,
      fecha_fin,
      fecha_pago,
      monto: this.pagoNuevo.monto,
      metodo_pago: this.pagoNuevo.metodo_pago,
      numero_pago
    });

    this.mostrarToast('Pago registrado');
    this.modalAgregar = false;
    await this.cargarPagos();
  }


  // =========================================================
  // MODAL LISTA
  // =========================================================
  abrirModalLista() {
    this.modalLista = true;
    this.aplicarFiltros();
  }


  aplicarFiltros() {
    let arr = [...this.pagos];

    if (this.buscar.trim() !== '') {
      const b = this.buscar.toLowerCase();
      arr = arr.filter(
        x =>
          (x.atleta || '').toLowerCase().includes(b) ||
          (x.entrenamiento || '').toLowerCase().includes(b)
      );
    }

    if (this.filtroMetodo !== '') {
      arr = arr.filter(x => x.metodo_pago === this.filtroMetodo);
    }

    if (this.ordenarPor === 'fecha') {
      arr = arr.sort((a, b) => a.fecha_pago.localeCompare(b.fecha_pago));
    }

    if (this.ordenarPor === 'monto') {
      arr = arr.sort((a, b) => a.monto - b.monto);
    }

    this.pagosFiltrados = arr;
  }


  // =========================================================
  // HISTORIAL
  // =========================================================
  async abrirHistorial(idInscripcion: string) {
    const lista = await this.pagosSrv.listarPorInscripcion(idInscripcion);
    this.historialPagos = lista;
    this.modalHistorial = true;
  }


  // =========================================================
  // ELIMINAR
  // =========================================================
  abrirEliminarDesdeLista(pago: any) {
    this.pagoEliminar = pago;
    this.modalEliminar = true;
  }

  async confirmarEliminar() {
    await this.pagosSrv.eliminar(this.pagoEliminar.id);
    await this.mostrarToast('Eliminado');
    this.modalEliminar = false;
    await this.cargarPagos();
  }


  // =========================================================
  // UTIL
  // =========================================================
  async mostrarToast(msg: string) {
    const t = await this.toastCtrl.create({
      message: msg,
      duration: 1500,
    });
    t.present();
  }
}
