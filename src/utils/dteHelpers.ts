import { TipoDte, DteAmbiente } from '../types/dte';

/**
 * Genera un Código de Generación compatible con el estándar UUID v4 de Hacienda (en MAYÚSCULAS)
 * Regex: ^[A-F0-9]{8}-[A-F0-9]{4}-4[A-F0-9]{3}-[89AB][A-F0-9]{3}-[A-F0-9]{12}$
 */
export function generateCodigoGeneracion(): string {
  // Use crypto.randomUUID() if available, ensure v4 and uppercase
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().toUpperCase();
  }
  
  // RFC4122 v4 generator fallback
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16).toUpperCase();
  });
}

/**
 * Valida si un código de generación cumple la norma exacta de la DGII
 */
export function isValidCodigoGeneracion(uuid: string): boolean {
  const regex = /^[A-F0-9]{8}-[A-F0-9]{4}-4[A-F0-9]{3}-[89AB][A-F0-9]{3}-[A-F0-9]{12}$/;
  return regex.test(uuid.toUpperCase());
}

/**
 * Genera el Número de Control oficial de 31 caracteres
 * Formato: DTE-XX-M000P000-000000000000001
 * @param tipoDte Código de 2 dígitos del DTE (ej: "01", "03")
 * @param tipoEstablecimiento 'C' | 'M' | 'B' | 'S' | 'P' (por defecto 'M')
 * @param codEstablecimiento 3 dígitos (ej: "001")
 * @param codPuntoVenta 3 dígitos (ej: "001")
 * @param correlativo Secuencial numérico (se formatea a 15 dígitos)
 */
export function generateNumeroControl(
  tipoDte: TipoDte,
  tipoEstablecimiento: string = 'M',
  codEstablecimiento: string = '001',
  codPuntoVenta: string = '001',
  correlativo: number = 1
): string {
  const padTipo = tipoDte.padStart(2, '0');
  const estChar = (tipoEstablecimiento || 'M').substring(0, 1).toUpperCase();
  const padEst = (codEstablecimiento || '001').padStart(3, '0').slice(-3);
  const padPV = (codPuntoVenta || '001').padStart(3, '0').slice(-3);
  const padCorrelativo = correlativo.toString().padStart(15, '0').slice(-15);

  return `DTE-${padTipo}-${estChar}${padEst}P${padPV}-${padCorrelativo}`;
}

/**
 * Genera la URL oficial para el código QR de Hacienda según ambiente
 */
export function generateDteQrUrl(
  ambiente: DteAmbiente,
  codigoGeneracion: string,
  fecEmi: string
): string {
  const baseUrl = ambiente === '01'
    ? 'https://factura.gob.sv/consultaDTE'
    : 'https://opefacturatest.mh.gob.sv/consultaDTE';

  return `${baseUrl}?ambiente=${ambiente}&codGen=${codigoGeneracion}&fechaEmi=${fecEmi}`;
}

/**
 * Convierte montos a formato oficial en letras en español según normativa salvadoreña
 * Ejemplo: 22.60 -> "VEINTIDOS 60/100 USD"
 */
export function numeroALetras(monto: number): string {
  if (isNaN(monto) || monto < 0) return 'CERO 00/100 USD';

  const enteros = Math.floor(monto);
  const centavos = Math.round((monto - enteros) * 100);
  const centavosStr = centavos.toString().padStart(2, '0') + '/100 USD';

  if (enteros === 0) return `CERO ${centavosStr}`;

  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const especiales = [
    'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'
  ];
  const decenas = [
    '', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'
  ];
  const centenas = [
    '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS',
    'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'
  ];

  function convertirCentenas(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'CIEN';

    let result = '';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (c > 0) result += centenas[c] + ' ';

    if (d === 1) {
      result += especiales[u];
    } else if (d === 2) {
      if (u === 0) result += 'VEINTE';
      else result += 'VEINTI' + unidades[u];
    } else if (d > 2) {
      result += decenas[d];
      if (u > 0) result += ' Y ' + unidades[u];
    } else if (u > 0) {
      result += unidades[u];
    }

    return result.trim();
  }

  function convertirMiles(n: number): string {
    if (n < 1000) return convertirCentenas(n);
    const miles = Math.floor(n / 1000);
    const resto = n % 1000;

    let res = '';
    if (miles === 1) {
      res = 'MIL';
    } else {
      res = convertirCentenas(miles) + ' MIL';
    }

    if (resto > 0) {
      res += ' ' + convertirCentenas(resto);
    }
    return res.trim();
  }

  function convertirMillones(n: number): string {
    if (n < 1000000) return convertirMiles(n);
    const mill = Math.floor(n / 1000000);
    const resto = n % 1000000;

    let res = '';
    if (mill === 1) {
      res = 'UN MILLON';
    } else {
      res = convertirMiles(mill) + ' MILLONES';
    }

    if (resto > 0) {
      res += ' ' + convertirMiles(resto);
    }
    return res.trim();
  }

  const textoEntero = convertirMillones(enteros);
  return `${textoEntero} ${centavosStr}`;
}

