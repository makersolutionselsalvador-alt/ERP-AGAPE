import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  History
} from 'lucide-react';
import { AccountPayable } from '../../types';

export const AccountsPayableView: React.FC = () => {
  const { accountsPayable, registerSupplierPayment } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Payment Modal (RF-043)
  const [selectedAP, setSelectedAP] = useState<AccountPayable | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('Transferencia');
  const [reference, setReference] = useState('');

  // History Modal
  const [viewingAP, setViewingAP] = useState<AccountPayable | null>(null);

  const filteredAP = useMemo(() => {
    return accountsPayable.filter(ap => {
      const matchesSearch =
        searchTerm === '' ||
        ap.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ap.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || ap.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [accountsPayable, searchTerm, statusFilter]);

  const totalPayable = filteredAP.reduce((acc, a) => acc + a.totalAmount, 0);
  const totalPaid = filteredAP.reduce((acc, a) => acc + a.paidAmount, 0);
  const totalPending = filteredAP.reduce((acc, a) => acc + a.balance, 0);

  const openPaymentModal = (ap: AccountPayable) => {
    setSelectedAP(ap);
    setPaymentAmount(ap.balance.toString());
    setPaymentMethod('Transferencia');
    setReference(`Pago transferencia factura ${ap.invoiceNumber}`);
  };

  const handleRegisterPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAP) return;
    const amount = parseFloat(paymentAmount) || 0;
    if (amount <= 0 || amount > selectedAP.balance) {
      alert('El monto a pagar es inválido o supera el saldo pendiente');
      return;
    }

    registerSupplierPayment(selectedAP.id, amount, paymentMethod, reference);
    setSelectedAP(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Cuentas por Pagar a Proveedores (RF-042 / RF-044)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de obligaciones comerciales contraídas en compras a crédito y registro de pagos.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] text-slate-500 block">Total Compras al Crédito</span>
          <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
            ${totalPayable.toFixed(2)}
          </span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] text-slate-500 block">Total Abonado a Proveedores</span>
          <span className="text-lg font-bold font-mono text-emerald-700 tabular-nums">
            ${totalPaid.toFixed(2)}
          </span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] text-slate-500 block">Saldo Acreedor Pendiente (RF-044)</span>
          <span className="text-lg font-bold font-mono text-rose-600 tabular-nums">
            ${totalPending.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por proveedor o número de factura..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs"
        >
          <option value="all">Todos los estados</option>
          <option value="PENDIENTE">PENDIENTE</option>
          <option value="VENCIDO">VENCIDO</option>
          <option value="PAGADO">PAGADO</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Factura Prov.</th>
                <th className="py-2.5 px-3">Proveedor</th>
                <th className="py-2.5 px-3">Fecha Compra</th>
                <th className="py-2.5 px-3">Vencimiento</th>
                <th className="py-2.5 px-3 text-right">Monto Factura</th>
                <th className="py-2.5 px-3 text-right">Monto Pagado</th>
                <th className="py-2.5 px-3 text-right">Saldo por Pagar</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAP.map(ap => (
                <tr key={ap.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {ap.invoiceNumber}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">
                    {ap.supplierName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono tabular-nums">
                    {ap.issueDate}
                  </td>
                  <td className="py-2.5 px-3 font-mono tabular-nums text-slate-600">
                    {ap.dueDate}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                    ${ap.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                    ${ap.paidAmount.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                    <span className={ap.balance > 0 ? 'text-rose-600' : 'text-slate-400'}>
                      ${ap.balance.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded ${
                        ap.status === 'PAGADO'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ap.status === 'VENCIDO'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {ap.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {ap.balance > 0 && (
                        <button
                          onClick={() => openPaymentModal(ap)}
                          className="px-2 py-1 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded transition-colors shadow-xs"
                          title="Registrar pago a proveedor (RF-043)"
                        >
                          Pagar
                        </button>
                      )}
                      <button
                        onClick={() => setViewingAP(ap)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                        title="Ver historial de pagos emitidos"
                      >
                        <History className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER PAYMENT MODAL (RF-043) */}
      {selectedAP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">
              Registrar Pago a Proveedor (RF-043)
            </h3>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <p className="text-slate-600">Proveedor: <strong className="text-slate-900">{selectedAP.supplierName}</strong></p>
              <p className="text-slate-600">Factura: <strong className="text-slate-900">{selectedAP.invoiceNumber}</strong></p>
              <p className="text-slate-600">Saldo Pendiente: <strong className="text-rose-600 font-mono">${selectedAP.balance.toFixed(2)}</strong></p>
            </div>

            <form onSubmit={handleRegisterPayment} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monto a Pagar ($)</label>
                <input
                  type="number"
                  step="0.01"
                  max={selectedAP.balance}
                  required
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medio de Pago</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Transferencia">Transferencia Bancaria</option>
                  <option value="Cheque">Cheque Comercial</option>
                  <option value="Efectivo">Efectivo</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Número de Transferencia o Cheque</label>
                <input
                  type="text"
                  required
                  value={reference}
                  onChange={e => setReference(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAP(null)}
                  className="flex-1 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Emitir Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PAYMENTS HISTORY */}
      {viewingAP && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">
                Pagos Emitidos a Factura {viewingAP.invoiceNumber}
              </h3>
              <button onClick={() => setViewingAP(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {viewingAP.payments.map((p, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block font-mono">${p.amount.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-500">{p.date} · {p.paymentMethod}</span>
                    <span className="text-[10px] text-slate-400 block">{p.reference}</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Pagado
                  </span>
                </div>
              ))}
              {viewingAP.payments.length === 0 && (
                <p className="text-slate-400 py-4 text-center">No se han registrado pagos para esta factura aún.</p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingAP(null)}
                className="py-1.5 px-4 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
