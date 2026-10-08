import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Plus,
  Search,
  Building,
  Warehouse as WarehouseIcon,
  Trash2,
  Ban,
  Calendar,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { Purchase } from '../../types';

interface PurchasesViewProps {
  initialTab?: 'list' | 'new';
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({ initialTab = 'list' }) => {
  const {
    purchases,
    suppliers,
    warehouses,
    products,
    createPurchase,
    voidPurchase,
    companySettings
  } = useApp();

  const [activeTab, setActiveTab] = useState<'list' | 'new'>(initialTab);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State for Nueva Compra (RF-039)
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentType, setPaymentType] = useState<'Contado' | 'Crédito'>('Contado');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10)
  );

  const [items, setItems] = useState<{
    productId: string;
    quantity: number;
    unitCost: number;
  }[]>([
    {
      productId: products[0]?.id || '',
      quantity: 5,
      unitCost: products[0]?.costPrice || 0
    }
  ]);

  // Void modal
  const [voidingPurchase, setVoidingPurchase] = useState<Purchase | null>(null);
  const [voidReason, setVoidReason] = useState('');

  const addItemRow = () => {
    setItems(prev => [
      ...prev,
      {
        productId: products[0]?.id || '',
        quantity: 1,
        unitCost: products[0]?.costPrice || 0
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
              unitCost: prod?.costPrice || item.unitCost
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const calculatedSubtotal = items.reduce((acc, i) => acc + i.quantity * i.unitCost, 0);
  const calculatedTax = Math.round(calculatedSubtotal * (companySettings.defaultTaxRate / 100) * 100) / 100;
  const calculatedTotal = calculatedSubtotal + calculatedTax;

  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceNumber.trim()) {
      alert('Ingresa el número de factura o comprobante del proveedor');
      return;
    }
    if (items.length === 0) return;

    createPurchase({
      supplierId,
      warehouseId,
      invoiceNumber,
      items,
      paymentType,
      dueDate: paymentType === 'Crédito' ? dueDate : undefined
    });

    // Reset form
    setInvoiceNumber('');
    setItems([
      {
        productId: products[0]?.id || '',
        quantity: 5,
        unitCost: products[0]?.costPrice || 0
      }
    ]);
    setActiveTab('list');
  };

  const handleConfirmVoid = () => {
    if (!voidingPurchase) return;
    if (!voidReason.trim()) {
      alert('Debes ingresar un motivo de anulación');
      return;
    }
    voidPurchase(voidingPurchase.id, voidReason);
    setVoidingPurchase(null);
    setVoidReason('');
  };

  const filteredPurchases = purchases.filter(p =>
    searchTerm === '' ||
    p.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Gestión de Compras & Proveedores (RF-039 / RF-040)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ingreso de mercadería al inventario, costeo y registro de cuentas por pagar a proveedores.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Consultar Compras
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'new'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nueva Compra</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: NUEVA COMPRA (RF-039) */}
      {activeTab === 'new' && (
        <form onSubmit={handleSubmitPurchase} className="space-y-4 text-xs">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
              Datos de la Factura de Compra
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Proveedor (RF-028)</label>
                <select
                  value={supplierId}
                  onChange={e => setSupplierId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Número de Factura / CCF
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: FAC-88912"
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bodega de Destino</label>
                <select
                  value={warehouseId}
                  onChange={e => setWarehouseId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Condición de Pago</label>
                <select
                  value={paymentType}
                  onChange={e => setPaymentType(e.target.value as any)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Contado">Contado</option>
                  <option value="Crédito">Crédito (Genera CxP)</option>
                </select>
              </div>
            </div>

            {paymentType === 'Crédito' && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                <span className="text-amber-900 font-medium">
                  Fecha límite de vencimiento pactada para pago al proveedor:
                </span>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="p-1.5 bg-white border border-amber-300 rounded-lg text-xs"
                />
              </div>
            )}
          </div>

          {/* Product Items Breakdown */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900">Productos Recibidos</h3>
              <button
                type="button"
                onClick={addItemRow}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                + Agregar Ítem
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <select
                      value={item.productId}
                      onChange={e => updateItemRow(idx, 'productId', e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      placeholder="Cant"
                      value={item.quantity}
                      onChange={e => updateItemRow(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                    />
                  </div>

                  <div className="w-28">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Costo Unit."
                      value={item.unitCost}
                      onChange={e => updateItemRow(idx, 'unitCost', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                    />
                  </div>

                  <div className="w-24 text-right font-mono font-bold text-slate-900">
                    ${(item.quantity * item.unitCost).toFixed(2)}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItemRow(idx)}
                    disabled={items.length === 1}
                    className="p-1.5 text-slate-400 hover:text-rose-600 disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Calculations and submit */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-slate-500 text-xs">
                Se actualizarán los costos de compra en el catálogo y se asentarán en el Kardex.
              </div>

              <div className="text-right space-y-1">
                <div className="text-slate-500">
                  Subtotal: <span className="font-mono tabular-nums">${calculatedSubtotal.toFixed(2)}</span>
                </div>
                <div className="text-slate-500">
                  {companySettings.taxName} ({companySettings.defaultTaxRate}%):{' '}
                  <span className="font-mono tabular-nums">${calculatedTax.toFixed(2)}</span>
                </div>
                <div className="text-base font-bold text-slate-900">
                  Total: <span className="font-mono tabular-nums">${calculatedTotal.toFixed(2)}</span>
                </div>

                <button
                  type="submit"
                  className="mt-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
                >
                  Registrar Compra e Ingresar al Inventario
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* VIEW 2: CONSULTAR COMPRAS (RF-040) */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
            <div className="relative max-w-md">
              <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por número COM, factura de proveedor o nombre..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                    <th className="py-2.5 px-3">Número Compra</th>
                    <th className="py-2.5 px-3">Fecha</th>
                    <th className="py-2.5 px-3">Factura Prov.</th>
                    <th className="py-2.5 px-3">Proveedor</th>
                    <th className="py-2.5 px-3">Bodega Ingreso</th>
                    <th className="py-2.5 px-3">Tipo Pago</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-center">Estado</th>
                    <th className="py-2.5 px-3 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPurchases.map(pur => (
                    <tr key={pur.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {pur.purchaseNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono tabular-nums">
                        {pur.createdAt}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {pur.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        {pur.supplierName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {pur.warehouseName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] text-slate-600">{pur.paymentType}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ${pur.total.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded ${
                            pur.status === 'Completada'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {pur.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {pur.status === 'Completada' && (
                          <button
                            onClick={() => setVoidingPurchase(pur)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded transition-colors"
                            title="Anular compra y deducir inventario (RF-041)"
                          >
                            <Ban className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VOID PURCHASE MODAL (RF-041) */}
      {voidingPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="font-bold text-sm text-slate-900">
                Anular Compra {voidingPurchase.purchaseNumber}
              </h3>
            </div>
            <p className="text-slate-600">
              Esta acción revertirá las existencias ingresadas al almacén y cancelará la cuenta por pagar asociada.
            </p>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Motivo de Anulación (Obligatorio)
              </label>
              <textarea
                rows={3}
                value={voidReason}
                onChange={e => setVoidReason(e.target.value)}
                placeholder="Error de factura, devolución total al proveedor..."
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVoidingPurchase(null)}
                className="flex-1 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmVoid}
                className="flex-1 py-2 font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Confirmar Anulación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
