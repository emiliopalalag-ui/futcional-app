import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  getFirestore,
  collection,
  getDocs,
  doc,
} from 'firebase/firestore';

import {
  EntrenamientosService,
  Entrenamiento
} from 'src/app/services/entrenamientos.service';

@Component({
  selector: 'app-entrenamientos',
  standalone: true,
  templateUrl: './entrenamientos.page.html',
  styleUrls: ['./entrenamientos.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class EntrenamientosPage implements OnInit {

  entrenamientos: Entrenamiento[] = [];
  entrenamientosFiltrados: Entrenamiento[] = [];
  entrenadores: { id: string; nombre: string }[] = [];

  // Modales
  modalAgregar = false;
  modalEditar = false;
  modalEliminar = false;
  modalLista = false;

  modalDias = false;
  modalDiasEditar = false;

  modalHoraAgregar = false;
  modalHoraEditar = false;

  // Filtros para la lista
  buscar = "";
  filtroEstado = "";
  filtroEntrenador = "";

  // Nuevo
  nuevoEntrenamiento: any = {
    nombre: "",
    descripcion: "",
    horario: "",
    idEntrenador: "",
    dias: {
      lun: false,
      mar: false,
      mier: false,
      jue: false,
      vier: false,
      sab: false,
    },
    estado: "Activo"
  };

  // Editar
  entrenamientoEditarId: string | null = null;
  entrenamientoEditar: any = null;

  // Eliminar
  entrenamientoEliminarId: string | null = null;

  private db = getFirestore();

  constructor(
    private entSrv: EntrenamientosService,
    private toastCtrl: ToastController
  ) {}

  async ngOnInit() {
    await this.listarEntrenadores();
    await this.listarEntrenamientos();
  }

  // ======================================================
  // LISTAR ENTRENADORES
  // ======================================================
  async listarEntrenadores() {
    try {
      const usuarios = collection(this.db, "usuarios");
      const snap = await getDocs(usuarios);

      this.entrenadores = snap.docs
        .map(d => {
          const data = d.data() as any;
          const rolRaw = data.rol;

          let rolNorm = "";
          if (typeof rolRaw === "object" && rolRaw) {
            const id = (rolRaw as any).id || "";
            const path = (rolRaw as any).path || "";
            rolNorm = (id || path).toString().toLowerCase().trim();
          } else if (typeof rolRaw === "string") {
            rolNorm = rolRaw.toLowerCase().trim();
          }

          if (!rolNorm) return null;

          if (
            rolNorm === "entrenador" ||
            rolNorm.endsWith("/entrenador")
          ) {
            return {
              id: d.id,
              nombre: `${data.nombre || ""} ${data.apellido || ""}`.trim()
            };
          }
          return null;
        })
        .filter(Boolean) as any[];
    } catch (e) {
      console.error("Error listar entrenadores:", e);
    }
  }

  // ======================================================
  // LISTAR ENTRENAMIENTOS
  // ======================================================
  async listarEntrenamientos() {
    this.entrenamientos = await this.entSrv.listarEntrenamientos();
    this.filtrarEntrenamientos();
  }

  // ======================================================
  // FILTRO PARA MODAL LISTA
  // ======================================================
  filtrarEntrenamientos() {
    const texto = this.buscar.toLowerCase().trim();

    this.entrenamientosFiltrados = this.entrenamientos.filter(e => {
      const nombre = (e.nombre || "").toLowerCase();
      const desc = (e.descripcion || "").toLowerCase();

      const coincideTexto =
        !texto ||
        nombre.includes(texto) ||
        desc.includes(texto);

      const coincideEstado =
        !this.filtroEstado || e.estado === this.filtroEstado;

      const idEntrRef: any = e.idEntrenador as any;
      const idEntr = (idEntrRef?.id || idEntrRef || "").toString();

      const coincideEntrenador =
        !this.filtroEntrenador || idEntr === this.filtroEntrenador;

      return coincideTexto && coincideEstado && coincideEntrenador;
    });
  }

  // ======================================================
  // UTILIDAD → FORMATEAR HORA
  // ======================================================
  formatearHora(v: any): string {
    if (!v || typeof v !== "string") return "";
    const f = new Date(v);
    const h = String(f.getHours()).padStart(2, "0");
    const m = String(f.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }

  // ======================================================
  // UTILIDAD → TEXTO DIAS
  // ======================================================
  textoDias(diasObj: any): string {
    if (!diasObj) return "";
    const dias: string[] = [];
    if (diasObj.lun) dias.push("Lun");
    if (diasObj.mar) dias.push("Mar");
    if (diasObj.mier) dias.push("Mier");
    if (diasObj.jue) dias.push("Jue");
    if (diasObj.vier) dias.push("Vier");
    if (diasObj.sab) dias.push("Sab");
    return dias.join("-");
  }

  private construirDiasStringFromNuevo(): string {
    const d = this.nuevoEntrenamiento.dias;
    const parts: string[] = [];
    if (d.lun) parts.push("Lun");
    if (d.mar) parts.push("Mar");
    if (d.mier) parts.push("Mier");
    if (d.jue) parts.push("Jue");
    if (d.vier) parts.push("Vier");
    if (d.sab) parts.push("Sab");
    return parts.join("-");
  }

  private construirDiasStringFromEditar(): string {
    if (!this.entrenamientoEditar?.dias) return "";
    const d = this.entrenamientoEditar.dias;
    const parts: string[] = [];
    if (d.lun) parts.push("Lun");
    if (d.mar) parts.push("Mar");
    if (d.mier) parts.push("Mier");
    if (d.jue) parts.push("Jue");
    if (d.vier) parts.push("Vier");
    if (d.sab) parts.push("Sab");
    return parts.join("-");
  }

  // ======================================================
  // NOMBRE ENTRENADOR (para mostrar)
  // ======================================================
  getNombreEntrenador(e: any): string {
    if (!e?.idEntrenador) return "—";
    const id = ((e.idEntrenador as any)?.id || e.idEntrenador || "").toString();
    const trainer = this.entrenadores.find(t => t.id === id);
    return trainer ? trainer.nombre : "—";
  }

  // ======================================================
  // HORA: EVENTOS
  // ======================================================
  onHoraAgregarChange(ev: any) {
    const v = ev.detail?.value;
    this.nuevoEntrenamiento.horario = this.formatearHora(v);
  }

  onHoraEditarChange(ev: any) {
    const v = ev.detail?.value;
    if (this.entrenamientoEditar) {
      this.entrenamientoEditar.horario = this.formatearHora(v);
    }
  }

  // ======================================================
  // AGREGAR
  // ======================================================
  abrirModalAgregar() {
    this.nuevoEntrenamiento = {
      nombre: "",
      descripcion: "",
      horario: "",
      idEntrenador: "",
      dias: {
        lun: false,
        mar: false,
        mier: false,
        jue: false,
        vier: false,
        sab: false,
      },
      estado: "Activo"
    };
    this.modalAgregar = true;
  }

  cerrarModalAgregar() {
    this.modalAgregar = false;
  }

  async guardarEntrenamiento() {
    if (!this.nuevoEntrenamiento.nombre || !this.nuevoEntrenamiento.idEntrenador) {
      this.mostrarToast("Completa los campos obligatorios", "warning");
      return;
    }

    try {
      const ref = doc(this.db, "usuarios", this.nuevoEntrenamiento.idEntrenador);
      const diasStr = this.construirDiasStringFromNuevo();

      await this.entSrv.agregarEntrenamiento({
        nombre: this.nuevoEntrenamiento.nombre,
        descripcion: this.nuevoEntrenamiento.descripcion,
        horario: this.nuevoEntrenamiento.horario,
        idEntrenador: ref,
        dias: diasStr,
        estado: this.nuevoEntrenamiento.estado || "Activo"
      });

      this.mostrarToast("Entrenamiento agregado", "success");
      this.modalAgregar = false;
      await this.listarEntrenamientos();
    } catch (e) {
      console.error(e);
      this.mostrarToast("Error al guardar", "danger");
    }
  }

  // ======================================================
  // EDITAR
  // ======================================================
  abrirModalEditar() {
    this.entrenamientoEditarId = null;
    this.entrenamientoEditar = null;
    this.modalEditar = true;
  }

  cerrarModalEditar() {
    this.modalEditar = false;
    this.entrenamientoEditarId = null;
    this.entrenamientoEditar = null;
  }

  cargarEntrenamientoEditar() {
    const e = this.entrenamientos.find(x => x.id === this.entrenamientoEditarId);
    if (!e) return;

    const diasBase = {
      lun: false,
      mar: false,
      mier: false,
      jue: false,
      vier: false,
      sab: false,
    };

    const diasStr = (e.dias || "") as string;
    diasStr.split("-").forEach((d: string) => {
      const dd = d.toLowerCase();
      if (dd.includes("lun")) diasBase.lun = true;
      if (dd.includes("mar")) diasBase.mar = true;
      if (dd.includes("mier")) diasBase.mier = true;
      if (dd.includes("jue")) diasBase.jue = true;
      if (dd.includes("vier")) diasBase.vier = true;
      if (dd.includes("sab")) diasBase.sab = true;
    });

    this.entrenamientoEditar = {
      ...e,
      dias: diasBase,
      estado: (e as any).estado || "Activo",
      idEntrenador: ((e.idEntrenador as any)?.id || e.idEntrenador || "").toString()
    };
  }

  async actualizarEntrenamiento() {
    if (!this.entrenamientoEditar) {
      this.mostrarToast("Selecciona un entrenamiento", "warning");
      return;
    }

    try {
      const ref = doc(this.db, "usuarios", this.entrenamientoEditar.idEntrenador);
      const diasStr = this.construirDiasStringFromEditar();

      await this.entSrv.actualizarEntrenamiento(
        this.entrenamientoEditar.id!,
        {
          nombre: this.entrenamientoEditar.nombre,
          descripcion: this.entrenamientoEditar.descripcion,
          horario: this.entrenamientoEditar.horario,
          idEntrenador: ref,
          dias: diasStr,
          estado: this.entrenamientoEditar.estado
        }
      );

      this.mostrarToast("Actualizado correctamente", "success");
      this.modalEditar = false;
      await this.listarEntrenamientos();
    } catch (e) {
      console.error(e);
      this.mostrarToast("Error al actualizar", "danger");
    }
  }

  // ======================================================
  // ELIMINAR
  // ======================================================
  abrirModalEliminar() {
    this.entrenamientoEliminarId = null;
    this.modalEliminar = true;
  }

  cerrarModalEliminar() {
    this.modalEliminar = false;
  }

  async eliminarEntrenamiento() {
    if (!this.entrenamientoEliminarId) {
      this.mostrarToast("Selecciona un entrenamiento", "warning");
      return;
    }

    try {
      await this.entSrv.eliminarEntrenamiento(this.entrenamientoEliminarId);
      this.mostrarToast("Eliminado correctamente", "danger");
      this.modalEliminar = false;
      await this.listarEntrenamientos();
    } catch (e) {
      console.error(e);
      this.mostrarToast("Error al eliminar", "danger");
    }
  }

  // ======================================================
  // LISTA → EDITAR / ELIMINAR DESDE MODAL
  // ======================================================
  editarDesdeLista(e: Entrenamiento) {
    this.entrenamientoEditarId = e.id || null;
    this.cargarEntrenamientoEditar();
    this.modalLista = false;
    this.modalEditar = true;
  }

  eliminarDesdeLista(e: Entrenamiento) {
    this.entrenamientoEliminarId = e.id || null;
    this.modalLista = false;
    this.modalEliminar = true;
  }

  // ======================================================
  // TOAST
  // ======================================================
  async mostrarToast(msg: string, color: string) {
    const t = await this.toastCtrl.create({
      message: msg,
      duration: 1500,
      color
    });
    await t.present();
  }
}
