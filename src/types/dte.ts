/**
 * Tipos y Modelos Oficiales de Facturación Electrónica (DTE) v2
 * Normativa 2.0 - Ministerio de Hacienda de El Salvador (DGII)
 */

// CAT-001: Ambientes de Destino
export type DteAmbiente = '00' | '01'; // '00' = Pruebas (TEST), '01' = Producción (PROD)

// CAT-002: Tipos de Documento Tributario Electrónico
export type TipoDte = 
  | '01' // Factura Electrónica
  | '03' // Comprobante de Crédito Fiscal
  | '04' // Nota de Remisión
  | '05' // Nota de Crédito
  | '06' // Nota de Débito
  | '07' // Comprobante de Retención
  | '08' // Comprobante de Liquidación
  | '09' // Documento Contable de Liquidación
  | '11' // Factura de Exportación
  | '14' // Factura de Sujeto Excluido
  | '15'; // Comprobante de Donación

// CAT-005: Modelo de Facturación
export type TipoModelo = 1 | 2; // 1 = Previo (Normal / Síncrono), 2 = Diferido (Contingencia)

// CAT-006: Tipo de Transmisión
export type TipoOperacion = 1 | 2; // 1 = Normal, 2 = Contingencia

// CAT-022: Tipos de Documento de Identificación de Receptor
export type TipoDocumentoReceptor = 
  | '13' // DUI (El Salvador)
  | '36' // NIT
  | '03' // Pasaporte
  | '37'; // Carnet de Residente

// Estado del DTE en el ciclo de vida
export type EstadoDte = 
  | 'PENDIENTE'    // Generado localmente, pendiente de procesar
  | 'FIRMADO'      // Firmado con microservicio JWS
  | 'PROCESADO'    // Aprobado y recibido con Sello Oficial en Hacienda
  | 'CONTINGENCIA' // Emitido en contingencia local por caída de red/Hacienda
  | 'PENDIENTE_RETRANSMISION' // Venta registrada pendiente de re-transmisión a Hacienda por error/indisponibilidad
  | 'RECHAZADO'    // Rechazado por validaciones de Hacienda
  | 'INVALIDADO';  // Anulado fiscalmente mediante evento de invalidación

// Configuración de Hacienda para la Empresa Emisora
export interface DteConfig {
  ambiente: DteAmbiente;
  nitEmisor: string; // Sin guiones (14 dígitos)
  nrcEmisor: string; // Registro de Contribuyente (6 a 8 dígitos)
  nombreComercial: string;
  razonSocial: string;
  codActividad: string; // CAT-019 (ej: "47110" o "47410")
  descActividad: string;
  tipoEstablecimiento: 'C' | 'M' | 'B' | 'S' | 'P'; // C=Matriz, M=Sucursal, B=Bodega, P=POS
  codEstablecimiento: string; // 3 dígitos ej "001"
  codPuntoVenta: string; // 3 dígitos ej "001"
  departamento: string; // CAT-014 (ej: "06" San Salvador)
  municipio: string; // CAT-015 (ej: "14" San Salvador Centro)
  direccionComplemento: string;
  telefono: string;
  correo: string;
  
  // Conexión con Microservicio Local de Firma y API MH
  firmadorUrl: string; // por defecto http://localhost:8080/firmardocumento/
  firmadorPasswordPri: string;
  mhAuthPassword: string; // Clave de API de Hacienda
  modoSimulacion: boolean; // Si es true, simula el handshake con Hacienda si el servidor local no está disponible
}

// Estructura oficial del DTE v2 según Especificación de Hacienda
export interface DteIdentificacion {
  version: number; // 2
  ambiente: DteAmbiente;
  tipoDte: TipoDte;
  numeroControl: string; // Formato estricto: DTE-XX-M000P000-000000000000001 (31 caracteres)
  codigoGeneracion: string; // UUID v4 en mayúsculas (36 caracteres)
  tipoModelo: TipoModelo; // 1 = Previo, 2 = Diferido
  tipoOperacion: TipoOperacion; // 1 = Normal, 2 = Contingencia
  fecEmi: string; // YYYY-MM-DD
  horEmi: string; // HH:MM:SS
  tipoMoneda: 'USD';
}

export interface DteEmisor {
  nit: string;
  nrc: string;
  nombre: string;
  codActividad: string;
  descActividad: string;
  nombreComercial?: string;
  tipoEstablecimiento?: string;
  direccion: {
    departamento: string;
    municipio: string;
    complemento: string;
  };
  telefono: string;
  correo: string;
}

