import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Plus,
  Search,
  FileText,
  CheckCircle,
  Clock,
  ArrowRight,
  User,
  Trash2,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Quote } from '../../types';

export const QuotesView: React.FC = () => {
  const {
    quotes,
    createQuote,
    convertQuoteToSale,
    clients,
    products,
    companySettings
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isNewQuoteOpen, setIsNewQuoteOpen] = useState(false);

  // Form State
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [validUntil, setValidUntil] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().substring(0, 10)
  );
  const [notes, setNotes] = useState('Precios sujetos a disponibilidad de inventario. Cotización válida por 15 días.');
  const [items, setItems] = useState<{
    productId: string;
    quantity: number;
    unitPrice: number;
    discountPercentage: number;
  }[]>([
    {
      productId: products[0]?.id || '',
      quantity: 1,
      unitPrice: products[0]?.sellingPrice || 0,
      discountPercentage: 0
    }
  ]);

  const addItemRow = () => {
    setItems(prev => [
      ...prev,
      {
        productId: products[0]?.id || '',
        quantity: 1,
        unitPrice: products[0]?.sellingPrice || 0,
        discountPercentage: 0
      }
    ]);
  };

  const removeItemRow = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItemRow = (idx: number, field: string, value: any) => {
    setItems(prev =>
      prev.map((item, i) => {
        if (i === idx) {
          if (field === 'productId') {
            const prod = products.find(p => p.id === value);
            return {
              ...item,
              productId: value,
              unitPrice: prod?.sellingPrice || item.unitPrice
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    createQuote({
      clientId,
      items,
      validUntil,
      notes
    });
    setIsNewQuoteOpen(false);
  };

  const filteredQuotes = quotes.filter(q =>
    searchTerm === '' ||
    q.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Cotizaciones y Presupuestos (RF-045)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Genera presupuestos comerciales para clientes y conviértelos directamente en ventas.
          </p>
        </div>

        <button
          onClick={() => setIsNewQuoteOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Generar Cotización (RF-045)</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="relative max-w-md">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por número COT o cliente..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Quotes Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Número</th>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Vigencia</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.map(q => (
                <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {q.quoteNumber}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono tabular-nums">
                    {q.createdAt}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {q.clientName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono tabular-nums">
                    {q.validUntil}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    ${q.total.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded ${
                        q.status === 'Convertida a Venta'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {q.status !== 'Convertida a Venta' && (
                      <button
                        onClick={() => convertQuoteToSale(q.id, 'Efectivo', q.total)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-xs"
                        title="Procesar y convertir en venta inmediata"
                      >
                        <span>Convertir a Venta</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE QUOTE MODAL */}
      {isNewQuoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
              <h3 className="font-bold text-sm text-slate-900">Emitir Nueva Cotización (RF-045)</h3>
              <button onClick={() => setIsNewQuoteOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cliente</label>
                  <select
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Válida Hasta</label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={e => setValidUntil(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800">Detalle de Productos</span>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    + Agregar Ítem
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <select
                        value={item.productId}
                        onChange={e => updateItemRow(idx, 'productId', e.target.value)}
                        className="flex-1 p-1.5 bg-white border border-slate-200 rounded text-xs"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (${p.sellingPrice.toFixed(2)})
                          </option>
                        ))}
                      </select>

                      <input
                        type="number"
                        min="1"
                        placeholder="Cant"
                        value={item.quantity}
                        onChange={e => updateItemRow(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-16 p-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                      />

                      <input
                        type="number"
                        step="0.01"
                        placeholder="Precio"
                        value={item.unitPrice}
                        onChange={e => updateItemRow(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-20 p-1.5 bg-white border border-slate-200 rounded text-xs font-mono"
                      />

                      <button
                        type="button"
                        onClick={() => removeItemRow(idx)}
                        disabled={items.length === 1}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notas / Condiciones Comerciales</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewQuoteOpen(false)}
                  className="flex-1 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Guardar Cotización
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
