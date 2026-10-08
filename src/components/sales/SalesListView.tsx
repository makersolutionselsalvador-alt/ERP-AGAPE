import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  Filter,
  Printer,
  Ban,
  RotateCcw,
  Download,
  Calendar,
  Eye,
  FileSpreadsheet,
  AlertTriangle,
  ShieldCheck,
  Send,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { Sale } from '../../types';
import { verificarPlazoInvalidacion } from '../../utils/dteHelpers';

export const SalesListView: React.FC = () => {
  const { sales, voidSale, processReturn, setSelectedSaleForTicket, companySettings, transmitDteContingency, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedDteFilter, setSelectedDteFilter] = useState<string>('all');
  const [transmittingSaleId, setTransmittingSaleId] = useState<string | null>(null);
  const [isBatchTransmitting, setIsBatchTransmitting] = useState(false);

  // Void modal
  const [voidingSale, setVoidingSale] = useState<Sale | null>(null);
  const [voidReason, setVoidReason] = useState('');

  // Return modal
  const [returningSale, setReturningSale] = useState<Sale | null>(null);
  const [returnProductId, setReturnProductId] = useState('');
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState('');

  // Contingency & Pending Retransmit sales
  const pendingRetransmitSales = useMemo(() => {
    return sales.filter(
      s => s.estadoDte === 'CONTINGENCIA' || s.estadoDte === 'PENDIENTE_RETRANSMISION' || (s.estadoDte === 'RECHAZADO' && !s.selloRecibido)
    );
  }, [sales]);

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      const matchesSearch =
        searchTerm === '' ||
        s.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.invoiceNumber && s.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.codigoGeneracion && s.codigoGeneracion.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
      const matchesMethod = selectedMethod === 'all' || s.paymentMethod === selectedMethod;

      const isPendingRetransmit =
        s.estadoDte === 'CONTINGENCIA' || s.estadoDte === 'PENDIENTE_RETRANSMISION' || (s.estadoDte === 'RECHAZADO' && !s.selloRecibido);

      const matchesDte =
        selectedDteFilter === 'all' ||
        (selectedDteFilter === 'pending' && isPendingRetransmit) ||
        (selectedDteFilter === 'processed' && s.estadoDte === 'PROCESADO');

      return matchesSearch && matchesStatus && matchesMethod && matchesDte;
    });
  }, [sales, searchTerm, selectedStatus, selectedMethod, selectedDteFilter]);

  const handleRetransmitOne = async (saleId: string) => {
    setTransmittingSaleId(saleId);
    try {
      await transmitDteContingency(saleId);
    } finally {
      setTransmittingSaleId(null);
    }
  };

  const handleBatchRetransmitAll = async () => {
    if (pendingRetransmitSales.length === 0) return;
    setIsBatchTransmitting(true);
    try {
      for (const sale of pendingRetransmitSales) {
        await transmitDteContingency(sale.id);
        await new Promise(r => setTimeout(r, 40));
      }
      showToast(`Se transmitieron ${pendingRetransmitSales.length} ventas a Hacienda con éxito`, 'success');
    } finally {
      setIsBatchTransmitting(false);
    }
  };

  const handleConfirmVoid = () => {
    if (!voidingSale) return;
    if (!voidReason.trim()) {
      alert('Debes ingresar un motivo de anulación');
      return;
    }
    voidSale(voidingSale.id, voidReason);
    setVoidingSale(null);
    setVoidReason('');
  };

  const handleConfirmReturn = () => {
    if (!returningSale || !returnProductId) return;
    processReturn(returningSale.id, returnProductId, returnQty, returnReason || 'Garantía / Devolución');
    setReturningSale(null);
    setReturnProductId('');
    setReturnQty(1);
    setReturnReason('');
  };

  const exportToCsv = () => {
    const headers = ['Ticket', 'Factura', 'Fecha', 'Cliente', 'Vendedor', 'Método', 'Estado', 'Total'];
    const rows = filteredSales.map(s => [
      s.ticketNumber,
      s.invoiceNumber || '',
      s.createdAt,
      `"${s.clientName}"`,
      `"${s.sellerName}"`,
      s.paymentMethod,
      s.status,
      s.total.toFixed(2)
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_ventas_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Consultar Ventas Procesadas (RF-048)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro histórico de tickets, reimpresión, anulaciones y gestión de devoluciones.
          </p>
        </div>

        <button
          onClick={exportToCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
          <span>Exportar CSV (RF-069)</span>
        </button>
      </div>

      {/* Banner de ventas pendientes de re-transmisión a Hacienda */}
      {pendingRetransmitSales.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>
              Hay <b>{pendingRetransmitSales.length}</b> venta(s) guardada(s) pendiente(s) de re-transmitir al Ministerio de Hacienda (DGII).
            </span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleBatchRetransmitAll}
              disabled={isBatchTransmitting}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isBatchTransmitting ? 'animate-spin' : ''}`} />
              <span>{isBatchTransmitting ? 'Transmitiendo...' : 'Re-transmitir Todas a Hacienda'}</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedDteFilter(selectedDteFilter === 'pending' ? 'all' : 'pending')}
              className="px-2.5 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-lg font-medium text-xs transition-colors cursor-pointer"
            >
              {selectedDteFilter === 'pending' ? 'Ver Todas' : 'Filtrar Pendientes'}
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por ticket, cliente o factura..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={e => setSelectedStatus(e.target.value)}
          className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="all">Todos los estados</option>
          <option value="Completada">Completada</option>
          <option value="Anulada">Anulada</option>
        </select>

        <select
          value={selectedMethod}
          onChange={e => setSelectedMethod(e.target.value)}
          className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700"
        >
          <option value="all">Todos los métodos de pago</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Tarjeta">Tarjeta</option>
          <option value="Transferencia">Transferencia</option>
          <option value="Crédito">Crédito</option>
        </select>

        <select
          value={selectedDteFilter}
          onChange={e => setSelectedDteFilter(e.target.value)}
          className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium"
        >
          <option value="all">Todos los DTEs</option>
          <option value="processed">DTE Aprobados MH</option>
          <option value="pending">⚠️ Pendientes Re-transmisión</option>
        </select>
      </div>

      {/* Sales Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Ticket</th>
                <th className="py-2.5 px-3">Fecha y Hora</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Cajero / Vendedor</th>
                <th className="py-2.5 px-3">Método</th>
                <th className="py-2.5 px-3 text-right">Subtotal</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          sale.dteType === '03'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {sale.dteType || '01'}
                      </span>
                      <span className="font-bold text-slate-900">{sale.ticketNumber}</span>
                    </div>
                    {sale.numeroControl && (
                      <span className="text-[10px] text-slate-400 block font-sans truncate max-w-[150px]" title={sale.numeroControl}>
                        {sale.numeroControl}
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono tabular-nums">
                    {sale.createdAt}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {sale.clientName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {sale.sellerName}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[11px] text-slate-600">
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                    ${sale.subtotal.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    ${sale.total.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded ${
                          sale.status === 'Completada'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {sale.status}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          sale.estadoDte === 'PROCESADO'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sale.estadoDte === 'CONTINGENCIA' || sale.estadoDte === 'PENDIENTE_RETRANSMISION'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : sale.estadoDte === 'INVALIDADO'
                            ? 'bg-slate-100 text-slate-600 line-through'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {(sale.estadoDte === 'CONTINGENCIA' || sale.estadoDte === 'PENDIENTE_RETRANSMISION') && (
                          <AlertTriangle className="h-2.5 w-2.5 text-amber-600 shrink-0" />
                        )}
                        {sale.estadoDte === 'PROCESADO' && (
                          <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600 shrink-0" />
                        )}
                        <span>
                          {sale.estadoDte === 'PENDIENTE_RETRANSMISION'
                            ? 'Pend. Re-transmisión'
                            : sale.estadoDte === 'CONTINGENCIA'
                            ? 'Contingencia'
                            : sale.estadoDte || 'PROCESADO'}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* Direct DTE Retransmit if unsent/contingency */}
                      {(sale.estadoDte === 'CONTINGENCIA' ||
                        sale.estadoDte === 'PENDIENTE_RETRANSMISION' ||
                        (sale.estadoDte === 'RECHAZADO' && !sale.selloRecibido)) && (
                        <button
                          type="button"
                          onClick={() => handleRetransmitOne(sale.id)}
                          disabled={transmittingSaleId === sale.id}
                          className="p-1 text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded transition-colors disabled:opacity-50 cursor-pointer"
                          title="Re-transmitir a Hacienda ahora"
                        >
                          <Send className={`h-3.5 w-3.5 ${transmittingSaleId === sale.id ? 'animate-pulse' : ''}`} />
                        </button>
                      )}

                      {/* Ticket Reprint (RF-049) */}
                      <button
                        onClick={() => setSelectedSaleForTicket(sale)}
                        className="p-1 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                        title="Reimprimir o generar ticket (RF-049)"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>

                      {/* Return (RF-051) */}
                      {sale.status === 'Completada' && (
                        <button
                          onClick={() => {
                            setReturningSale(sale);
                            setReturnProductId(sale.items[0]?.productId || '');
                          }}
                          className="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Gestionar devolución de ítem (RF-051)"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Void Sale (RF-050) */}
                      {sale.status === 'Completada' && (
                        <button
                          onClick={() => setVoidingSale(sale)}
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Anular venta y reponer inventario (RF-050)"
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No se encontraron ventas que coincidan con los criterios seleccionados.
          </div>
        )}
      </div>

      {/* VOID SALE MODAL (RF-050) / EVENTO DE INVALIDACIÓN DTE (Anexo 9.1) */}
      {voidingSale && (() => {
        const fechaEmi = voidingSale.createdAt ? voidingSale.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10);
        const plazo = verificarPlazoInvalidacion(voidingSale.dteType || '01', fechaEmi);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-bold text-sm text-slate-900">
                  Anular / Invalidar Venta {voidingSale.ticketNumber}
                </h3>
              </div>

              {/* Legal Warning Notice */}
              {!plazo.permitido ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
                  <span className="font-bold block text-[11px] text-rose-800">
                    AVISO DE PLAZO LEGAL VENCIDO (DGII):
                  </span>
                  <p className="text-[11px] text-rose-700 leading-relaxed">
                    {plazo.advertencia}
                  </p>
                  <p className="text-[10px] text-rose-600 font-medium">
                    Plazo reglamentario máximo: {plazo.limiteTexto}.
                  </p>
                </div>
              ) : (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px]">
                  ✓ Plazo legal hábil: Dentro del límite legal de {plazo.limiteTexto}.
                </div>
              )}

              <p className="text-slate-600">
                Esta acción emitirá un evento de invalidación ante la DGII, revertirá las existencias en inventario y anulará el comprobante por un monto de{' '}
                <strong className="text-slate-900">${voidingSale.total.toFixed(2)}</strong>.
              </p>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Motivo de la invalidación / anulación *
                </label>
                <textarea
                  rows={3}
                  value={voidReason}
                  onChange={e => setVoidReason(e.target.value)}
                  placeholder="Error de digitación, cancelación por el cliente, devolución..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setVoidingSale(null)}
                  className="flex-1 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmVoid}
                  className="flex-1 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Confirmar Invalidación
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* RETURN MODAL (RF-051) */}
      {returningSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-amber-600">
              <RotateCcw className="h-5 w-5" />
              <h3 className="font-bold text-sm text-slate-900">
                Gestionar Devolución ({returningSale.ticketNumber})
              </h3>
            </div>
            <p className="text-slate-600">
              Selecciona el ítem que el cliente devuelve para reincorporarlo al stock del almacén.
            </p>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Producto a Devolver</label>
              <select
                value={returnProductId}
                onChange={e => setReturnProductId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                {returningSale.items.map(item => (
                  <option key={item.productId} value={item.productId}>
                    {item.productName} ({item.quantity} unidades compradas)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cantidad a Devolver</label>
              <input
                type="number"
                min="1"
                max={returningSale.items.find(i => i.productId === returnProductId)?.quantity || 1}
                value={returnQty}
                onChange={e => setReturnQty(parseInt(e.target.value) || 1)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Motivo</label>
              <input
                type="text"
                value={returnReason}
                onChange={e => setReturnReason(e.target.value)}
                placeholder="Falla técnica de fábrica, cambio de producto..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReturningSale(null)}
                className="flex-1 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                className="flex-1 py-2 font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg"
              >
                Procesar Devolución
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
