import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService, Usuario } from 'src/app/services/usuarios.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class UsuariosPage implements OnInit {

  usuarios: Usuario[] = [];

  roles = [
    { id: 'administrador', nombre: 'Administrador' },
    { id: 'entrenador', nombre: 'Entrenador' },
    { id: 'atleta', nombre: 'Atleta' },
    { id: 'Padre o Responsable', nombre: 'Padre o Responsable' },
  ];

  modalAgregar = false;
  modalEditar  = false;
  modalEliminar = false;
  modalLista = false;

  nuevoUsuario: Usuario = {
    id: '',
    carnet: '',
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: '',
    rol: '',
    estado: 'Activo'
  };

  usuarioEditarId: string | null = null;
  usuarioEditar: Usuario | null = null;
  usuarioEliminarId: string | null = null;

  constructor(
    private usuarioSrv: UsuariosService,
    private firebase: FirebaseService,
    private toastCtrl: ToastController,
    private auth: Auth
  ) {}

  async ngOnInit() {
    await this.listarUsuarios();
  }

  async listarUsuarios() {
    this.usuarios = await this.usuarioSrv.listarUsuarios();
  }

  // =====================================================
  // AGREGAR
  // =====================================================

  abrirModalAgregar() {
    this.limpiarCampos();
    this.modalAgregar = true;
  }

  cerrarModalAgregar() {
    this.modalAgregar = false;
    this.limpiarCampos();
  }

  async guardarUsuario() {

    if (!this.nuevoUsuario.carnet || !this.nuevoUsuario.nombre || !this.nuevoUsuario.rol) {
      this.mostrarToast('Completa los campos obligatorios', 'warning');
      return;
    }

    try {
      // Guardar en Firestore
      await this.usuarioSrv.agregarUsuario(this.nuevoUsuario);

      // Si necesita Auth
      if (this.nuevoUsuario.rol === 'Administrador' || this.nuevoUsuario.rol === 'Entrenador') {
        await createUserWithEmailAndPassword(
          this.auth,
          this.nuevoUsuario.correo,
          this.nuevoUsuario.password
        );
      }

      this.mostrarToast('Usuario agregado', 'success');
      this.cerrarModalAgregar();
      this.listarUsuarios();

    } catch (err) {
      console.log(err);
      this.mostrarToast('Error al guardar', 'danger');
    }
  }

  limpiarCampos() {
    this.nuevoUsuario = {
      id: '',
      carnet: '',
      nombre: '',
      apellido: '',
      correo: '',
      password: '',
      telefono: '',
      fecha_nacimiento: '',
      genero: '',
      rol: '',
      estado: 'Activo'
    };
  }

  // =====================================================
  // EDITAR
  // =====================================================

abrirModalEditar() {
  this.usuarioEditarId = "";
  this.usuarioEditar = null;
  this.modalEditar = true;
}


  cerrarModalEditar() {
    this.modalEditar = false;
    this.usuarioEditar = null;
    this.usuarioEditarId = null;
  }

async cargarUsuarioEditar() {
  if (!this.usuarioEditarId) return;

  const user = await this.usuarioSrv.obtenerPorId(this.usuarioEditarId);
  this.usuarioEditar = user ? { ...user } : null;
}



  async actualizarUsuario() {
    if (!this.usuarioEditar) {
      this.mostrarToast('Debes seleccionar un usuario', 'warning');
      return;
    }

    try {
      await this.usuarioSrv.actualizarUsuario(this.usuarioEditar);
      this.mostrarToast('Usuario actualizado', 'success');
      this.cerrarModalEditar();
      this.listarUsuarios();
    } catch (err) {
      this.mostrarToast('Error al actualizar', 'danger');
    }
  }

  // =====================================================
  // ELIMINAR (SUSPENDER)
  // =====================================================

  abrirModalEliminar() {
    this.usuarioEliminarId = null;
    this.modalEliminar = true;
  }

  cerrarModalEliminar() {
    this.modalEliminar = false;
    this.usuarioEliminarId = null;
  }

  async eliminarUsuario() {
    if (!this.usuarioEliminarId) {
      this.mostrarToast('Selecciona un usuario', 'warning');
      return;
    }

    try {
      // Suspender en vez de borrar
      const user = this.usuarios.find(u => u.id === this.usuarioEliminarId);
      if (user) {
        user.estado = 'Suspendido';
        await this.usuarioSrv.actualizarUsuario(user);
      }

      this.mostrarToast('Usuario suspendido', 'danger');
      this.cerrarModalEliminar();
      this.listarUsuarios();

    } catch (err) {
      this.mostrarToast('Error al suspender', 'danger');
    }
  }


  // =====================================================
  // LISTA → ABRIR EDITAR / SUSPENDER
  // =====================================================

  editarDesdeLista(u: Usuario) {
    this.usuarioEditarId = u.id || null;
    this.cargarUsuarioEditar();
    this.modalLista = false;
    this.modalEditar = true;
  }

  eliminarDesdeLista(u: Usuario) {
    this.usuarioEliminarId = u.id || null;
    this.modalLista = false;
    this.modalEliminar = true;
  }


  // =====================================================
  // UTILIDAD
  // =====================================================

  async mostrarToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({
      message: msg,
      duration: 1500,
      color
    });
    await t.present();
  }
  buscar = "";
filtroRol = "";
filtroEstado = "";
usuariosFiltrados: Usuario[] = [];
filtrarUsuarios() {
  const texto = this.buscar.toLowerCase().trim();

  this.usuariosFiltrados = this.usuarios.filter(u => {

    const coincideTexto =
      u.carnet?.toLowerCase().includes(texto) ||
      (u.nombre + " " + u.apellido).toLowerCase().includes(texto);

    const coincideRol =
      this.filtroRol === "" || u.rol === this.filtroRol;

    const coincideEstado =
      this.filtroEstado === "" || u.estado === this.filtroEstado;

    return coincideTexto && coincideRol && coincideEstado;
  });
}

}
