import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Coins,
  DollarSign,
  TrendingDown,
  History,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Receipt
} from 'lucide-react';
import { Expense } from '../../types';

interface CashRegisterViewProps {
  initialTab?: 'status' | 'expense' | 'history' | 'expenses-list';
}

export const CashRegisterView: React.FC<CashRegisterViewProps> = ({ initialTab = 'status' }) => {
  const {
    cashSessions,
    activeCashSession,
    openCashSession,
    closeCashSession,
    expenses,
    addExpense,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'status' | 'expense' | 'history' | 'expenses-list'>(initialTab);

  // Open Cash State (RF-055)
  const [initialCashInput, setInitialCashInput] = useState<string>('150.00');
  const [openNotes, setOpenNotes] = useState<string>('Apertura de turno matutino con fondo en caja');

  // Close Cash State (RF-056)
  const [actualCashInput, setActualCashInput] = useState<string>('');
  const [closeNotes, setCloseNotes] = useState<string>('Arqueo ciego de billetes y monedas al cierre');

  // New Expense State (RF-058)
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('Suministros');
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseConcept, setExpenseConcept] = useState<string>('');
  const [expensePaidTo, setExpensePaidTo] = useState<string>('');
  const [expenseReceipt, setExpenseReceipt] = useState<string>('');

  const handleOpenCash = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(initialCashInput) || 0;
    openCashSession(amount, openNotes);
  };

  const handleCloseCash = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(actualCashInput) || 0;
    closeCashSession(amount, closeNotes);
    setActualCashInput('');
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(expenseAmount) || 0;
    if (amount <= 0 || !expenseConcept.trim()) {
      alert('Ingresa un monto y concepto válidos');
      return;
    }
    addExpense({
      category: expenseCategory,
      amount,
      concept: expenseConcept,
      paidTo: expensePaidTo || 'Varios',
      receiptNumber: expenseReceipt
    });
    setExpenseAmount('');
    setExpenseConcept('');
    setExpensePaidTo('');
    setExpenseReceipt('');
    setActiveTab('expenses-list');
  };

  const diffPreview = activeCashSession && actualCashInput !== ''
    ? (parseFloat(actualCashInput) || 0) - activeCashSession.expectedCash
    : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Control de Caja & Gastos Menores (RF-055 - RF-059)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Apertura de turno, arqueo de valores, conciliación de diferencias y egresos operativos.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'status'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Estado de Caja
          </button>
          <button
            onClick={() => setActiveTab('expense')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'expense'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Registrar Gasto
          </button>
          <button
            onClick={() => setActiveTab('expenses-list')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'expenses-list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Consultar Gastos
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Historial de Cierres
          </button>
        </div>
      </div>

      {/* TAB 1: ESTADO Y ARQUEO DE CAJA */}
      {activeTab === 'status' && (
        <div className="space-y-4">
          {activeCashSession ? (
            /* Caja Abierta: Dashboard de Turno & Formulario de Cierre */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Summary Metrics */}
              <div className="lg:col-span-2 space-y-4">
                <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                      <h2 className="text-sm font-bold text-slate-900">
                        Caja Activa: {activeCashSession.code}
                      </h2>
                    </div>
                    <span className="text-slate-500 font-mono">
                      Iniciada: {activeCashSession.openedAt}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Fondo Inicial:</span>
                      <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                        ${activeCashSession.initialCash.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Ventas en Efectivo:</span>
                      <span className="text-base font-bold font-mono text-emerald-700 tabular-nums">
                        +${activeCashSession.totalSalesCash.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Abonos Recibidos:</span>
                      <span className="text-base font-bold font-mono text-indigo-700 tabular-nums">
                        +${activeCashSession.totalClientPaymentsCash.toFixed(2)}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Gastos Retirados:</span>
                      <span className="text-base font-bold font-mono text-rose-600 tabular-nums">
                        -${activeCashSession.totalExpenses.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Expected Cash in drawer */}
                  <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-emerald-900 block">
                        Saldo Esperado en Gaveta (Efectivo Físico):
                      </span>
                      <span className="text-[11px] text-emerald-700">
                        Fondo inicial + Ventas efectivo + Abonos - Gastos de caja
                      </span>
                    </div>
                    <span className="text-2xl font-bold font-mono text-emerald-900 tabular-nums">
                      ${activeCashSession.expectedCash.toFixed(2)}
                    </span>
                  </div>

                  {/* Non-cash totals */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Otras formas de pago procesadas:</span>
                    <div className="flex gap-4 font-mono font-medium">
                      <span>Tarjetas: ${activeCashSession.totalSalesCard.toFixed(2)}</span>
                      <span>Transferencias: ${activeCashSession.totalSalesTransfer.toFixed(2)}</span>
                      <span>Créditos: ${activeCashSession.totalSalesCredit.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Close Cash Form (RF-056) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
                <div className="flex items-center gap-2 text-slate-900">
                  <Lock className="h-4 w-4 text-slate-500" />
                  <h3 className="font-bold text-sm">Arqueo y Cierre de Caja (RF-056)</h3>
                </div>
                <p className="text-slate-500">
                  Realiza el conteo físico del efectivo en billetes y monedas para contrastar contra el sistema.
                </p>

                <form onSubmit={handleCloseCash} className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Efectivo Contado Físico ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0.00"
                      value={actualCashInput}
                      onChange={e => setActualCashInput(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-base font-mono font-bold"
                    />
                  </div>

                  {actualCashInput !== '' && (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                      <span className="font-semibold text-slate-700">Diferencia de Caja:</span>
                      <span
                        className={`font-mono font-bold text-sm tabular-nums ${
                          diffPreview === 0
                            ? 'text-emerald-700'
                            : diffPreview > 0
                            ? 'text-indigo-700'
                            : 'text-rose-600'
                        }`}
                      >
                        {diffPreview === 0
                          ? '$0.00 (Cuadrada)'
                          : diffPreview > 0
                          ? `+$${diffPreview.toFixed(2)} (Sobrante)`
                          : `-$${Math.abs(diffPreview).toFixed(2)} (Faltante)`}
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Observaciones de Cierre
                    </label>
                    <textarea
                      rows={2}
                      value={closeNotes}
                      onChange={e => setCloseNotes(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                  >
                    Confirmar Arqueo y Cerrar Caja
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Caja Cerrada: Formulario de Apertura (RF-055) */
            <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
              <div className="text-center space-y-1">
                <div className="h-10 w-10 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Unlock className="h-5 w-5" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Apertura de Turno de Caja (RF-055)
                </h2>
                <p className="text-slate-500">
                  Ingresa el saldo base inicial en efectivo para comenzar a facturar en el Punto de Venta.
                </p>
              </div>

              <form onSubmit={handleOpenCash} className="space-y-4 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cajero Responsable
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${currentUser?.name} (${currentUser?.role})`}
                    className="w-full p-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Fondo Inicial en Efectivo ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={initialCashInput}
                    onChange={e => setInitialCashInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Notas o Justificación de Apertura
                  </label>
                  <textarea
                    rows={2}
                    value={openNotes}
                    onChange={e => setOpenNotes(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
                >
                  Abrir Caja e Iniciar Facturación
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REGISTRAR GASTO (RF-058) */}
      {activeTab === 'expense' && (
        <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4 text-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Registrar Gasto de Caja Menor (RF-058)
            </h2>
            <p className="text-slate-500">
              Registra egresos en efectivo por servicios, suministros o transporte que reducen el saldo de caja.
            </p>
          </div>

          <form onSubmit={handleAddExpense} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Categoría del Gasto</label>
                <select
                  value={expenseCategory}
                  onChange={e => setExpenseCategory(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Suministros">Suministros de Oficina</option>
                  <option value="Transporte">Transporte / Envíos</option>
                  <option value="Servicios">Servicios Básicos</option>
                  <option value="Mantenimiento">Mantenimiento y Reparaciones</option>
                  <option value="Alquiler">Alquiler</option>
                  <option value="Otros">Otros Egresos</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monto ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Concepto / Descripción Detallada
              </label>
              <textarea
                rows={2}
                required
                value={expenseConcept}
                onChange={e => setExpenseConcept(e.target.value)}
                placeholder="Ej. Compra de rollos de papel térmico, pago de flete de mensajería..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pagado a (Beneficiario)</label>
                <input
                  type="text"
                  value={expensePaidTo}
                  onChange={e => setExpensePaidTo(e.target.value)}
                  placeholder="Ej. Librería Central, Don Pepe..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Número de Factura / Recibo</label>
                <input
                  type="text"
                  value={expenseReceipt}
                  onChange={e => setExpenseReceipt(e.target.value)}
                  placeholder="Ej. REC-0941"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors text-xs"
              >
                Registrar Gasto y Deducir de Caja
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: CONSULTAR GASTOS POR PERÍODO (RF-059) */}
      {activeTab === 'expenses-list' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              Bitácora de Gastos Menores ({expenses.length} registros)
            </span>
            <span className="font-mono font-bold text-rose-600">
              Total: ${expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Fecha y Hora</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3">Concepto</th>
                  <th className="py-2.5 px-3">Beneficiario</th>
                  <th className="py-2.5 px-3">Recibo</th>
                  <th className="py-2.5 px-3 text-right">Monto</th>
                  <th className="py-2.5 px-3">Cajero</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map(exp => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                      {exp.code}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono tabular-nums">
                      {exp.createdAt}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {exp.concept}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {exp.paidTo}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">
                      {exp.receiptNumber || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 tabular-nums">
                      -${exp.amount.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {exp.userName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: HISTORIAL DE CIERRES DE CAJA (RF-057) */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-3 border-b border-slate-100 text-xs font-bold text-slate-800">
            Histórico de Cierres y Arqueos de Caja (RF-057)
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Código Caja</th>
                  <th className="py-2.5 px-3">Apertura</th>
                  <th className="py-2.5 px-3">Cierre</th>
                  <th className="py-2.5 px-3">Cajero</th>
                  <th className="py-2.5 px-3 text-right">Fondo Inicial</th>
                  <th className="py-2.5 px-3 text-right">Ventas Efectivo</th>
                  <th className="py-2.5 px-3 text-right">Esperado</th>
                  <th className="py-2.5 px-3 text-right">Efectivo Real</th>
                  <th className="py-2.5 px-3 text-right">Diferencia</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cashSessions.map(cs => (
                  <tr key={cs.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {cs.code}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono tabular-nums">
                      {cs.openedAt}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono tabular-nums">
                      {cs.closedAt || 'En curso'}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {cs.userName}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                      ${cs.initialCash.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                      ${cs.totalSalesCash.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900 font-bold">
                      ${cs.expectedCash.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-900">
                      {cs.actualCash !== undefined ? `$${cs.actualCash.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                      {cs.cashDifference !== undefined ? (
                        <span className={cs.cashDifference === 0 ? 'text-emerald-700' : cs.cashDifference > 0 ? 'text-indigo-700' : 'text-rose-600'}>
                          {cs.cashDifference > 0 ? `+$${cs.cashDifference.toFixed(2)}` : `$${cs.cashDifference.toFixed(2)}`}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded ${
                          cs.status === 'Abierta'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {cs.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
