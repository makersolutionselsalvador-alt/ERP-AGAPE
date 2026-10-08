import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ArrowRightLeft, Warehouse as WarehouseIcon, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const StockTransfersView: React.FC = () => {
  const { warehouses, products, transferStock, setCurrentModule } = useApp();

  const [originWarehouseId, setOriginWarehouseId] = useState(warehouses[0]?.id || '');
  const [destinationWarehouseId, setDestinationWarehouseId] = useState(
    warehouses[1]?.id || warehouses[0]?.id || ''
  );
  const [notes, setNotes] = useState('');

  const [transferItems, setTransferItems] = useState<{
    productId: string;
    quantity: number;
  }[]>([
    {
      productId: products[0]?.id || '',
      quantity: 1
    }
  ]);

  const originWh = warehouses.find(w => w.id === originWarehouseId);
  const destWh = warehouses.find(w => w.id === destinationWarehouseId);

  const addItemRow = () => {
    setTransferItems(prev => [
      ...prev,
      {
        productId: products[0]?.id || '',
        quantity: 1
      }
    ]);
  };

  const removeItemRow = (idx: number) => {
    setTransferItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItemRow = (idx: number, field: 'productId' | 'quantity', val: any) => {
    setTransferItems(prev =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (originWarehouseId === destinationWarehouseId) {
      alert('La bodega de origen no puede ser igual a la bodega de destino.');
      return;
    }
    if (transferItems.length === 0) return;

    // Check availability
    for (const item of transferItems) {
      const prod = products.find(p => p.id === item.productId);
      const originStock = prod?.warehouseStock[originWarehouseId] || 0;
      if (item.quantity > originStock) {
        alert(`Stock insuficiente para "${prod?.name}" en ${originWh?.name}. Disponible: ${originStock}`);
        return;
      }
    }

    const formattedItems = transferItems.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod?.name || 'Producto',
        quantity: item.quantity
      };
    });

    transferStock({
      originWarehouseId,
      destinationWarehouseId,
      items: formattedItems,
      notes
    });

    setNotes('');
    setTransferItems([{ productId: products[0]?.id || '', quantity: 1 }]);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Transferencia Entre Bodegas y Sucursales (RF-037)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mueve existencias entre bodegas centrales y almacenes de tiendas satélite con trazabilidad.
          </p>
        </div>

        <button
          onClick={() => setCurrentModule('inventory-stock')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
        >
          <span>Consultar Existencias</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 text-xs">
        {/* Origin and Destination selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block font-semibold text-slate-700 mb-1">
              Bodega de Origen (Despacho)
            </label>
            <select
              value={originWarehouseId}
              onChange={e => setOriginWarehouseId(e.target.value)}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block font-semibold text-slate-700 mb-1">
              Bodega de Destino (Recepción)
            </label>
            <select
              value={destinationWarehouseId}
              onChange={e => setDestinationWarehouseId(e.target.value)}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
            >
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transfer Items Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-800">Productos a Trasladar</span>
            <button
              type="button"
              onClick={addItemRow}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              + Agregar Ítem
            </button>
          </div>

          <div className="space-y-2">
            {transferItems.map((item, idx) => {
              const prod = products.find(p => p.id === item.productId);
              const originStock = prod?.warehouseStock[originWarehouseId] || 0;

              return (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <select
                      value={item.productId}
                      onChange={e => updateItemRow(idx, 'productId', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-28 text-center text-slate-500 font-mono text-[11px]">
                    Disp: <strong className="text-slate-900">{originStock}</strong>
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      max={originStock}
                      value={item.quantity}
                      onChange={e => updateItemRow(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    disabled={transferItems.length === 1}
                    className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Motivo de Transferencia / Guía de Remisión
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Reabastecimiento de tienda, pedido especial de cliente..."
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
          >
            Ejecutar Transferencia Entre Bodegas
          </button>
        </div>
      </form>
    </div>
  );
};
