import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { GastosService, Gasto } from 'src/app/services/gastos.service';

import { getFirestore, collection, getDocs } from 'firebase/firestore';

@Component({
  selector: 'app-gastos',
  standalone: true,
  templateUrl: './gastos.page.html',
  styleUrls: ['./gastos.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class GastosPage implements OnInit {
  gastos: any[] = [];
  gastosFiltrados: any[] = [];
  actividades: any[] = [];

  // filtros / búsqueda
  buscar = '';
  filtroEstado = '';
  filtroActividad = '';

  // modales
  modalAgregar = false;
  modalEditar = false;
  modalEliminar = false;
  modalLista = false;

  // modelos
  nuevoGasto: Gasto = {
    descripcion: '',
    monto: 0,
    fecha: '',
    idActividad: '',
    observacion: '',
    estado: 'Activo',
  };

  gastoEditarId: string | null = null;
  gastoEditar: Gasto | null = null;

  gastoEliminarId: string | null = null;

  constructor(
    private gastosSrv: GastosService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.cargarActividades();
    await this.listarGastos();
  }

  // =====================================================
  // CARGA INICIAL
  // =====================================================

  async cargarActividades() {
    const db = getFirestore();
    const snap = await getDocs(collection(db, 'actividades'));

    this.actividades = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));
  }

  async listarGastos() {
    this.gastos = await this.gastosSrv.listar();

    // agregar nombre de actividad para mostrar en lista
    this.gastos = this.gastos.map((g) => {
      const act = this.actividades.find((a) => a.id === g.idActividad);
      return {
        ...g,
        nombreActividad: act ? act.nombre : '',
      };
    });

    this.gastosFiltrados = [...this.gastos];
  }

  // =====================================================
  // MODALES
  // =====================================================

  abrirModalAgregar() {
    this.limpiarCampos();
    this.modalAgregar = true;
  }

  cerrarModalAgregar() {
    this.modalAgregar = false;
  }

  abrirModalEditar() {
    this.gastoEditarId = null;
    this.gastoEditar = null;
    this.modalEditar = true;
  }

  cerrarModalEditar() {
    this.modalEditar = false;
  }

  abrirModalEliminar() {
    this.gastoEliminarId = null;
    this.modalEliminar = true;
  }

  cerrarModalEliminar() {
    this.modalEliminar = false;
  }

  abrirModalLista() {
    this.modalLista = true;
  }

  // =====================================================
  // FECHA
  // =====================================================

  onFechaSeleccionada(event: any) {
    const val = event.detail.value;
    this.nuevoGasto.fecha = Array.isArray(val) ? val[0] : val;
  }

  // =====================================================
  // AGREGAR
  // =====================================================

  async guardarGasto() {
    if (
      !this.nuevoGasto.descripcion ||
      !this.nuevoGasto.idActividad ||
      !this.nuevoGasto.fecha ||
      this.nuevoGasto.monto <= 0
    ) {
      this.mostrarToast('Completa todos los campos y monto > 0', 'warning');
      return;
    }

    await this.gastosSrv.agregar(this.nuevoGasto);

    this.mostrarToast('Gasto registrado', 'success');
    this.cerrarModalAgregar();
    this.listarGastos();
  }

  limpiarCampos() {
    this.nuevoGasto = {
      descripcion: '',
      monto: 0,
      fecha: '',
      idActividad: '',
      observacion: '',
      estado: 'Activo',
    };
  }

  // =====================================================
  // EDITAR
  // =====================================================

  cargarGastoEditar() {
    const encontrado = this.gastos.find((g) => g.id === this.gastoEditarId);
    this.gastoEditar = encontrado ? { ...encontrado } : null;
  }

  async actualizarGasto() {
    if (!this.gastoEditar) {
      this.mostrarToast('Selecciona un gasto', 'warning');
      return;
    }

    // asegurar idActividad
    if (!this.gastoEditar.idActividad) {
      this.mostrarToast('Selecciona una actividad', 'warning');
      return;
    }

    await this.gastosSrv.actualizar(this.gastoEditar);
    this.mostrarToast('Gasto actualizado', 'success');
    this.cerrarModalEditar();
    this.listarGastos();
  }

  // =====================================================
  // ELIMINAR (INACTIVO)
  // =====================================================

  async eliminarGasto() {
    if (!this.gastoEliminarId) {
      this.mostrarToast('Selecciona un gasto', 'warning');
      return;
    }

    await this.gastosSrv.eliminar(this.gastoEliminarId);
    this.mostrarToast('Gasto eliminado', 'danger');
    this.cerrarModalEliminar();
    this.listarGastos();
  }

  // =====================================================
  // LISTA + FILTROS
  // =====================================================

  filtrarLista() {
    const texto = this.buscar.toLowerCase().trim();

    this.gastosFiltrados = this.gastos.filter((g) => {
      const coincideTexto =
        g.descripcion.toLowerCase().includes(texto) ||
        (g.observacion || '').toLowerCase().includes(texto);

      const coincideEstado =
        this.filtroEstado === '' || g.estado === this.filtroEstado;

      const coincideActividad =
        this.filtroActividad === '' || g.idActividad === this.filtroActividad;

      return coincideTexto && coincideEstado && coincideActividad;
    });
  }

  editarDesdeLista(g: any) {
    this.gastoEditarId = g.id;
    this.cargarGastoEditar();
    this.modalLista = false;
    this.modalEditar = true;
  }

  eliminarDesdeLista(g: any) {
    this.gastoEliminarId = g.id;
    this.modalLista = false;
    this.modalEliminar = true;
  }

  // =====================================================
  // UTIL
  // =====================================================

  async mostrarToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 1800,
      color,
    });
    toast.present();
  }
}
