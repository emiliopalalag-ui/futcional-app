import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ActividadesService,
  Actividad,
} from 'src/app/services/actividades.service';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';

@Component({
  selector: 'app-actividades',
  standalone: true,
  templateUrl: './actividades.page.html',
  styleUrls: ['./actividades.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ActividadesPage implements OnInit {
  actividades: any[] = [];
  actividadesFiltradas: any[] = [];
  entrenamientos: any[] = [];

  buscar = '';
  filtroEstado = '';
  filtroEntrenamiento = '';

  modalAgregar = false;
  modalEditar = false;
  modalEliminar = false;
  modalLista = false;

  nuevaActividad: Actividad = {
    nombre: '',
    descripcion: '',
    fecha: '',
    idEntrenamiento: '',
    estado: 'Activo',
  };

  actividadEditarId: string | null = null;
  actividadEditar: Actividad | null = null;

  actividadEliminarId: string | null = null;

  constructor(
    private actividadesSrv: ActividadesService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.cargarEntrenamientos();
    await this.listarActividades();
  }

  async cargarEntrenamientos() {
    const db = getFirestore();
    const snap = await getDocs(collection(db, 'entrenamientos'));

    this.entrenamientos = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as any),
    }));
  }

  async listarActividades() {
    this.actividades = await this.actividadesSrv.listar();
    this.actividadesFiltradas = [...this.actividades];
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
    this.actividadEditarId = null;
    this.actividadEditar = null;
    this.modalEditar = true;
  }
  cerrarModalEditar() {
    this.modalEditar = false;
  }

  abrirModalEliminar() {
    this.actividadEliminarId = null;
    this.modalEliminar = true;
  }
  cerrarModalEliminar() {
    this.modalEliminar = false;
  }

  abrirModalLista() {
    this.modalLista = true;
  }

  // =====================================================
  // SELECCIÓN DE FECHA
  // =====================================================
  onFechaSeleccionada(event: any) {
    const val = event.detail.value;
    this.nuevaActividad.fecha = Array.isArray(val) ? val[0] : val;
  }

  // =====================================================
  // AGREGAR
  // =====================================================
  async guardarActividad() {
    if (
      !this.nuevaActividad.nombre ||
      !this.nuevaActividad.descripcion ||
      !this.nuevaActividad.fecha ||
      !this.nuevaActividad.idEntrenamiento
    ) {
      this.mostrarToast('Completa todos los campos', 'warning');
      return;
    }

    await this.actividadesSrv.agregar(this.nuevaActividad);
    this.mostrarToast('Actividad agregada', 'success');
    this.cerrarModalAgregar();
    this.listarActividades();
  }

  limpiarCampos() {
    this.nuevaActividad = {
      nombre: '',
      descripcion: '',
      fecha: '',
      idEntrenamiento: '',
      estado: 'Activo',
    };
  }

  // =====================================================
  // EDITAR
  // =====================================================
  cargarActividadEditar() {
    const encontrada = this.actividades.find(
      (x) => x.id === this.actividadEditarId
    );
    this.actividadEditar = encontrada ? { ...encontrada } : null;
  }

  async actualizarActividad() {
    if (!this.actividadEditar) {
      this.mostrarToast('Selecciona una actividad', 'warning');
      return;
    }

    await this.actividadesSrv.actualizar(this.actividadEditar);
    this.mostrarToast('Actividad actualizada', 'success');
    this.cerrarModalEditar();
    this.listarActividades();
  }

  // =====================================================
  // ELIMINAR (ESTADO = INACTIVO)
  // =====================================================
  async eliminarActividad() {
    if (!this.actividadEliminarId) {
      this.mostrarToast('Selecciona una actividad', 'warning');
      return;
    }

    await this.actividadesSrv.eliminar(this.actividadEliminarId);
    this.mostrarToast('Actividad eliminada', 'danger');
    this.cerrarModalEliminar();
    this.listarActividades();
  }

  // =====================================================
  // LISTA + FILTROS
  // =====================================================
  filtrarLista() {
    const texto = this.buscar.toLowerCase();

    this.actividadesFiltradas = this.actividades.filter((a) => {
      const coincideTexto =
        a.nombre.toLowerCase().includes(texto) ||
        a.descripcion.toLowerCase().includes(texto);

      const coincideEstado =
        this.filtroEstado === '' || a.estado === this.filtroEstado;

      const coincideEntrenamiento =
        this.filtroEntrenamiento === '' ||
        a.idEntrenamiento === this.filtroEntrenamiento;

      return coincideTexto && coincideEstado && coincideEntrenamiento;
    });
  }

  editarDesdeLista(a: any) {
    this.actividadEditarId = a.id;
    this.cargarActividadEditar();
    this.modalLista = false;
    this.modalEditar = true;
  }

  eliminarDesdeLista(a: any) {
    this.actividadEliminarId = a.id;
    this.modalLista = false;
    this.modalEliminar = true;
  }

  // =====================================================
  // UTILIDAD
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
