import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Printer, Download, X, CheckCircle2, ShieldCheck, FileJson, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { AgapeLogo } from './AgapeLogo';
import { numeroALetras } from '../../utils/dteHelpers';

export const TicketModal: React.FC = () => {
  const { selectedSaleForTicket, setSelectedSaleForTicket, companySettings } = useApp();
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!selectedSaleForTicket) return null;

  const sale = selectedSaleForTicket;
  const dteConfig = companySettings.dteConfig;
  const ambiente = dteConfig?.ambiente || '00';
  const isCcf = sale.dteType === '03';
  const isContingency = sale.estadoDte === 'CONTINGENCIA';
  const fecEmi = sale.createdAt ? sale.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10);
  const codGen = sale.codigoGeneracion || '4A8B9C10-D2E3-4F56-A789-0123456789AB';
  const totalEnLetras = numeroALetras(sale.total);

  const handlePrint = () => {
    window.print();
  };

  const copyGenerationCode = () => {
    navigator.clipboard.writeText(codGen);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadJson = () => {
    let jsonContent = sale.dteJsonRaw;
    if (!jsonContent) {
      jsonContent = JSON.stringify(
        {
          identificacion: {
            version: 2,
            ambiente,
            tipoDte: sale.dteType || '01',
            numeroControl: sale.numeroControl,
            codigoGeneracion: sale.codigoGeneracion,
            tipoModelo: sale.tipoModelo || 1,
            tipoOperacion: isContingency ? 2 : 1,
            fecEmi,
            horEmi: sale.createdAt?.substring(11, 19) || '12:00:00',
            tipoMoneda: 'USD'
          },
          emisor: {
            nit: dteConfig?.nitEmisor || '03151703840015',
            nrc: dteConfig?.nrcEmisor || '1234567',
            nombre: companySettings.name,
            codActividad: dteConfig?.codActividad || '47110',
            descActividad: dteConfig?.descActividad || 'Venta al por menor en comercios no especializados',
            direccion: {
              departamento: dteConfig?.departamento || '03',
              municipio: dteConfig?.municipio || '15',
              complemento: companySettings.address
            },
            telefono: companySettings.phone,
            correo: companySettings.email
          },
          receptor: {
            nombre: sale.clientName
          },
          resumen: {
            totalGravada: sale.subtotal,
            totalPagar: sale.total,
            totalLetras: totalEnLetras
          },
          selloRecibido: sale.selloRecibido
        },
        null,
        2
      );
    }

    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DTE-${sale.dteType || '01'}-${codGen}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTxt = () => {
    const textContent = `
=========================================
      ASOCIACIÓN AGAPE DE EL SALVADOR
           Amor y Servicio
=========================================
TICKET DE VENTA: ${sale.ticketNumber}
FECHA: ${sale.createdAt}
CLIENTE: ${sale.clientName}
DIR: ${companySettings.address}, ${companySettings.city}
TEL: ${companySettings.phone}
=========================================
CANT  DESCRIPCIÓN             TOTAL
-----------------------------------------
${sale.items
  .map(
    i =>
      `${i.quantity.toString().padEnd(4)}  ${(i.isCombo ? '[COMBO] ' : '') + i.productName}`.slice(0, 26).padEnd(27) +
      ` $${i.total.toFixed(2).padStart(7)}`
  )
  .join('\n')}
-----------------------------------------
SUBTOTAL:                    $${sale.subtotal.toFixed(2)}
IVA 13%:                     $${sale.taxAmount.toFixed(2)}
${sale.discountAmount && sale.discountAmount > 0 ? `DESCUENTO:                  -$${sale.discountAmount.toFixed(2)}\n` : ''}TOTAL A PAGAR:               $${sale.total.toFixed(2)}
SON: ${totalEnLetras}
-----------------------------------------
FORMAS DE PAGO:
${sale.paymentDetails && sale.paymentDetails.length > 0
  ? sale.paymentDetails.map(p => `  * ${p.method}: $${p.amount.toFixed(2)}${p.percentage ? ` (${p.percentage}%)` : ''}${p.reference ? ` [Ref: ${p.reference}]` : ''}`).join('\n')
  : `  * ${sale.paymentMethod}: $${sale.amountPaid.toFixed(2)}`}
${sale.changeGiven > 0 ? `CAMBIO / VUELTO:             $${sale.changeGiven.toFixed(2)}\n` : ''}=========================================
${companySettings.ticketHeader}
${companySettings.ticketFooter}
=========================================
    `.trim();

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ticket-${sale.ticketNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-auto max-h-[95vh] flex flex-col">
        {/* Modal Top Bar (no-print) */}
        <div className="flex items-center justify-between border-b border-blue-900 bg-blue-900 text-white px-4 py-3 no-print shrink-0">
          <div className="flex items-center gap-2">
            <AgapeLogo variant="badge" size="sm" />
            <div className="flex flex-col">
              <span className="text-xs font-bold tracking-tight">
                Ticket de Venta — {companySettings.tradeName}
              </span>
              <span className="text-[10px] text-amber-300 font-medium">
                Comprobante Comercial Limpio
              </span>
            </div>
          </div>
          <button
            onClick={() => setSelectedSaleForTicket(null)}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-blue-800 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Printable Ticket Body (This prints on 58mm/80mm thermal receipt) */}
        <div className="p-6 bg-white text-slate-900 font-mono text-xs select-text overflow-y-auto flex-1" id="printable-ticket">
          {/* Institutional AGAPE Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-300">
            <AgapeLogo variant="monochrome" size="md" className="mb-2" showSubtitle={false} />
            <h1 className="font-extrabold text-sm tracking-tight text-slate-950 font-sans uppercase">
              {companySettings.name}
            </h1>
            <p className="text-[10px] text-slate-600 font-sans font-semibold">
              Amor y Servicio • Sonsonate
            </p>
            <p className="text-[9px] text-slate-500 font-sans mt-0.5">
              {companySettings.address}
            </p>
            <p className="text-[9px] text-slate-500 font-sans">
              Tel: {companySettings.phone} • {companySettings.email}
            </p>
          </div>

          {/* Ticket Information */}
          <div className="py-2.5 border-b border-dashed border-slate-300 text-[11px] space-y-1 font-mono">
            <div className="flex justify-between items-baseline font-bold text-slate-950">
              <span>TICKET Nº:</span>
              <span className="text-xs">{sale.ticketNumber}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Fecha:</span>
              <span className="tabular-nums">{sale.createdAt}</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Cliente:</span>
              <span className="font-semibold truncate max-w-[210px]">{sale.clientName}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-2.5 border-b border-dashed border-slate-300">
            <div className="flex justify-between text-[9px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">
              <span>Cant. / Descripción</span>
              <span>Total</span>
            </div>
            <div className="space-y-1.5">
              {sale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-[10px]">
                  <div className="pr-2">
                    <span className="font-semibold text-slate-950">{item.quantity}x</span>{' '}
                    {item.isCombo && (
                      <span className="px-1 py-0.2 rounded text-[8px] font-black bg-blue-100 text-blue-900 mr-0.5">
                        COMBO
                      </span>
                    )}
                    <span className="text-slate-800">{item.productName}</span>
                    <span className="block text-[9px] text-slate-400">
                      P. Unit: ${item.unitPrice.toFixed(2)}
                    </span>
                  </div>
                  <span className="tabular-nums font-semibold text-slate-950 shrink-0">
                    ${item.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="py-2.5 border-b border-dashed border-slate-300 text-[10px] space-y-1">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="tabular-nums font-medium">${sale.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>IVA (13% incluido):</span>
              <span className="tabular-nums font-medium">${sale.taxAmount.toFixed(2)}</span>
            </div>
            {sale.discountAmount && sale.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Descuento aplicado:</span>
                <span className="tabular-nums">-${sale.discountAmount.toFixed(2)}</span>
              </div>
            )}
            {sale.retencionIva1 && sale.retencionIva1 > 0 && (
              <div className="flex justify-between text-rose-700 font-semibold">
                <span>Retención 1% IVA:</span>
                <span className="tabular-nums">-${sale.retencionIva1.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs font-bold text-slate-950 pt-1.5 border-t border-slate-200">
              <span>MONTO TOTAL A PAGAR:</span>
              <span className="tabular-nums font-sans text-sm">${sale.total.toFixed(2)}</span>
            </div>
            <div className="pt-0.5 text-[9px] text-slate-600 italic">
              Son: {totalEnLetras}
            </div>
          </div>

          {/* Payment Breakdown (Multiple / Mixed Payment Support) */}
          <div className="py-2.5 border-b border-dashed border-slate-300 text-[10px] space-y-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
              Detalle de Pago:
            </span>
            {sale.paymentDetails && sale.paymentDetails.length > 0 ? (
              <div className="space-y-1">
                {sale.paymentDetails.map((pay, i) => (
                  <div key={i} className="flex justify-between text-slate-700">
                    <span className="flex items-center gap-1">
                      <span>• {pay.method}</span>
                      {pay.percentage ? (
                        <span className="text-[9px] text-slate-400">({pay.percentage}%)</span>
                      ) : null}
                    </span>
                    <span className="tabular-nums font-semibold">${pay.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-between text-slate-700">
                <span>• {sale.paymentMethod}:</span>
                <span className="tabular-nums font-semibold">${sale.total.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
              <span>Total Recibido:</span>
              <span className="tabular-nums font-medium">${sale.amountPaid.toFixed(2)}</span>
            </div>
            {sale.changeGiven > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Cambio / Vuelto:</span>
                <span className="tabular-nums font-sans text-xs">${sale.changeGiven.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Clean Institutional Footer */}
          <div className="pt-3 text-center space-y-1 text-[9px] text-slate-600 font-sans">
            <p className="font-bold text-blue-900">{companySettings.ticketHeader}</p>
            <p className="text-slate-500">{companySettings.ticketFooter}</p>
            <p className="text-[8px] text-slate-400 mt-2 font-mono">
              Conserve este ticket como comprobante de compra.
            </p>
          </div>
        </div>

        {/* Technical DTE Details Accordion (no-print: visible on screen if needed, NOT printed) */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 no-print shrink-0">
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-600 hover:text-blue-900 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-700" />
              <span>Ver Referencia DTE Digital (Solo Consulta)</span>
            </span>
            {showTechnicalDetails ? (
              <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="mt-2.5 p-2.5 bg-white rounded-xl border border-slate-200 text-[10px] space-y-1.5 font-mono animate-in fade-in">
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500 font-sans">Nº Control:</span>
                <span className="font-bold text-slate-900">{sale.numeroControl || 'DTE-01-...'}</span>
              </div>
              <div className="flex justify-between items-baseline gap-1">
                <span className="text-slate-500 font-sans">Cód. Gen:</span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-blue-950 truncate max-w-[190px]">{codGen}</span>
                  <button
                    onClick={copyGenerationCode}
                    className="p-0.5 text-slate-400 hover:text-blue-700 rounded cursor-pointer"
                    title="Copiar código UUID"
                  >
                    {copiedCode ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="text-slate-500 font-sans">Estado MH:</span>
                <span
                  className={`font-bold px-1.5 py-0.2 rounded text-[9px] ${
                    isContingency
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {sale.estadoDte || 'PROCESADO'}
                </span>
              </div>
              {sale.selloRecibido && (
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-500 font-sans">Sello MH:</span>
                  <span className="font-bold text-emerald-700 truncate max-w-[190px]">{sale.selloRecibido}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions (no-print) */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-2 no-print shrink-0">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Imprimir Ticket</span>
          </button>
          <button
            onClick={handleDownloadJson}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-900 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
            title="Descargar archivo JSON DTE oficial para contabilidad"
          >
            <FileJson className="h-3.5 w-3.5" />
            <span>JSON DTE</span>
          </button>
          <button
            onClick={handleDownloadTxt}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            title="Descargar en texto plano"
          >
            <Download className="h-3.5 w-3.5" />
            <span>TXT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
