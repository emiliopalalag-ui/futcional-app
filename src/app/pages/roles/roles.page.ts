import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController, AlertController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Rol {
  id: string;
  nombre: string;
  descripcion?: string;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  templateUrl: './roles.page.html',
  styleUrls: ['./roles.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RolesPage implements OnInit {
  roles: Rol[] = [];
  rolActual: Rol = { id: '', nombre: '', descripcion: '' };
  editando = false;

  constructor(
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.cargarRoles();
  }

  /** 🔹 Cargar roles desde localStorage */
  cargarRoles() {
    const data = localStorage.getItem('roles');
    this.roles = data ? JSON.parse(data) : [];
  }

  /** 🔹 Guardar roles en localStorage */
  guardarRoles() {
    localStorage.setItem('roles', JSON.stringify(this.roles));
  }

  /** 🔹 Agregar o actualizar rol */
  async guardarRol() {
    if (!this.rolActual.nombre.trim()) {
      return this.mostrarToast('Ingrese el nombre del rol', 'warning');
    }

    if (this.editando) {
      const idx = this.roles.findIndex(r => r.id === this.rolActual.id);
      if (idx >= 0) this.roles[idx] = { ...this.rolActual };
      await this.mostrarToast('Rol actualizado correctamente', 'success');
    } else {
      this.rolActual.id = Date.now().toString();
      this.roles.push({ ...this.rolActual });
      await this.mostrarToast('Rol agregado correctamente', 'success');
    }

    this.guardarRoles();
    this.cancelarEdicion();
  }

  /** 🔹 Editar un rol */
  editarRol(rol: Rol) {
    this.rolActual = { ...rol };
    this.editando = true;
  }

  /** 🔹 Cancelar edición */
  cancelarEdicion() {
    this.rolActual = { id: '', nombre: '', descripcion: '' };
    this.editando = false;
  }

  /** 🔹 Eliminar un rol */
  async eliminarRol(rol: Rol) {
    const alert = await this.alertCtrl.create({
      header: 'Eliminar Rol',
      message: `¿Desea eliminar el rol "${rol.nombre}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          handler: async () => {
            this.roles = this.roles.filter(r => r.id !== rol.id);
            this.guardarRoles();
            await this.mostrarToast('Rol eliminado', 'danger');
          },
        },
      ],
    });
    await alert.present();
  }

  /** 🔹 Mostrar mensaje */
  private async mostrarToast(msg: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 1500,
      color,
    });
    await toast.present();
  }
}
