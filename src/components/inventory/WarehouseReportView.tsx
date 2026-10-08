import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Warehouse as WarehouseIcon, Building2, Package, Printer, Download, FileSpreadsheet } from 'lucide-react';

export const WarehouseReportView: React.FC = () => {
  const { warehouses, products, branches } = useApp();

  const [activeWarehouseId, setActiveWarehouseId] = useState(warehouses[0]?.id || '');

  const activeWarehouse = warehouses.find(w => w.id === activeWarehouseId) || warehouses[0];
  const activeBranch = branches.find(b => b.id === activeWarehouse?.branchId);

  // Products in active warehouse
  const warehouseProducts = products.map(p => ({
    ...p,
    stockInWarehouse: p.warehouseStock[activeWarehouse?.id || ''] || 0
  })).filter(p => p.stockInWarehouse > 0);

  const totalUnits = warehouseProducts.reduce((sum, p) => sum + p.stockInWarehouse, 0);
  const totalCost = warehouseProducts.reduce((sum, p) => sum + p.stockInWarehouse * p.costPrice, 0);
  const totalRetail = warehouseProducts.reduce((sum, p) => sum + p.stockInWarehouse * p.sellingPrice, 0);

  const exportCsv = () => {
    const headers = ['Código', 'Producto', 'Categoría', 'Unidad', 'Stock en Bodega', 'Costo Unit.', 'Valor Costo', 'Precio Venta', 'Valor Venta'];
    const rows = warehouseProducts.map(p => [
      p.code,
      `"${p.name}"`,
      p.categoryId,
      p.unit,
      p.stockInWarehouse,
      p.costPrice.toFixed(2),
      (p.stockInWarehouse * p.costPrice).toFixed(2),
      p.sellingPrice.toFixed(2),
      (p.stockInWarehouse * p.sellingPrice).toFixed(2)
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `reporte_bodega_${activeWarehouse?.code}_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Reporte de Bodegas y Almacenes (RF-038)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Valorización física y desglose de existencias por centro de distribución y tienda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Imprimir</span>
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Warehouse Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {warehouses.map(wh => {
          const isSelected = wh.id === activeWarehouseId;
          const whTotalUnits = products.reduce((acc, p) => acc + (p.warehouseStock[wh.id] || 0), 0);
          const whTotalCost = products.reduce((acc, p) => acc + (p.warehouseStock[wh.id] || 0) * p.costPrice, 0);

          return (
            <button
              key={wh.id}
              onClick={() => setActiveWarehouseId(wh.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-indigo-50/50 border-indigo-600 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-xs text-slate-900">{wh.name}</span>
                <span className="text-[10px] font-mono text-slate-400">{wh.code}</span>
              </div>
              <p className="text-[11px] text-slate-500 mb-2">{wh.capacityNotes || 'Almacén operativo'}</p>
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                <span className="font-mono tabular-nums text-slate-700 font-semibold">{whTotalUnits} unidades</span>
                <span className="font-mono tabular-nums font-bold text-indigo-900">${whTotalCost.toFixed(2)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Warehouse Overview */}
      {activeWarehouse && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Existencias Físicas: {activeWarehouse.name} ({activeWarehouse.code})
              </h2>
              <p className="text-xs text-slate-500">
                Ubicada en: {activeBranch?.name} ({activeBranch?.address})
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px]">Total Unidades:</span>
                <strong className="text-slate-900">{totalUnits}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Costo Valorado:</span>
                <strong className="text-indigo-700">${totalCost.toFixed(2)}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Proyección Venta:</span>
                <strong className="text-emerald-700">${totalRetail.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Descripción Producto</th>
                  <th className="py-2.5 px-3 text-center">Unidad</th>
                  <th className="py-2.5 px-3 text-right">Existencia</th>
                  <th className="py-2.5 px-3 text-right">Costo Unit.</th>
                  <th className="py-2.5 px-3 text-right">Valor al Costo</th>
                  <th className="py-2.5 px-3 text-right">Precio Venta</th>
                  <th className="py-2.5 px-3 text-right">Valor Venta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {warehouseProducts.map(prod => (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                      {prod.code}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">
                      {prod.name}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500">
                      {prod.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {prod.stockInWarehouse}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      ${prod.costPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      ${(prod.stockInWarehouse * prod.costPrice).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      ${prod.sellingPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 tabular-nums">
                      ${(prod.stockInWarehouse * prod.sellingPrice).toFixed(2)}
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
