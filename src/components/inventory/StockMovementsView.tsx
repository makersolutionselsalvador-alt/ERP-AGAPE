import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Filter, History, Download, FileSpreadsheet } from 'lucide-react';
import { MovementType } from '../../types';

export const StockMovementsView: React.FC = () => {
  const { stockMovements, warehouses, products } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredMovements = useMemo(() => {
    return stockMovements.filter(m => {
      const matchesSearch =
        searchTerm === '' ||
        m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.referenceDocument && m.referenceDocument.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesWarehouse = selectedWarehouse === 'all' || m.warehouseId === selectedWarehouse;
      const matchesType = selectedType === 'all' || m.type === selectedType;

      return matchesSearch && matchesWarehouse && matchesType;
    });
  }, [stockMovements, searchTerm, selectedWarehouse, selectedType]);

  const exportCsv = () => {
    const headers = ['Código', 'Fecha', 'Producto', 'Bodega', 'Tipo', 'Cantidad', 'Stock Anterior', 'Stock Nuevo', 'Costo Unit.', 'Costo Total', 'Referencia', 'Usuario'];
    const rows = filteredMovements.map(m => [
      m.code,
      m.createdAt,
      `"${m.productName}"`,
      `"${m.warehouseName}"`,
      m.type,
      m.quantity,
      m.previousStock,
      m.newStock,
      m.unitCost.toFixed(2),
      m.totalCost.toFixed(2),
      m.referenceDocument || '',
      `"${m.userName}"`
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `movimientos_inventario_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
  };

  const getBadgeStyle = (type: MovementType) => {
    if (type.includes('ENTRADA') || type === 'COMPRA' || type === 'DEVOLUCION_CLIENTE') {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Movimientos de Inventario (RF-034)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Trazabilidad completa de entradas, salidas, traslados y ajustes físicos en almacenes.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
          <span>Exportar Movimientos CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por producto, código MOV o referencia..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={selectedWarehouse}
          onChange={e => setSelectedWarehouse(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs"
        >
          <option value="all">Todas las bodegas</option>
          {warehouses.map(w => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs"
        >
          <option value="all">Todos los tipos de movimiento</option>
          <option value="VENTA">Venta</option>
          <option value="COMPRA">Compra</option>
          <option value="AJUSTE_ENTRADA">Ajuste Entrada</option>
          <option value="AJUSTE_SALIDA">Ajuste Salida</option>
          <option value="TRANSFERENCIA_ENTRADA">Transferencia Entrada</option>
          <option value="TRANSFERENCIA_SALIDA">Transferencia Salida</option>
          <option value="DEVOLUCION_CLIENTE">Devolución Cliente</option>
        </select>
      </div>

      {/* Movements Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Fecha y Hora</th>
                <th className="py-2.5 px-3">Producto</th>
                <th className="py-2.5 px-3">Bodega</th>
                <th className="py-2.5 px-3">Tipo de Operación</th>
                <th className="py-2.5 px-3 text-right">Cantidad</th>
                <th className="py-2.5 px-3 text-right">Stock Anterior</th>
                <th className="py-2.5 px-3 text-right">Nuevo Stock</th>
                <th className="py-2.5 px-3">Documento Ref.</th>
                <th className="py-2.5 px-3">Usuario Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMovements.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">
                    {m.code}
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono tabular-nums">
                    {m.createdAt}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800">
                    {m.productName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {m.warehouseName}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded border ${getBadgeStyle(m.type)}`}>
                      {m.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {m.type.includes('SALIDA') || m.type === 'VENTA' ? `-${m.quantity}` : `+${m.quantity}`}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                    {m.previousStock}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums text-slate-900">
                    {m.newStock}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {m.referenceDocument || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {m.userName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
