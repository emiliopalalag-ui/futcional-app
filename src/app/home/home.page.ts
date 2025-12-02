import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { getAuth } from 'firebase/auth';
import { UsuariosService, Usuario } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonicModule, CommonModule]
})
export class HomePage implements OnInit {

  usuario: Usuario | null = null;
  cargando = true;

  constructor(private usuarioSrv: UsuariosService) {}

  async ngOnInit() {
    await this.cargarPerfil();
  }

  async cargarPerfil() {
    const auth = getAuth();
    const correo = auth.currentUser?.email;

    if (!correo) {
      this.cargando = false;
      return;
    }

    // Buscar usuario por correo
    const lista = await this.usuarioSrv.listarUsuarios();
    this.usuario = lista.find(u => u.correo === correo) || null;

    this.cargando = false;
  }

}

