import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UsuariosService, Usuario } from 'src/app/services/usuarios.service';
import { ResponsablesService, ResponsableAtleta } from 'src/app/services/responsables.service';

@Component({
  selector: 'app-responsables',
  standalone: true,
  templateUrl: './responsables.page.html',
  styleUrls: ['./responsables.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class ResponsablesPage implements OnInit {

  responsables: Usuario[] = [];
  atletas: Usuario[] = [];
  asignaciones: ResponsableAtleta[] = [];

  editando = false;

  nuevo: ResponsableAtleta = {
    id: '',
    id_responsable: '',
    id_atleta: '',
    parentesco: ''
  };

  constructor(
    private usuarioSrv: UsuariosService,
    private respSrv: ResponsablesService,
    private toast: ToastController
  ) {}

  async ngOnInit() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    const users = await this.usuarioSrv.listarUsuarios();

    this.responsables = users.filter(u => u.rol === "Padre o Responsable");
    this.atletas = users.filter(u => u.rol === "Atleta");

    this.asignaciones = await this.respSrv.listar();
  }

  // Función para obtener nombre del responsable
  getNombreResponsable(idResponsable: string): string {
    const responsable = this.responsables.find(r => r.id === idResponsable);
    return responsable ? `${responsable.nombre} ${responsable.apellido}` : 'Responsable no encontrado';
  }

  // Función para obtener nombre del atleta
  getNombreAtleta(idAtleta: string): string {
    const atleta = this.atletas.find(a => a.id === idAtleta);
    return atleta ? `${atleta.nombre} ${atleta.apellido}` : 'Atleta no encontrado';
  }

  limpiarFormulario() {
    this.nuevo = {
      id: '',
      id_responsable: '',
      id_atleta: '',
      parentesco: ''
    };
    this.editando = false;
  }

  async guardar() {
    if (!this.nuevo.id_responsable || !this.nuevo.id_atleta || !this.nuevo.parentesco) {
      return this.mostrar('Completa todos los campos', 'warning');
    }

    if (this.editando && this.nuevo.id) {
      await this.respSrv.actualizar(this.nuevo);
      this.mostrar('Asignación actualizada', 'success');
    } else {
      await this.respSrv.agregar(this.nuevo);
      this.mostrar('Asignación registrada', 'success');
    }

    this.limpiarFormulario();
    await this.cargarDatos();
  }

  editar(asig: ResponsableAtleta) {
    this.nuevo = { ...asig };
    this.editando = true;
  }

  cancelarEdicion() {
    this.limpiarFormulario();
  }

  async eliminar(id: string) {
    await this.respSrv.eliminar(id);
    this.mostrar('Asignación eliminada', 'danger');
    await this.cargarDatos();
  }

  async mostrar(msg: string, color: string) {
    const t = await this.toast.create({
      message: msg,
      duration: 1200,
      color
    });
    t.present();
  }
}