export interface DteReceptor {
  tipoDocumento?: TipoDocumentoReceptor | null;
  numDocumento?: string | null;
  nrc?: string | null;
  nombre: string;
  codActividad?: string | null;
  descActividad?: string | null;
  direccion?: {
    departamento: string;
    municipio: string;
    complemento: string;
  } | null;
  telefono?: string | null;
  correo?: string | null;
}

export interface DteCuerpoItem {
  numItem: number;
  tipoItem: number; // 1 = Bienes, 2 = Servicios
  cantidad: number;
  codigo: string;
  uniMedida: number; // 59 = Unidad, según catálogo
  descripcion: string;
  precioUni: number; // Hasta 8 decimales
  montoDescu: number;
  ventaNoSuj: number;
  ventaExenta: number;
  ventaGravada: number;
  tributos: string[] | null; // e.g. ["20"] IVA si aplica
}

export interface DteResumen {
  totalNoSuj: number;
  totalExenta: number;
  totalGravada: number;
  subTotalVentas: number;
  descuNoSuj: number;
  descuExenta: number;
  descuGravada: number;
  totalDescu: number;
  subTotal: number;
  ivaRete1: number; // Retención 1% Gran Contribuyente
  reteRenta: number;
  montoTotalOperacion: number;
  totalNoGravado?: number;
  totalPagar: number;
  totalLetras: string; // e.g. "VEINTIDOS 60/100 USD"
  condicionOperacion: number; // 1 = Contado, 2 = Crédito
  pagos?: {
    codigo: string; // "01" Efectivo, "02" Tarjeta, etc.
    montoPago: number;
    referencia?: string;
    plazo?: string;
    periodo?: number;
  }[];
  numPagoElectronico?: string | null;
}

export interface DteDocumentoCompleto {
  identificacion: DteIdentificacion;
  emisor: DteEmisor;
  receptor: DteReceptor;
  cuerpoDocumento: DteCuerpoItem[];
  resumen: DteResumen;
  extension?: {
    nombEntrega?: string;
    docuEntrega?: string;
    nombRecibe?: string;
    docuRecibe?: string;
    observaciones?: string;
  } | null;
  apendice?: {
    campo: string;
    etiqueta: string;
    valor: string;
  }[] | null;
}

// Respuesta oficial del Web Service de Recepción de Hacienda
export interface DteRecepcionRespuesta {
  version: number;
  ambiente: DteAmbiente;
  versionApp: number;
  estado: 'PROCESADO' | 'RECHAZADO';
  codigoGeneracion: string;
  selloRecibido?: string; // e.g. "202610061430001234567890ABCDEF"
  fhProcesamiento: string; // e.g. "06/10/2026 14:30:05"
  clasificaMsg?: string;
  codigoMsg?: string;
  descripcionMsg?: string;
  observaciones?: string[];
}

// Fases del Proceso de Transmisión Oficial
export type DteTransmissionStep = 
  | 'validando'     // Paso 1: Validar reglas de negocio y receptor
  | 'generando'     // Paso 2: Generar JSON según esquema oficial
  | 'firmando'      // Paso 3: Firmar con microservicio local JWS
  | 'autenticando'  // Paso 4: Obtener/renovar Token JWT en DGII
  | 'transmitiendo' // Paso 5: Transmitir a /fesv/recepciondte
  | 'confirmando'   // Paso 6: Validar Sello de Recepción
  | 'completado'    // Éxito: Sello recibido
  | 'contingencia'  // Conmutado a Contingencia por falla de red/timeout
  | 'error';        // Rechazado por validación de Hacienda

export interface TransmissionStepLog {
  step: DteTransmissionStep;
  label: string;
  status: 'pending' | 'in_progress' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: string;
  detailPayload?: any;
}

// Evento de Invalidación según Anexo 9.1
export interface DteInvalidacionPayload {
  identificacion: {
    version: number; // 2 o 3
    ambiente: DteAmbiente;
    codigoGeneracion: string;
    fecAnula: string;
    horAnula: string;
  };
  emisor: {
    nit: string;
    nombre: string;
    nomEstablecimiento?: string;
    telefono: string;
    correo: string;
  };
  documento: {
    tipoDte: TipoDte;
    codigoGeneracion: string; // Documento a anular
    selloRecibido: string;
    numeroControl: string;
    fecEmi: string;
    montoIva: number;
    codigoGeneracionR?: string; // Código del DTE de reemplazo si aplica
    tipoInvalidacion: number; // 1 = Datos incorrectos, 2 = Operación no realizada, 3 = Rescisión
    motivo: string;
  };
  motivo: {
    tipoInvalidacion: number;
    motivo: string;
    nombreResponsable: string;
    docuResponsable: string;
    tipDocResponsable: string;
    nombreSolicita: string;
    docuSolicita: string;
    tipDocSolicita: string;
  };
}
