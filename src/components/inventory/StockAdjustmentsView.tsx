import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Boxes, Plus, AlertCircle, CheckCircle2, History } from 'lucide-react';

export const StockAdjustmentsView: React.FC = () => {
  const { products, warehouses, recordStockAdjustment, setCurrentModule } = useApp();

  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [adjustmentType, setAdjustmentType] = useState<'Entrada' | 'Salida'>('Salida');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState<any>('Conteo físico');
  const [notes, setNotes] = useState('');

  const selectedProduct = products.find(p => p.id === productId);
  const selectedWarehouse = warehouses.find(w => w.id === warehouseId);
  const currentStock = selectedProduct?.warehouseStock[warehouseId] || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      alert('La cantidad a ajustar debe ser mayor a 0');
      return;
    }
    if (adjustmentType === 'Salida' && quantity > currentStock) {
      alert(`No puedes ajustar una salida mayor al stock disponible (${currentStock})`);
      return;
    }

    recordStockAdjustment({
      warehouseId,
      productId,
      type: adjustmentType,
      quantity,
      reason,
      notes
    });

    setQuantity(1);
    setNotes('');
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Ajustes Físicos de Inventario (RF-033)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Corrige descuadres por conteo físico, mermas, roturas o vencimientos de producto.
          </p>
        </div>

        <button
          onClick={() => setCurrentModule('inventory-movements')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"
        >
          <History className="h-3.5 w-3.5 text-slate-500" />
          <span>Ver Movimientos (RF-034)</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bodega / Almacén</label>
            <select
              value={warehouseId}
              onChange={e => setWarehouseId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Producto</label>
            <select
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Stock Preview Card */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 block">Stock Actual en {selectedWarehouse?.name}:</span>
            <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
              {currentStock} {selectedProduct?.unit || 'Unidades'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Costo Unitario Registrado:</span>
            <span className="text-base font-bold font-mono text-indigo-700 tabular-nums">
              ${selectedProduct?.costPrice.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tipo de Ajuste</label>
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setAdjustmentType('Entrada')}
                className={`py-1.5 text-xs font-semibold rounded ${
                  adjustmentType === 'Entrada'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                + Entrada
              </button>
              <button
                type="button"
                onClick={() => setAdjustmentType('Salida')}
                className={`py-1.5 text-xs font-semibold rounded ${
                  adjustmentType === 'Salida'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                - Salida
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Cantidad a Ajustar</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Motivo del Ajuste</label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="Conteo físico">Conteo físico / Auditoría</option>
              <option value="Merma / Daño">Merma o daño en almacén</option>
              <option value="Vencimiento">Vencimiento o caducidad</option>
              <option value="Error de registro">Corrección de digitación</option>
              <option value="Otro">Otro motivo justificado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Observaciones o Justificación Adicional
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Detalla la causa del ajuste para la bitácora de auditoría..."
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            Aplicar Ajuste Físico al Inventario
          </button>
        </div>
      </form>
    </div>
  );
};
