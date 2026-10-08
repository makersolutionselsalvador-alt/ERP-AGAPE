import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Save,
  RotateCcw,
  Building2,
  Receipt,
  Shield,
  CheckCircle2,
  Database,
  Download,
  Upload,
  HardDrive,
  FileJson,
  Server,
  Layers,
  AlertTriangle,
  ShieldCheck,
  Lock,
  Globe
} from 'lucide-react';
import { CompanySettings } from '../../types';
import { AgapeLogo } from '../common/AgapeLogo';
import { getDatabaseDiagnostics } from '../../services/databaseService';
import { CATALOGO_ACTIVIDADES_ECONOMICAS, CATALOGO_DEPARTAMENTOS } from '../../utils/dteHelpers';

export const SettingsView: React.FC = () => {
  const {
    companySettings,
    updateCompanySettings,
    restoreDemoData,
    exportDatabase,
    importDatabase,
    resetDatabase
  } = useApp();

  const [formData, setFormData] = useState<CompanySettings>({
    ...companySettings
  });

  const [activeTab, setActiveTab] = useState<'general' | 'dte' | 'database'>('general');
  const [dbStats, setDbStats] = useState(getDatabaseDiagnostics());

  useEffect(() => {
    setDbStats(getDatabaseDiagnostics());
  }, [activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(formData);
  };

  const handleExportBackup = () => {
    const jsonStr = exportDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nexuserp_backup_${new Date().toISOString().substring(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        importDatabase(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Configuración y Base de Datos (RF-016)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Personaliza la identidad fiscal, parámetros de facturación, tickets y gestión de almacenamiento local/base de datos.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeTab === 'general'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Empresa & Tickets
          </button>
          <button
            onClick={() => setActiveTab('dte')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'dte'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span>Facturación DTE (Hacienda)</span>
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'database'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="h-3.5 w-3.5 text-indigo-600" />
            <span>Base de Datos & Respaldo</span>
          </button>
        </div>
      </div>

      {activeTab === 'general' ? (
        <form onSubmit={handleSubmit} className="space-y-6 text-xs">
          {/* Bloque 1: Datos de la Empresa */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            {/* Institutional Logo Showcase */}
            <div className="flex items-center gap-3 p-3 bg-blue-50/80 border border-blue-200 rounded-xl">
              <AgapeLogo variant="badge" size="lg" />
              <div>
                <h3 className="font-bold text-xs text-blue-900 uppercase">Logotipo Institucional Activo</h3>
                <p className="text-[11px] text-slate-600">Asociación AGAPE de El Salvador • Emblema de Amor y Servicio</p>
                <p className="text-[10px] text-amber-700 font-medium">Paloma de la paz con rayos solares dorados y azul real institucional.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 className="h-4 w-4 text-blue-900" />
              <h2 className="text-sm font-bold text-slate-900">Datos Fiscales y Comerciales de la Empresa</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Comercial (Marca)</label>
                <input
                  type="text"
                  required
                  value={formData.tradeName}
                  onChange={e => setFormData({ ...formData, tradeName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Razón Social</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIT / RUC / Doc. Fiscal</label>
                <input
                  type="text"
                  required
                  value={formData.taxId}
                  onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teléfono PBX</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Dirección Fiscal</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ciudad / País</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Bloque 2: Parámetros Monetarios y Tributarios */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Receipt className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">Parámetros Tributarios y de Moneda</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Símbolo Moneda</label>
                <input
                  type="text"
                  value={formData.currencySymbol}
                  onChange={e => setFormData({ ...formData, currencySymbol: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-center"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Código Moneda</label>
                <input
                  type="text"
                  value={formData.currencyCode}
                  onChange={e => setFormData({ ...formData, currencyCode: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-center"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Impuesto</label>
                <input
                  type="text"
                  value={formData.taxName}
                  onChange={e => setFormData({ ...formData, taxName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tasa Impositiva Defecto (%)</label>
                <input
                  type="number"
                  value={formData.defaultTaxRate}
                  onChange={e => setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* Bloque 3: Formato de Comprobantes Térmicos */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Receipt className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Mensajes de Encabezado y Pie de Ticket (POS)</h2>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Encabezado de Ticket (80mm)</label>
              <textarea
                rows={2}
                value={formData.ticketHeader}
                onChange={e => setFormData({ ...formData, ticketHeader: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pie de Ticket / Políticas de Garantía</label>
              <textarea
                rows={2}
                value={formData.ticketFooter}
                onChange={e => setFormData({ ...formData, ticketFooter: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Guardar Configuración General</span>
            </button>
          </div>
        </form>
      ) : activeTab === 'dte' ? (
        /* TAB DTE: HACIENDA NORMATIVA 2.0 CONFIGURATION */
        <form onSubmit={handleSubmit} className="space-y-6 text-xs animate-in fade-in">
          {/* Bloque DTE 1: Ambiente y Credenciales */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Parámetros de Conexión DGII (Ministerio de Hacienda)</h2>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700">
                Normativa 2.0
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ambiente de Destino (CAT-001) *
                </label>
                <select
                  value={formData.dteConfig?.ambiente || '00'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      dteConfig: { ...formData.dteConfig, ambiente: e.target.value as any }
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  <option value="00">00 — Pruebas (TEST) (https://apifacturatest.mh.gob.sv)</option>
                  <option value="01">01 — Producción (PROD) (https://api.dtes.mh.gob.sv)</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  En pruebas los tokens duran 48h; en producción duran 24h.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Modo de Operación / Handshake
                </label>
                <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.dteConfig?.modoSimulacion ?? true}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        dteConfig: { ...formData.dteConfig, modoSimulacion: e.target.checked }
                      })
                    }
                    className="rounded text-indigo-600 h-4 w-4"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block">Modo Simulación Inteligente</span>
                    <span className="text-[10px] text-slate-500">Permite pruebas continuas con fallback si el firmador Java no está activo</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NIT del Emisor (14 dígitos sin guiones) *</label>
                <input
                  type="text"
                  required
                  value={formData.dteConfig?.nitEmisor || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      dteConfig: { ...formData.dteConfig, nitEmisor: e.target.value.replace(/[^0-9]/g, '') }
                    })
                  }
                  placeholder="06141303861364"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NRC del Emisor (Registro Contribuyente) *</label>
                <input
                  type="text"
                  required
                  value={formData.dteConfig?.nrcEmisor || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      dteConfig: { ...formData.dteConfig, nrcEmisor: e.target.value.replace(/[^0-9]/g, '') }
                    })
                  }
                  placeholder="1234567"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Actividad Económica (CAT-019) *</label>
                <select
                  value={formData.dteConfig?.codActividad || '47110'}
                  onChange={e => {
                    const sel = CATALOGO_ACTIVIDADES_ECONOMICAS.find(a => a.codigo === e.target.value);
                    setFormData({
                      ...formData,
                      dteConfig: {
                        ...formData.dteConfig,
                        codActividad: e.target.value,
                        descActividad: sel?.nombre || formData.dteConfig?.descActividad
                      }
                    });
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  {CATALOGO_ACTIVIDADES_ECONOMICAS.map(a => (
                    <option key={a.codigo} value={a.codigo}>
                      {a.codigo} - {a.nombre.slice(0, 60)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción de Actividad</label>
                <input
                  type="text"
                  value={formData.dteConfig?.descActividad || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      dteConfig: { ...formData.dteConfig, descActividad: e.target.value }
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* Bloque DTE 2: Establecimiento y Punto de Venta */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building2 className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Establecimiento y Punto de Venta (Nº de Control)</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Establecimiento</label>
                <select
                  value={formData.dteConfig?.tipoEstablecimiento || 'M'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      dteConfig: { ...formData.dteConfig, tipoEstablecimiento: e.target.value as any }
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  <option value="M">M — Sucursal</option>
                  <option value="C">C — Casa Matriz</option>
                  <option value="B">B — Bodega</option>
                  <option value="P">P — Punto de Venta</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cód. Establecimiento (3 dígitos)</label>
                <input
                  type="text"
                  maxLength={3}
                  value={formData.dteConfig?.codEstablecimiento || '001'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      dteConfig: { ...formData.dteConfig, codEstablecimiento: e.target.value }
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cód. Punto de Venta (3 dígitos)</label>
                <input
                  type="text"
                  maxLength={3}
                  value={formData.dteConfig?.codPuntoVenta || '001'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      dteConfig: { ...formData.dteConfig, codPuntoVenta: e.target.value }
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Departamento (CAT-014)</label>
                <select
                  value={formData.dteConfig?.departamento || '06'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      dteConfig: { ...formData.dteConfig, departamento: e.target.value }
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                >
                  {CATALOGO_DEPARTAMENTOS.map(d => (
                    <option key={d.codigo} value={d.codigo}>
                      {d.codigo} — {d.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Municipio / Distrito (CAT-015)</label>
                <input
                  type="text"
                  value={formData.dteConfig?.municipio || '14'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      dteConfig: { ...formData.dteConfig, municipio: e.target.value }
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Bloque DTE 3: Microservicio Local de Firma Java (SVFE-API-Firmador) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Lock className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Microservicio Local de Firma y Llaves Criptográficas</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  URL del Microservicio SVFE Local *
                </label>
                <input
                  type="text"
                  value={formData.dteConfig?.firmadorUrl || 'http://localhost:8080/firmardocumento/'}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      dteConfig: { ...formData.dteConfig, firmadorUrl: e.target.value }
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Ejecutable Java oficial: svfe-api-firmador-2.0.0-exec.jar (puerto 8080 u 8113).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clave Privada del Certificado (.crt) *
                </label>
                <input
                  type="password"
                  value={formData.dteConfig?.firmadorPasswordPri || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      dteConfig: { ...formData.dteConfig, firmadorPasswordPri: e.target.value }
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Clave de Acceso API Hacienda (/auth) *
                </label>
                <input
                  type="password"
                  value={formData.dteConfig?.mhAuthPassword || ''}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      dteConfig: { ...formData.dteConfig, mhAuthPassword: e.target.value }
                    })
                  }
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Guardar Parámetros DTE Hacienda</span>
            </button>
          </div>
        </form>
      ) : (
        /* TAB 2: DATABASE & BACKUP MANAGEMENT */
        <div className="space-y-6 text-xs animate-in fade-in">
          {/* Status Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <HardDrive className="h-4 w-4 text-indigo-600" />
                <span className="font-semibold text-[11px] uppercase tracking-wider">Espacio Ocupado</span>
              </div>
              <p className="text-xl font-bold font-mono text-slate-900">{dbStats.formattedSize}</p>
              <p className="text-[11px] text-slate-500 mt-1">Almacenamiento JSON local</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Layers className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-[11px] uppercase tracking-wider">Total de Registros</span>
              </div>
              <p className="text-xl font-bold font-mono text-slate-900">{dbStats.totalRecords}</p>
              <p className="text-[11px] text-slate-500 mt-1">En {dbStats.collections.length} tablas/colecciones</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 mb-1">
                <Server className="h-4 w-4 text-purple-600" />
                <span className="font-semibold text-[11px] uppercase tracking-wider">Estado de Conexión</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-900">Local Repository Activo</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Listo para Cloud SQL / PostgreSQL</p>
            </div>
          </div>

          {/* Backup & Restore Controls */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Copias de Seguridad del Sistema (RF-069)</h3>
                <p className="text-xs text-slate-500">
                  Exporta e importa todo el inventario, ventas, clientes y configuraciones en archivos locales (.json).
                </p>
              </div>
              <FileJson className="h-5 w-5 text-indigo-600" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Export Button */}
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-indigo-950 text-xs flex items-center gap-1.5">
                    <Download className="h-4 w-4 text-indigo-600" />
                    <span>Descargar Respaldo Completo</span>
                  </h4>
                  <p className="text-[11px] text-indigo-800/80 mt-1">
                    Genera un archivo JSON fechado con el estado íntegro de todas las tablas y movimientos.
                  </p>
                </div>
                <button
                  onClick={handleExportBackup}
                  className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Exportar Copia de Seguridad (.json)</span>
                </button>
              </div>

              {/* Import Button */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Upload className="h-4 w-4 text-slate-600" />
                    <span>Restaurar Copia de Seguridad</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Carga un archivo de respaldo JSON generado previamente para restaurar el sistema.
                  </p>
                </div>
                <label className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer text-center">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Seleccionar Archivo de Respaldo</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportBackup}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Database Diagnostics Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Estructura de Tablas y Almacenamiento</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {dbStats.collections.map(c => (
                <div key={c.collection} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-mono text-slate-500 text-[10px] block truncate">{c.collection}</span>
                  <span className="font-bold text-slate-800 text-xs">{c.count} registros</span>
                </div>
              ))}
            </div>
          </div>

          {/* Factory Reset */}
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-rose-950 text-xs flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Restablecer Datos de Demostración</span>
              </h4>
              <p className="text-[11px] text-rose-800 mt-0.5 max-w-xl">
                Esta acción reinicia todas las tablas al catálogo inicial de prueba (productos, combos, clientes, empleados y ventas de ejemplo).
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('¿Confirmas que deseas reiniciar todas las tablas a los datos de demostración de fábrica?')) {
                  resetDatabase();
                }
              }}
              className="py-2 px-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reiniciar a Fábrica</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