/**
 * Matriz legal de plazos máximos para invalidación (Sección 9.1)
 */
export function verificarPlazoInvalidacion(
  tipoDte: TipoDte,
  fechaEmisionStr: string // YYYY-MM-DD
): { permitido: boolean; diasTranscurridos: number; limiteTexto: string; advertencia?: string } {
  const fechaEmi = new Date(fechaEmisionStr + 'T00:00:00');
  const hoy = new Date();
  const diffMs = hoy.getTime() - fechaEmi.getTime();
  const diasTranscurridos = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  switch (tipoDte) {
    case '03': // Comprobante de Crédito Fiscal
    case '05': // Nota de Crédito
    case '06': // Nota de Débito
    case '07': // Comprobante de Retención
      // Límite: 1 día calendario posterior a la emisión
      if (diasTranscurridos <= 1) {
        return {
          permitido: true,
          diasTranscurridos,
          limiteTexto: '1 día calendario posterior a la emisión del Sello'
        };
      } else {
        return {
          permitido: false,
          diasTranscurridos,
          limiteTexto: '1 día calendario posterior a la emisión del Sello',
          advertencia: `Ha excedido el plazo legal máximo de 1 día calendario para ${tipoDte === '03' ? 'Crédito Fiscal' : 'Nota/Retención'}. (Días transcurridos: ${diasTranscurridos}). Según la DGII, debe emitirse una Nota de Crédito o justificar ante auditoría.`
        };
      }

    case '01': // Factura Electrónica
    case '11': // Factura de Exportación
    case '14': // Factura de Sujeto Excluido
      // Límite: 3 meses (aprox 90 días)
      if (diasTranscurridos <= 90) {
        return {
          permitido: true,
          diasTranscurridos,
          limiteTexto: '3 meses contados a partir de la emisión del Sello'
        };
      } else {
        return {
          permitido: false,
          diasTranscurridos,
          limiteTexto: '3 meses contados a partir de la emisión del Sello',
          advertencia: `Ha excedido el plazo legal de 3 meses para invalidar Facturas Electrónicas. (Días transcurridos: ${diasTranscurridos}).`
        };
      }

    case '04': // Remisión
    case '15': // Donación
      if (diasTranscurridos <= 4) {
        return {
          permitido: true,
          diasTranscurridos,
          limiteTexto: '4 días calendario posteriores a la emisión'
        };
      } else {
        return {
          permitido: false,
          diasTranscurridos,
          limiteTexto: '4 días calendario posteriores a la emisión',
          advertencia: `Ha excedido el plazo legal de 4 días calendario.`
        };
      }

    default:
      return {
        permitido: true,
        diasTranscurridos,
        limiteTexto: 'Plazo ordinario'
      };
  }
}

// Catálogo CAT-014: Departamentos de El Salvador
export const CATALOGO_DEPARTAMENTOS = [
  { codigo: '01', nombre: 'Ahuachapán' },
  { codigo: '02', nombre: 'Santa Ana' },
  { codigo: '03', nombre: 'Sonsonate' },
  { codigo: '04', nombre: 'Chalatenango' },
  { codigo: '05', nombre: 'La Libertad' },
  { codigo: '06', nombre: 'San Salvador' },
  { codigo: '07', nombre: 'Cuscatlán' },
  { codigo: '08', nombre: 'La Paz' },
  { codigo: '09', nombre: 'Cabañas' },
  { codigo: '10', nombre: 'San Vicente' },
  { codigo: '11', nombre: 'Usulután' },
  { codigo: '12', nombre: 'San Miguel' },
  { codigo: '13', nombre: 'Morazán' },
  { codigo: '14', nombre: 'La Unión' }
];

