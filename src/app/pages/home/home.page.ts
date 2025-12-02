import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { getAuth } from 'firebase/auth';
import { UsuariosService } from 'src/app/services/usuarios.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonicModule, CommonModule]
})
export class HomePage implements OnInit {

  usuario: any = null;
  cargando = true;

  constructor(private usuariosSrv: UsuariosService) {}

  async ngOnInit() {
    await this.cargarPerfil();
  }

  async cargarPerfil() {
    try {
      const auth = getAuth();
      const correo = auth.currentUser?.email;

      if (!correo) {
        this.cargando = false;
        return;
      }

      // 📌 JALAMOS TODOS LOS USUARIOS
      const lista = await this.usuariosSrv.listarUsuarios();

      // 📌 BUSCAMOS AL USUARIO LOGEADO
      this.usuario = lista.find(u => u.correo === correo) || null;

      this.cargando = false;
    } catch (e) {
      console.error('Error cargando perfil:', e);
      this.cargando = false;
    }
  }

}
