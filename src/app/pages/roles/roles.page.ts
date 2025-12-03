import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RolesService, Rol } from 'src/app/services/roles.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  templateUrl: './roles.page.html',
  styleUrls: ['./roles.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RolesPage implements OnInit {

  roles: Rol[] = [];
  rolesFiltrados: Rol[] = [];

  buscar = '';

  // MODALES
  modalAgregar = false;
  modalEditar = false;
  modalEliminar = false;
  modalLista = false;
  modalModulos = false;  // 🔥 nuevo modal

  // LISTA DE MODULOS DISPONIBLES
  listaModulos = [
    'Usuarios',
    'Roles',
    'Entrenamientos',
    'Inscripciones',
    'Pagos',
    'Actividades',
    'Gastos',
    'Responsables de Atletas',
    'Informes'
  ];

  // Agregar
  seleccionModulos: string[] = [];

  nuevoRol: Rol = {
    nombre: '',
    descripcion: '',
    AccesoApp: false,
    Estado: 'Activo',
    modulos: []
  };

  // Editar
  rolEditarId: string | null = null;
  rolEditar: Rol | null = null;

  // Eliminar
  rolEliminarId: string | null = null;

  constructor(
    private rolSrv: RolesService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.listar();
  }

  async listar() {
    this.roles = await this.rolSrv.listar();

    // Normalizar descripcion (por si viene con tilde)
    this.roles = this.roles.map(r => ({
      ...r,
      descripcion: (r as any).descripcion || (r as any)['descripción'] || '',
      modulos: r.modulos || []
    }));

    this.rolesFiltrados = [...this.roles];
  }

  filtrar() {
    const t = this.buscar.toLowerCase();
    this.rolesFiltrados = this.roles.filter(r =>
      r.nombre.toLowerCase().includes(t) ||
      (r.descripcion || '').toLowerCase().includes(t)
    );
  }

  // ===========================
  //      AGREGAR
  // ===========================
  abrirAgregar() {
    this.nuevoRol = {
      nombre: '',
      descripcion: '',
      AccesoApp: false,
      Estado: 'Activo',
      modulos: []
    };
    this.seleccionModulos = [];
    this.modalAgregar = true;
  }

  cerrarAgregar() {
    this.modalAgregar = false;
  }

  async guardar() {
    try {
      this.nuevoRol.modulos = [...this.seleccionModulos];

      await this.rolSrv.agregar(this.nuevoRol);
      this.mostrarToast('Rol agregado', 'success');
      this.modalAgregar = false;
      await this.listar();
    } catch (_) {
      this.mostrarToast('Error al guardar', 'danger');
    }
  }

  // ===========================
  //         EDITAR
  // ===========================
  abrirEditar() {
    this.rolEditarId = null;
    this.rolEditar = null;
    this.modalEditar = true;
  }

  cerrarEditar() {
    this.modalEditar = false;
  }

  cargarEditar() {
    const r = this.roles.find(x => x.id === this.rolEditarId);
    if (!r) return;

    this.rolEditar = { ...r };
    this.seleccionModulos = [...(r.modulos || [])];
  }

  async actualizar() {
    if (!this.rolEditar || !this.rolEditar.id) return;

    this.rolEditar.modulos = [...this.seleccionModulos];

    try {
      await this.rolSrv.actualizar(this.rolEditar.id, this.rolEditar);
      this.mostrarToast('Actualizado', 'success');
      this.modalEditar = false;
      await this.listar();
    } catch (_) {
      this.mostrarToast('Error al actualizar', 'danger');
    }
  }

  // ===========================
  //        ELIMINAR
  // ===========================
  abrirEliminar() {
    this.rolEliminarId = null;
    this.modalEliminar = true;
  }

  cerrarEliminar() {
    this.modalEliminar = false;
  }

  async eliminar() {
    if (!this.rolEliminarId) {
      this.mostrarToast('Selecciona un rol', 'warning');
      return;
    }

    try {
      await this.rolSrv.eliminar(this.rolEliminarId);
      this.modalEliminar = false;
      this.mostrarToast('Eliminado', 'danger');
      await this.listar();
    } catch (_) {
      this.mostrarToast('Error al eliminar', 'danger');
    }
  }

  // LISTA -> EDITAR / ELIMINAR
  editarDesdeLista(r: Rol) {
    this.modalLista = false;
    this.modalEditar = true;
    this.rolEditarId = r.id || null;
    this.cargarEditar();
  }

  eliminarDesdeLista(r: Rol) {
    this.modalLista = false;
    this.modalEliminar = true;
    this.rolEliminarId = r.id || null;
  }

  // ===========================
  //     MODAL DE MÓDULOS
  // ===========================
  toggleModulo(mod: string, ev: any) {
    if (ev.detail.checked) {
      if (!this.seleccionModulos.includes(mod)) {
        this.seleccionModulos.push(mod);
      }
    } else {
      this.seleccionModulos = this.seleccionModulos.filter(x => x !== mod);
    }
  }

  removeModulo(mod: string) {
    this.seleccionModulos = this.seleccionModulos.filter(x => x !== mod);
  }

  confirmarModulos() {
    if (this.rolEditar) this.rolEditar.modulos = [...this.seleccionModulos];
    if (this.nuevoRol) this.nuevoRol.modulos = [...this.seleccionModulos];

    this.modalModulos = false;
  }

  // ===========================
  //         TOAST
  // ===========================
  async mostrarToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({
      message: msg,
      duration: 1500,
      color
    });
    t.present();
  }
}
