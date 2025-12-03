import { Component, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UsuariosService, Usuario } from 'src/app/services/usuarios.service';
import { EntrenamientosService } from 'src/app/services/entrenamientos.service';
import { InscripcionesService } from 'src/app/services/inscripciones.service';
import { PagosService } from 'src/app/services/pagos.service';
import { ActividadesService } from 'src/app/services/actividades.service';
import { GastosService } from 'src/app/services/gastos.service';
import { ResponsablesService } from 'src/app/services/responsables.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';



@Component({
  selector: 'app-informes',
  standalone: true,
  templateUrl: './informes.page.html',
  styleUrls: ['./informes.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
})
export class InformesPage implements OnInit {

  // ==========================
  // DATOS CRUD
  // ==========================
  usuarios: Usuario[] = [];
  entrenamientos: any[] = [];
  inscripciones: any[] = [];
  pagos: any[] = [];
  actividades: any[] = [];
  gastos: any[] = [];
  responsables: any[] = [];

  // ==========================
  // KPIs
  // ==========================
  totalUsuarios = 0;
  totalAdministradores = 0;
  totalPadres = 0;
  totalAtletas = 0;
  totalEntrenadores = 0;
  totalEntrenamientos = 0;
  totalInscripcionesActivas = 0;
  totalPagosMonto = 0;
  totalGastosMonto = 0;
  saldoNeto = 0;

  // ==========================
  // MODALES
  // ==========================
  modalUsuarios = false;
  modalEntrenamientos = false;
  modalInscripciones = false;
  modalPagos = false;
  modalActividades = false;
  modalGastos = false;
  modalResponsables = false;

  // ==========================
  // FILTROS DE TODOS LOS MÓDULOS
  // ==========================
  filtroUsrTexto = '';
  filtroUsrRol = '';
  filtroUsrEstado = '';

  filtroEntTexto = '';
  filtroEntEstado = '';

  filtroInscTexto = '';
  filtroInscEstado = '';
  filtroInscEntrenamiento = '';

  filtroPagTexto = '';
  filtroPagMetodo = '';
  filtroPagMes = '';
  filtroPagAnio = '';

  filtroActTexto = '';
  filtroActEstado = '';

  filtroGasTexto = '';
  filtroGasEstado = '';
  filtroGasMes = '';
  filtroGasAnio = '';

  filtroRespTexto = '';

  // MESES
  mesesAbreviados = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

  mesesMap: Record<string,string> = {
    'Ene':'01','Feb':'02','Mar':'03','Abr':'04','May':'05','Jun':'06',
    'Jul':'07','Ago':'08','Sep':'09','Oct':'10','Nov':'11','Dic':'12'
  };

  constructor(
    private usrSrv: UsuariosService,
    private entSrv: EntrenamientosService,
    private inscSrv: InscripcionesService,
    private pagoSrv: PagosService,
    private actSrv: ActividadesService,
    private gasSrv: GastosService,
    private respSrv: ResponsablesService,
    private toastCtrl: ToastController
  ) {}
async exportarSeccionPdf(idSeccion: string, nombre: string) {
  const element: any = document.getElementById(idSeccion);

  if (!element) {
    console.error("No se encontró la sección para exportar:", idSeccion);
    return;
  }

  const canvas = await html2canvas(element, { scale: 3 });
  const img = canvas.toDataURL('image/png');

  const pdf = new jsPDF('p', 'mm', 'a4');

  const width = pdf.internal.pageSize.getWidth();
  const height = (canvas.height * width) / canvas.width;

  pdf.addImage(img, 'PNG', 0, 0, width, height);
  pdf.save(nombre + '.pdf');
}
  // ==========================
  // INIT
  // ==========================
  async ngOnInit() {
    await this.cargarTodo();
  }

  async cargarTodo() {
    this.usuarios = await this.usrSrv.listarUsuarios();
    this.entrenamientos = await this.entSrv.listarEntrenamientos();
    this.inscripciones = await this.inscSrv.listar();
    this.pagos = await this.pagoSrv.listar();
    this.actividades = await this.actSrv.listar();
    this.gastos = await this.gasSrv.listar();

    const asign = await this.respSrv.listar();
    this.responsables = asign.map(a => ({
      ...a,
      nombreResponsable: this.usuarios.find(u => u.id === a.id_responsable)?.nombre || '—',
      nombreAtleta: this.usuarios.find(u => u.id === a.id_atleta)?.nombre || '—'
    }));

    this.calcularKpis();
  }

  // ==========================
  // KPIs GENERALES
  // ==========================
  calcularKpis() {
    this.totalUsuarios = this.usuarios.length;
    this.totalAtletas = this.usuarios.filter(u => u.rol === 'Atleta').length;
    this.totalEntrenadores = this.usuarios.filter(u => u.rol === 'Entrenador').length;
    this.totalAdministradores = this.usuarios.filter(u => u.rol === 'Administrador').length;
    this.totalPadres = this.usuarios.filter(u => u.rol === 'Padre o Responsable').length;

    this.totalEntrenamientos = this.entrenamientos.length;

    this.totalInscripcionesActivas =
      this.inscripciones.filter(i => i.estado === 'Activo').length;

    this.totalPagosMonto = this.pagos.reduce((s,p) => s + (p.monto || 0), 0);

    this.totalGastosMonto = this.gastos
        .filter(g => g.estado !== 'Inactivo')
        .reduce((s,g) => s + (g.monto || 0), 0);

    this.saldoNeto = this.totalPagosMonto - this.totalGastosMonto;
  }

  // ==========================
  // FILTROS INDIVIDUALES
  // ==========================

  // ---------- USUARIOS ----------
  get usuariosFiltrados() {
    const txt = this.filtroUsrTexto.toLowerCase().trim();
    return this.usuarios.filter(u =>
      (!txt ||
        u.nombre.toLowerCase().includes(txt) ||
        u.carnet?.toLowerCase().includes(txt)) &&
      (!this.filtroUsrRol || u.rol === this.filtroUsrRol) &&
      (!this.filtroUsrEstado || u.estado === this.filtroUsrEstado)
    );
  }

  // ---------- ENTRENAMIENTOS ----------
  get entrenamientosFiltrados() {
    const txt = this.filtroEntTexto.toLowerCase().trim();
    return this.entrenamientos.filter(e =>
      (!txt || e.nombre.toLowerCase().includes(txt)) &&
      (!this.filtroEntEstado || e.estado === this.filtroEntEstado)
    );
  }

  // ---------- INSCRIPCIONES ----------
  get inscripcionesFiltradas() {
    const txt = this.filtroInscTexto.toLowerCase().trim();

    return this.inscripciones.filter(i =>
      (!txt ||
        i.nombreAtleta?.toLowerCase().includes(txt) ||
        i.nombreEntrenamiento?.toLowerCase().includes(txt)) &&
      (!this.filtroInscEntrenamiento || i.id_entrenamiento === this.filtroInscEntrenamiento) &&
      (!this.filtroInscEstado || i.estado === this.filtroInscEstado)
    );
  }

  // ==========================
  // PAGOS — FILTRADOS
  // ==========================

  get pagosFiltrados() {
    const texto = this.filtroPagTexto.toLowerCase().trim();

    return this.pagos
      .map(p => ({
        ...p,
        nombreAtleta: this.inscripciones.find(i => i.id === p.id_inscripcion)?.nombreAtleta || '',
        nombreEntrenamiento: this.inscripciones.find(i => i.id === p.id_inscripcion)?.nombreEntrenamiento || ''
      }))
      .filter(p => {

        let fecha = new Date(p.fecha_pago);
        if (isNaN(fecha.getTime())) return false;

        const mes = (fecha.getMonth()+1).toString().padStart(2,'0');
        const anio = fecha.getFullYear().toString();

        const coincideTxt =
          !texto ||
          p.nombreAtleta.toLowerCase().includes(texto) ||
          p.nombreEntrenamiento.toLowerCase().includes(texto);

        const coincideMes =
          !this.filtroPagMes || mes === this.mesesMap[this.filtroPagMes];

        const coincideAnio =
          !this.filtroPagAnio || anio === this.filtroPagAnio;

        const coincideMetodo =
          !this.filtroPagMetodo || p.metodo_pago === this.filtroPagMetodo;

        return coincideTxt && coincideMes && coincideAnio && coincideMetodo;
      });
  }

  get totalPagosFiltrados() {
    return this.pagosFiltrados.reduce((s,p)=>s+(p.monto||0),0);
  }

  // ==========================
  // GASTOS — FILTRADOS POR MISMO MES/AÑO QUE PAGOS
  // ==========================
  get gastosFiltrados() {

    return this.gastos.filter(g => {
      let fecha = new Date(g.fecha);
      if (isNaN(fecha.getTime())) return false;

      const mes = (fecha.getMonth() + 1).toString().padStart(2,'0');
      const anio = fecha.getFullYear().toString();

      const coincideMes =
        !this.filtroPagMes || mes === this.mesesMap[this.filtroPagMes];

      const coincideAnio =
        !this.filtroPagAnio || anio === this.filtroPagAnio;

      return coincideMes && coincideAnio;
    });
  }

  get totalGastosFiltrados() {
    return this.gastosFiltrados.reduce((s,g)=>s+(g.monto||0),0);
  }

  // SALDO FINAL FILTRADO
  get saldoFiltrado() {
    return this.totalPagosFiltrados - this.totalGastosFiltrados;
  }

  // ---------- ACTIVIDADES ----------
  get actividadesFiltradas() {
    const txt = this.filtroActTexto.toLowerCase().trim();

    return this.actividades.filter(a =>
      (!txt ||
        a.nombre?.toLowerCase().includes(txt) ||
        a.descripcion?.toLowerCase().includes(txt))
      && (!this.filtroActEstado || a.estado === this.filtroActEstado)
    );
  }

  // ---------- RESPONSABLES ----------
  get responsablesFiltrados() {
    const txt = this.filtroRespTexto.toLowerCase().trim();

    return this.responsables.filter(r =>
      (!txt ||
        r.nombreResponsable.toLowerCase().includes(txt) ||
        r.nombreAtleta.toLowerCase().includes(txt) ||
        r.parentesco.toLowerCase().includes(txt))
    );
  }

  // ==========================
  // LIMPIAR FILTROS
  // ==========================
  limpiarFiltrosPagos() {
    this.filtroPagTexto = '';
    this.filtroPagMes = '';
    this.filtroPagAnio = '';
    this.filtroPagMetodo = '';
  }

  limpiarFiltrosGastos() {
    this.filtroGasTexto = '';
    this.filtroGasMes = '';
    this.filtroGasAnio = '';
    this.filtroGasEstado = '';
  }

  // ==========================
  // MODALES
  // ==========================
  abrirUsuarios() { this.modalUsuarios = true; }
  cerrarUsuarios() { this.modalUsuarios = false; }

  abrirEntrenamientos() { this.modalEntrenamientos = true; }
  cerrarEntrenamientos() { this.modalEntrenamientos = false; }

  abrirInscripciones() { this.modalInscripciones = true; }
  cerrarInscripciones() { this.modalInscripciones = false; }

  abrirPagos() { this.modalPagos = true; }
  cerrarPagos() { this.modalPagos = false; }

  abrirActividades() { this.modalActividades = true; }
  cerrarActividades() { this.modalActividades = false; }

  abrirGastos() { this.modalGastos = true; }
  cerrarGastos() { this.modalGastos = false; }

  abrirResponsables() { this.modalResponsables = true; }
  cerrarResponsables() { this.modalResponsables = false; }

  // ==========================
  // EXPORTAR PDF
  // ==========================
  exportarUsuariosPdf() { window.print(); }
  exportarEntrenamientosPdf() { window.print(); }
  exportarInscripcionesPdf() { window.print(); }
  exportarPagosPdf() { window.print(); }
  exportarActividadesPdf() { window.print(); }
  exportarGastosPdf() { window.print(); }
  exportarResponsablesPdf() { window.print(); }

  exportarPdf(s: string) {
    window.print();
  }
  
}
