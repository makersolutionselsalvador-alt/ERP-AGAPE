import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BookOpen, FileSpreadsheet, Download, Package } from 'lucide-react';

export const KardexView: React.FC = () => {
  const { kardex, products } = useApp();

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const productKardex = kardex.filter(k => k.productId === selectedProductId);
  const latestEntry = productKardex.slice(-1)[0];

  const exportCsv = () => {
    const headers = [
      'Fecha', 'Documento', 'Nro Documento', 'Movimiento',
      'Entrada Cant', 'Entrada Costo', 'Entrada Total',
      'Salida Cant', 'Salida Costo', 'Salida Total',
      'Saldo Cant', 'Saldo Costo', 'Saldo Total'
    ];
    const rows = productKardex.map(k => [
      k.date,
      `"${k.documentType}"`,
      k.documentNumber,
      k.movementType,
      k.inQuantity,
      k.inUnitCost.toFixed(2),
      k.inTotalCost.toFixed(2),
      k.outQuantity,
      k.outUnitCost.toFixed(2),
      k.outTotalCost.toFixed(2),
      k.balanceQuantity,
      k.balanceUnitCost.toFixed(2),
      k.balanceTotalCost.toFixed(2)
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `kardex_${selectedProduct?.code}_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Kardex Físico y Valorado (RF-035)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Control cronológico de entradas, salidas y valuación de existencias por producto.
          </p>
        </div>

        <button
          onClick={exportCsv}
          disabled={productKardex.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 shadow-xs"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
          <span>Exportar Kardex CSV</span>
        </button>
      </div>

      {/* Product Selector Bar & Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Selecciona el Producto para Auditar Kardex:
          </label>
          <select
            value={selectedProductId}
            onChange={e => setSelectedProductId(e.target.value)}
            className="w-full sm:max-w-md p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
          >
            {products.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Saldo en Existencias:</span>
              <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                {latestEntry?.balanceQuantity ?? Object.values(selectedProduct.warehouseStock || {}).reduce((a, b) => a + b, 0)} {selectedProduct.unit}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Costo Unitario Valorado:</span>
              <span className="text-base font-bold font-mono text-indigo-700 tabular-nums">
                ${(latestEntry?.balanceUnitCost ?? selectedProduct.costPrice).toFixed(2)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Valorización Total Activo:</span>
              <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                ${(latestEntry?.balanceTotalCost ?? (Object.values(selectedProduct.warehouseStock || {}).reduce((a, b) => a + b, 0) * selectedProduct.costPrice)).toFixed(2)}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block">Método de Valuación:</span>
              <span className="text-xs font-semibold text-slate-700 block mt-1">
                Costo Promedio Ponderado
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Kardex Multi-Column Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              {/* Group Header */}
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase text-[9px] font-bold text-center">
                <th colSpan={4} className="py-1.5 px-3 border-r border-slate-200">
                  Documento de Origen
                </th>
                <th colSpan={3} className="py-1.5 px-3 bg-emerald-50 text-emerald-800 border-r border-slate-200">
                  Entradas (Compras / Ajustes)
                </th>
                <th colSpan={3} className="py-1.5 px-3 bg-rose-50 text-rose-800 border-r border-slate-200">
                  Salidas (Ventas / Mermas)
                </th>
                <th colSpan={3} className="py-1.5 px-3 bg-indigo-50 text-indigo-800">
                  Saldos Finales
                </th>
              </tr>

              {/* Sub Columns */}
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[9px] font-semibold tracking-wider">
                <th className="py-2 px-2.5">Fecha</th>
                <th className="py-2 px-2.5">Comprobante</th>
                <th className="py-2 px-2.5">N° Doc</th>
                <th className="py-2 px-2.5 border-r border-slate-200">Mov.</th>

                {/* Entrada */}
                <th className="py-2 px-2.5 text-right bg-emerald-50/50">Cant</th>
                <th className="py-2 px-2.5 text-right bg-emerald-50/50">C. Unit</th>
                <th className="py-2 px-2.5 text-right bg-emerald-50/50 border-r border-slate-200">Total</th>

                {/* Salida */}
                <th className="py-2 px-2.5 text-right bg-rose-50/50">Cant</th>
                <th className="py-2 px-2.5 text-right bg-rose-50/50">C. Unit</th>
                <th className="py-2 px-2.5 text-right bg-rose-50/50 border-r border-slate-200">Total</th>

                {/* Saldo */}
                <th className="py-2 px-2.5 text-right bg-indigo-50/50">Cant</th>
                <th className="py-2 px-2.5 text-right bg-indigo-50/50">C. Unit</th>
                <th className="py-2 px-2.5 text-right bg-indigo-50/50">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productKardex.map(entry => (
                <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-2.5 font-mono text-slate-500 tabular-nums">
                    {entry.date}
                  </td>
                  <td className="py-2 px-2.5 text-slate-700">
                    {entry.documentType}
                  </td>
                  <td className="py-2 px-2.5 font-mono font-semibold text-slate-900">
                    {entry.documentNumber}
                  </td>
                  <td className="py-2 px-2.5 border-r border-slate-200 text-slate-600">
                    {entry.movementType}
                  </td>

                  {/* Entrada values */}
                  <td className="py-2 px-2.5 text-right font-mono tabular-nums text-emerald-700 font-semibold bg-emerald-50/30">
                    {entry.inQuantity > 0 ? entry.inQuantity : '—'}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono tabular-nums text-slate-600 bg-emerald-50/30">
                    {entry.inQuantity > 0 ? `$${entry.inUnitCost.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono tabular-nums text-slate-900 font-semibold bg-emerald-50/30 border-r border-slate-200">
                    {entry.inQuantity > 0 ? `$${entry.inTotalCost.toFixed(2)}` : '—'}
                  </td>

                  {/* Salida values */}
                  <td className="py-2 px-2.5 text-right font-mono tabular-nums text-rose-700 font-semibold bg-rose-50/30">
                    {entry.outQuantity > 0 ? entry.outQuantity : '—'}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono tabular-nums text-slate-600 bg-rose-50/30">
                    {entry.outQuantity > 0 ? `$${entry.outUnitCost.toFixed(2)}` : '—'}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono tabular-nums text-slate-900 font-semibold bg-rose-50/30 border-r border-slate-200">
                    {entry.outQuantity > 0 ? `$${entry.outTotalCost.toFixed(2)}` : '—'}
                  </td>

                  {/* Saldo values */}
                  <td className="py-2 px-2.5 text-right font-mono tabular-nums text-slate-900 font-bold bg-indigo-50/30">
                    {entry.balanceQuantity}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono tabular-nums text-slate-600 bg-indigo-50/30">
                    ${entry.balanceUnitCost.toFixed(2)}
                  </td>
                  <td className="py-2 px-2.5 text-right font-mono tabular-nums text-indigo-900 font-bold bg-indigo-50/30">
                    ${entry.balanceTotalCost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {productKardex.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs">
            No hay registros de Kardex aún para este producto.
          </div>
        )}
      </div>
    </div>
  );
};
