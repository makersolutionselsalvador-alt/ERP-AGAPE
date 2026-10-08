import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
  FileCode,
  QrCode,
  ArrowRight,
  Server,
  Lock,
  Send,
  FileCheck2,
  AlertOctagon,
  Printer
} from 'lucide-react';
import { TransmissionStepLog, DteDocumentoCompleto } from '../../types/dte';

interface DteTransmissionModalProps {
  isOpen: boolean;
  tipoDteNombre: string;
  clientName: string;
  totalMonto: number;
  currentStep: string;
  logs: TransmissionStepLog[];
  isCompleted: boolean;
  isContingency: boolean;
  selloRecibido?: string;
  fhProcesamiento?: string;
  errorMessage?: string;
  observaciones?: string[];
  dteDocument?: DteDocumentoCompleto;
  onRetry: () => void;
  onSwitchToContingency: () => void;
  onPrintTicketOnError?: () => void;
  onClose: () => void;
  onViewTicket: () => void;
}

export const DteTransmissionModal: React.FC<DteTransmissionModalProps> = ({
  isOpen,
  tipoDteNombre,
  clientName,
  totalMonto,
  currentStep,
  logs,
  isCompleted,
  isContingency,
  selloRecibido,
  fhProcesamiento,
  errorMessage,
  observaciones,
  dteDocument,
  onRetry,
  onSwitchToContingency,
  onPrintTicketOnError,
  onClose,
  onViewTicket
}) => {
  const [showJsonRaw, setShowJsonRaw] = useState(false);

  if (!isOpen) return null;

  const stepsDefinition = [
    { key: 'validando', label: '1. Validación', desc: 'Reglas de negocio y receptor (CAT-022, NRC)' },
    { key: 'generando', label: '2. Generación', desc: 'JSON DTE v2, UUID v4 y Nº de Control' },
    { key: 'firmando', label: '3. Firmado', desc: 'SVFE-API-Firmador (JWS CAdES / RSA512)' },
    { key: 'autenticando', label: '4. Autenticación', desc: 'Token JWT en /auth de Hacienda' },
    { key: 'transmitiendo', label: '5. Transmisión', desc: 'Envío seguro a /fesv/recepciondte' },
    { key: 'confirmando', label: '6. Confirmación', desc: 'Sello oficial de recepción de la DGII' }
  ];

  const getStepStatus = (stepKey: string) => {
    const log = logs.find(l => l.step === stepKey);
    if (!log) {
      if (isCompleted || isContingency) return 'completed';
      return 'pending';
    }
    return log.status;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="border-b border-slate-100 bg-slate-900 text-white px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">
                  Transmisión Oficial DTE — Ministerio de Hacienda
                </h3>
                <p className="text-[11px] text-slate-300">
                  {tipoDteNombre} • Cliente: <span className="text-white font-medium">{clientName}</span> • Total: <span className="font-mono text-emerald-400 font-bold">${totalMonto.toFixed(2)}</span>
                </p>
              </div>
            </div>
            {(isCompleted || isContingency || errorMessage) && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white rounded-lg p-1.5 transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Visual Step Pipeline Bar */}
          <div className="grid grid-cols-6 gap-1 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
            {stepsDefinition.map((s, idx) => {
              const status = getStepStatus(s.key);
              const isCurrent = currentStep === s.key;

              return (
                <div key={s.key} className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      status === 'success' || (isCompleted && status !== 'error')
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : isCurrent
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 animate-pulse'
                        : status === 'error'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {status === 'success' || (isCompleted && status !== 'error') ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : isCurrent ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : status === 'error' ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 font-semibold line-clamp-1 ${
                      isCurrent
                        ? 'text-indigo-600 font-bold'
                        : status === 'success'
                        ? 'text-emerald-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {s.label.split('. ')[1]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Success Banner */}
          {isCompleted && !isContingency && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Documento Tributario Electrónico Aprobado y Procesado</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-emerald-950 font-mono pt-1">
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block font-sans">Nº Control Oficial:</span>
                  <span className="font-bold text-slate-900">{dteDocument?.identificacion?.numeroControl || 'DTE-01-M001P001-...'}</span>
                </div>
                <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
                  <span className="text-[10px] text-slate-500 block font-sans">Sello de Recepción:</span>
                  <span className="font-bold text-emerald-700 truncate block" title={selloRecibido}>
                    {selloRecibido || '20261006...'}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-emerald-700">
                El documento cumple con todos los estándares criptográficos RSA512 y cuenta con validez fiscal oficial inmediata.
              </p>
            </div>
          )}

          {/* Contingency Banner */}
          {isContingency && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Emitido en Modo Diferido (Contingencia Oficial - Modelo 2)</span>
              </div>
              <p className="text-[11px] text-amber-800">
                El documento fue firmado criptográficamente de manera local. Se imprimirá con la leyenda reglamentaria <b>"CONTINGENCIA - DOCUMENTO PENDIENTE DE TRANSMISIÓN"</b> y se guardó en la cola para transmitirse automáticamente al restablecerse la conexión con la DGII.
              </p>
              <div className="text-[11px] font-mono text-amber-900 bg-white/70 p-2 rounded-lg border border-amber-200">
                Código Generación: {dteDocument?.identificacion?.codigoGeneracion}
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                  <AlertOctagon className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>Error en la Transmisión con Hacienda</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                  Impresión Habilitada
                </span>
              </div>
              <p className="text-[11px] text-rose-800 font-medium">
                {errorMessage}
              </p>
              {observaciones && observaciones.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-rose-900 uppercase">Observaciones de la DGII:</span>
                  <ul className="list-disc pl-4 text-[11px] text-rose-800 space-y-0.5">
                    {observaciones.map((obs, idx) => (
                      <li key={idx}>{obs}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Instant Ticket Print Callout on Error */}
              <div className="mt-2 pt-2.5 border-t border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/70 p-2.5 rounded-lg border border-rose-100">
                <div className="text-[11px] text-slate-800 leading-tight">
                  <span className="font-bold text-slate-900 block">¿Desea entregar el comprobante al cliente ahora?</span>
                  <span className="text-[10px] text-slate-500">
                    La venta se resguarda en Contingencia para retransmitirse a Hacienda.
                  </span>
                </div>
                {onPrintTicketOnError && (
                  <button
                    type="button"
                    onClick={onPrintTicketOnError}
                    className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0 transition-colors"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Imprimir Ticket de Compra</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Live Step Logs Console */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-indigo-600" />
                <span>Bitácora de Transmisión Síncrona</span>
              </span>
              <button
                type="button"
                onClick={() => setShowJsonRaw(!showJsonRaw)}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 cursor-pointer"
              >
                <FileCode className="h-3 w-3" />
                <span>{showJsonRaw ? 'Ocultar JSON' : 'Ver JSON DTE v2'}</span>
              </button>
            </div>

            <div className="bg-slate-900 rounded-xl p-3 text-slate-200 font-mono text-[11px] max-h-44 overflow-y-auto space-y-1.5 select-text shadow-inner">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                  <span
                    className={`shrink-0 font-bold ${
                      log.status === 'success'
                        ? 'text-emerald-400'
                        : log.status === 'in_progress'
                        ? 'text-amber-300'
                        : log.status === 'error'
                        ? 'text-rose-400'
                        : 'text-indigo-300'
                    }`}
                  >
                    {log.status === 'success'
                      ? '✓'
                      : log.status === 'in_progress'
                      ? '⟳'
                      : log.status === 'error'
                      ? '✗'
                      : 'ℹ'}
                  </span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))}
            </div>

            {/* Optional JSON Viewer */}
            {showJsonRaw && dteDocument && (
              <div className="bg-slate-950 rounded-xl p-3 text-slate-300 font-mono text-[10px] max-h-48 overflow-y-auto select-all border border-slate-800">
                <pre>{JSON.stringify(dteDocument, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-5 py-3.5">
          {isCompleted || isContingency ? (
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar Ventana
              </button>
              <button
                type="button"
                onClick={onViewTicket}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <QrCode className="h-4 w-4" />
                <span>Imprimir / Ver Comprobante Gráfico (DTE)</span>
              </button>
            </div>
          ) : errorMessage ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 w-full">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
                >
                  Corregir Datos
                </button>
                <button
                  type="button"
                  onClick={onRetry}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reintentar</span>
                </button>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onSwitchToContingency}
                  className="px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Conmutar Contingencia</span>
                </button>
                {onPrintTicketOnError && (
                  <button
                    type="button"
                    onClick={onPrintTicketOnError}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Imprimir Ticket de Compra</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-slate-500 text-xs w-full justify-center">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              <span>Procesando ciclo oficial de transmisión con el Ministerio de Hacienda...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