// Catálogo CAT-015: Municipios principales
export const CATALOGO_MUNICIPIOS_PRINCIPALES = [
  { depto: '06', codigo: '14', nombre: 'San Salvador Centro' },
  { depto: '06', codigo: '15', nombre: 'San Salvador Este' },
  { depto: '06', codigo: '16', nombre: 'San Salvador Oeste' },
  { depto: '06', codigo: '17', nombre: 'San Salvador Sur' },
  { depto: '05', codigo: '11', nombre: 'La Libertad Centro (Santa Tecla)' },
  { depto: '05', codigo: '12', nombre: 'La Libertad Sur' },
  { depto: '02', codigo: '01', nombre: 'Santa Ana Centro' },
  { depto: '12', codigo: '01', nombre: 'San Miguel Centro' }
];

// Mapeo de Municipios por Departamento
export const CATALOGO_MUNICIPIOS_POR_DEPTO: Record<string, { codigo: string; nombre: string }[]> = {
  '01': [{ codigo: '01', nombre: 'Ahuachapán Centro' }, { codigo: '02', nombre: 'Ahuachapán Norte' }, { codigo: '03', nombre: 'Ahuachapán Sur' }],
  '02': [{ codigo: '01', nombre: 'Santa Ana Centro' }, { codigo: '02', nombre: 'Santa Ana Este' }, { codigo: '03', nombre: 'Santa Ana Norte' }, { codigo: '04', nombre: 'Santa Ana Oeste' }],
  '03': [{ codigo: '01', nombre: 'Sonsonate Centro' }, { codigo: '02', nombre: 'Sonsonate Este' }, { codigo: '03', nombre: 'Sonsonate Norte' }, { codigo: '04', nombre: 'Sonsonate Oeste' }],
  '04': [{ codigo: '01', nombre: 'Chalatenango Centro' }, { codigo: '02', nombre: 'Chalatenango Norte' }, { codigo: '03', nombre: 'Chalatenango Sur' }],
  '05': [{ codigo: '11', nombre: 'La Libertad Centro (Santa Tecla)' }, { codigo: '12', nombre: 'La Libertad Sur' }, { codigo: '13', nombre: 'La Libertad Norte' }, { codigo: '14', nombre: 'La Libertad Este' }, { codigo: '15', nombre: 'La Libertad Oeste' }],
  '06': [
    { codigo: '14', nombre: 'San Salvador Centro' },
    { codigo: '15', nombre: 'San Salvador Este' },
    { codigo: '16', nombre: 'San Salvador Oeste' },
    { codigo: '17', nombre: 'San Salvador Sur' },
    { codigo: '18', nombre: 'San Salvador Norte' }
  ],
  '07': [{ codigo: '01', nombre: 'Cuscatlán Norte' }, { codigo: '02', nombre: 'Cuscatlán Sur' }],
  '08': [{ codigo: '01', nombre: 'La Paz Centro' }, { codigo: '02', nombre: 'La Paz Este' }, { codigo: '03', nombre: 'La Paz Oeste' }],
  '09': [{ codigo: '01', nombre: 'Cabañas Este' }, { codigo: '02', nombre: 'Cabañas Oeste' }],
  '10': [{ codigo: '01', nombre: 'San Vicente Norte' }, { codigo: '02', nombre: 'San Vicente Sur' }],
  '11': [{ codigo: '01', nombre: 'Usulután Centro' }, { codigo: '02', nombre: 'Usulután Este' }, { codigo: '03', nombre: 'Usulután Norte' }, { codigo: '04', nombre: 'Usulután Oeste' }],
  '12': [{ codigo: '01', nombre: 'San Miguel Centro' }, { codigo: '02', nombre: 'San Miguel Norte' }, { codigo: '03', nombre: 'San Miguel Oeste' }],
  '13': [{ codigo: '01', nombre: 'Morazán Norte' }, { codigo: '02', nombre: 'Morazán Sur' }],
  '14': [{ codigo: '01', nombre: 'La Unión Norte' }, { codigo: '02', nombre: 'La Unión Sur' }]
};

// Catálogo CAT-019: Actividades Económicas de referencia
export const CATALOGO_ACTIVIDADES_ECONOMICAS = [
  { codigo: '47110', nombre: 'Venta al por menor en comercios no especializados con surtido compuesto por alimentos, bebidas o tabaco' },
  { codigo: '47410', nombre: 'Venta al por menor de computadoras, equipo periférico, programas informáticos y equipo de telecomunicaciones' },
  { codigo: '47520', nombre: 'Venta al por menor de artículos de ferretería, pinturas y productos de vidrio en comercios especializados' },
  { codigo: '62010', nombre: 'Actividades de programación informática y desarrollo de software' },
  { codigo: '46510', nombre: 'Venta al por mayor de computadoras, equipo periférico y programas informáticos' },
  { codigo: '47910', nombre: 'Venta al por menor por correo o por internet (comercio electrónico)' }
];
