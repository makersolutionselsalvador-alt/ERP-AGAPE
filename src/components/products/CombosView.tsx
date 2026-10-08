import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Boxes,
  Plus,
  Search,
  Edit2,
  Trash2,
  Power,
  Package,
  DollarSign,
  TrendingDown,
  Warehouse as WarehouseIcon,
  Tag,
  Barcode,
  Layers,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import { Combo, ComboItemComponent } from '../../types';
import { getComboAvailableStock } from '../../utils/promoLogic';

export const CombosView: React.FC = () => {
  const {
    combos,
    products,
    warehouses,
    addCombo,
    updateCombo,
    deleteCombo,
    toggleComboActive,
    companySettings
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    code: string;
    barcode: string;
    name: string;
    description: string;
    category: string;
    price: number;
    items: ComboItemComponent[];
    isActive: boolean;
  }>({
    code: '',
    barcode: '',
    name: '',
    description: '',
    category: 'Tecnología',
    price: 0,
    items: [],
    isActive: true
  });

  // Filtered Combos
  const filteredCombos = useMemo(() => {
    return combos.filter(c => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        term === '' ||
        c.name.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term) ||
        c.barcode.includes(term) ||
        c.items.some(i => i.productName.toLowerCase().includes(term));
      return matchesSearch;
    });
  }, [combos, searchTerm]);

  // Overall Stats
  const stats = useMemo(() => {
    const total = combos.length;
    const active = combos.filter(c => c.isActive).length;
    const avgDiscount =
      total > 0
        ? Math.round(
            (combos.reduce((acc, c) => acc + (c.discountPercentage || 0), 0) / total) * 10
          ) / 10
        : 0;
    const totalSavingsSum = combos.reduce((acc, c) => acc + (c.discountAmount || 0), 0);

    return { total, active, avgDiscount, totalSavingsSum };
  }, [combos]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingCombo(null);
    setFormData({
      code: `CMB-00${combos.length + 1}`,
      barcode: `${Math.floor(750000000000 + Math.random() * 9000000000)}`,
      name: '',
      description: '',
      category: 'Paquetes Especiales',
      price: 0,
      items: [],
      isActive: true
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (combo: Combo) => {
    setEditingCombo(combo);
    setFormData({
      code: combo.code,
      barcode: combo.barcode,
      name: combo.name,
      description: combo.description,
      category: combo.category || 'Paquetes Especiales',
      price: combo.price,
      items: [...combo.items],
      isActive: combo.isActive
    });
    setIsModalOpen(true);
  };

  // Add component product to combo
  const handleAddComponent = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    const existingIdx = formData.items.findIndex(i => i.productId === productId);
    if (existingIdx > -1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.map((it, idx) =>
          idx === existingIdx ? { ...it, quantity: it.quantity + 1 } : it
        )
      }));
    } else {
      const newItem: ComboItemComponent = {
        productId: prod.id,
        productCode: prod.code,
        productName: prod.name,
        quantity: 1,
        regularUnitPrice: prod.sellingPrice,
        unitCost: prod.costPrice
      };
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }
  };

  // Remove component from combo
  const handleRemoveComponent = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(i => i.productId !== productId)
    }));
  };

  // Update component quantity
  const handleUpdateComponentQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      handleRemoveComponent(productId);
      return;
    }
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(i => (i.productId === productId ? { ...i, quantity: qty } : i))
    }));
  };

  // Calculations inside modal
  const modalCalculations = useMemo(() => {
    const originalTotal = formData.items.reduce(
      (acc, it) => acc + it.regularUnitPrice * it.quantity,
      0
    );
    const totalCost = formData.items.reduce((acc, it) => acc + it.unitCost * it.quantity, 0);
    const discountAmount = Math.max(0, originalTotal - formData.price);
    const discountPercentage =
      originalTotal > 0
        ? Math.round(((originalTotal - formData.price) / originalTotal) * 1000) / 10
        : 0;
    const profitMargin =
      formData.price > 0
        ? Math.round(((formData.price - totalCost) / formData.price) * 1000) / 10
        : 0;

    return {
      originalTotal: Math.round(originalTotal * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      discountPercentage,
      profitMargin
    };
  }, [formData.items, formData.price]);

  // Handle Save
  const handleSaveCombo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (formData.items.length < 2) {
      alert('Un combo o paquete debe contener al menos 2 productos.');
      return;
    }
    if (formData.price <= 0) {
      alert('El precio del combo debe ser mayor a 0.');
      return;
    }

    const { originalTotal, discountAmount, discountPercentage } = modalCalculations;

    if (editingCombo) {
      updateCombo(editingCombo.id, {
        code: formData.code,
        barcode: formData.barcode,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        originalTotal,
        discountAmount,
        discountPercentage,
        items: formData.items,
        isActive: formData.isActive
      });
    } else {
      addCombo({
        code: formData.code,
        barcode: formData.barcode,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price,
        originalTotal,
        discountAmount,
        discountPercentage,
        items: formData.items,
        isActive: formData.isActive
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="h-6 w-6 text-indigo-600" />
            <span>Manejo de Combos y Paquetes Promocionales</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Empaqueta múltiples productos con precios especiales. El inventario se deduce automáticamente de los componentes físicos en el Kardex.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Crear Nuevo Combo</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Total de Combos</span>
            <Boxes className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">{stats.total}</p>
          <span className="text-[11px] text-slate-400">Configurados en catálogo</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Combos Activos</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600 mt-2">{stats.active}</p>
          <span className="text-[11px] text-emerald-600">Disponibles para venta en POS</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Ahorro Promedio</span>
            <TrendingDown className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-xl font-bold text-indigo-600 mt-2">{stats.avgDiscount}%</p>
          <span className="text-[11px] text-indigo-600">Descuento promedio al cliente</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Ahorro Total Ofrecido</span>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">
            ${stats.totalSavingsSum.toFixed(2)}
          </p>
          <span className="text-[11px] text-slate-400">Sumatoria de ahorro en combos</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        <div className="relative w-full sm:w-96">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, código, código de barras o componente..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto text-xs">
          <WarehouseIcon className="h-4 w-4 text-slate-400" />
          <span className="text-slate-500 font-medium whitespace-nowrap">Ver stock en:</span>
          <select
            value={selectedWarehouseFilter}
            onChange={e => setSelectedWarehouseFilter(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Todas las bodegas</option>
            {warehouses.map(w => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Combos Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCombos.map(combo => {
          // Calculate stock for each warehouse or selected warehouse
          const warehouseStocks = warehouses.map(wh => ({
            warehouse: wh,
            available: getComboAvailableStock(combo, wh.id, products)
          }));

          const primaryStock =
            selectedWarehouseFilter === 'all'
              ? warehouseStocks.reduce((a, b) => a + b.available, 0)
              : warehouseStocks.find(w => w.warehouse.id === selectedWarehouseFilter)?.available || 0;

          return (
            <div
              key={combo.id}
              className={`bg-white border rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:shadow-md ${
                combo.isActive ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {combo.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        combo.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {combo.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                    <Barcode className="h-3 w-3" />
                    {combo.barcode}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-2 line-clamp-1">{combo.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{combo.description}</p>
              </div>

              {/* Price & Savings Banner */}
              <div className="px-4 py-3 bg-linear-to-r from-indigo-50/70 via-purple-50/50 to-pink-50/70 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block line-through">
                    Regular: ${combo.originalTotal.toFixed(2)}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-indigo-700 tracking-tight">
                      ${combo.price.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">Combo</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-xs">
                    <Tag className="h-3 w-3" />
                    Ahorras ${combo.discountAmount.toFixed(2)} (-{combo.discountPercentage}%)
                  </span>
                </div>
              </div>

              {/* Components List */}
              <div className="p-4 space-y-3 flex-1">
                <div>
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                    Productos incluidos ({combo.items.length}):
                  </span>
                  <div className="space-y-1.5">
                    {combo.items.map((it, idx) => {
                      const prod = products.find(p => p.id === it.productId);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-50 border border-slate-100"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-black text-slate-700">
                              {it.quantity}x
                            </span>
                            <span className="text-slate-800 font-medium truncate">
                              {it.productName}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                            ${(it.regularUnitPrice * it.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Stock per Warehouse */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <WarehouseIcon className="h-3.5 w-3.5 text-slate-400" />
                      Combos armables disponibles:
                    </span>
                    <span
                      className={`font-bold ${
                        primaryStock > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {primaryStock} {primaryStock === 1 ? 'combo' : 'combos'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 mt-1">
                    {warehouseStocks.map(({ warehouse, available }) => (
                      <div
                        key={warehouse.id}
                        className="text-[10px] flex justify-between px-2 py-1 bg-slate-50 rounded-md border border-slate-100"
                      >
                        <span className="text-slate-600 truncate pr-1">{warehouse.name}:</span>
                        <span
                          className={`font-semibold shrink-0 ${
                            available > 0 ? 'text-slate-800' : 'text-rose-500'
                          }`}
                        >
                          {available} uds
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => toggleComboActive(combo.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    combo.isActive
                      ? 'text-amber-700 hover:bg-amber-100'
                      : 'text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <Power className="h-3.5 w-3.5" />
                  <span>{combo.isActive ? 'Desactivar' : 'Activar'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(combo)}
                    className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="Editar combo"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar definitivamente el combo "${combo.name}"?`)) {
                        deleteCombo(combo.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="Eliminar combo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCombos.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Boxes className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No se encontraron combos</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Crea tu primer paquete o combo agrupando dos o más productos para ofrecer descuentos atractivos.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
          >
            Crear Combo Ahora
          </button>
        </div>
      )}

      {/* Modal: Create / Edit Combo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Boxes className="h-5 w-5 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {editingCombo ? 'Editar Combo Promocional' : 'Crear Nuevo Combo Promocional'}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveCombo} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código de Combo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código de Barras (EAN / SKU)
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre del Combo o Paquete *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Kit Oficina Ejecutiva (Teclado + Mouse + Pad)"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descripción comercial
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Detalles sobre lo que incluye y sus ventajas..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:bg-white resize-none"
                  />
                </div>
              </div>

              {/* Component Product Selector */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-indigo-600" />
                    <span>Componentes del Paquete (Productos físicos a descontar)</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Mínimo 2 productos</span>
                </div>

                {/* Dropdown to add product */}
                <div className="flex gap-2 mb-3">
                  <select
                    id="productSelector"
                    className="flex-1 py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-indigo-500"
                    defaultValue=""
                    onChange={e => {
                      if (e.target.value) {
                        handleAddComponent(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  >
                    <option value="" disabled>
                      + Selecciona un producto para agregarlo al combo...
                    </option>
                    {products
                      .filter(p => p.isActive)
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} — Precio Reg: ${p.sellingPrice.toFixed(2)} | Costo: ${p.costPrice.toFixed(2)}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Selected Components Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  {formData.items.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No has agregado componentes aún. Selecciona del listado superior.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {formData.items.map(item => (
                        <div
                          key={item.productId}
                          className="p-3 flex items-center justify-between gap-3 text-xs bg-white"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-slate-900 block truncate">
                              {item.productName}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              Reg: ${item.regularUnitPrice.toFixed(2)} | Costo: ${item.unitCost.toFixed(2)}
                            </span>
                          </div>

                          {/* Quantity control */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 text-[11px]">Cant:</span>
                            <input
                              type="number"
                              min={1}
                              max={99}
                              value={item.quantity}
                              onChange={e =>
                                handleUpdateComponentQty(
                                  item.productId,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-14 py-1 px-2 text-center text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg"
                            />
                          </div>

                          <div className="w-20 text-right">
                            <span className="font-bold text-slate-800">
                              ${(item.regularUnitPrice * item.quantity).toFixed(2)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveComponent(item.productId)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing & Savings calculation box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Total Regular Sumado:</span>
                    <span className="text-sm font-bold text-slate-700">
                      ${modalCalculations.originalTotal.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Costo de Ensamble:</span>
                    <span className="text-sm font-bold text-slate-700">
                      ${modalCalculations.totalCost.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Ahorro al Cliente:</span>
                    <span className="text-sm font-bold text-emerald-600">
                      ${modalCalculations.discountAmount.toFixed(2)} (-{modalCalculations.discountPercentage}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Margen Bruto:</span>
                    <span
                      className={`text-sm font-bold ${
                        modalCalculations.profitMargin >= 20 ? 'text-emerald-600' : 'text-amber-600'
                      }`}
                    >
                      {modalCalculations.profitMargin}%
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Precio Final de Venta del Combo ($) *
                  </label>
                  <div className="relative">
                    <DollarSign className="h-4 w-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      step="0.01"
                      required
                      min={0.01}
                      value={formData.price || ''}
                      onChange={e =>
                        setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="Precio con descuento del paquete"
                      className="w-full pl-9 pr-4 py-2 text-sm font-black text-indigo-700 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {formData.price > 0 && formData.price < modalCalculations.totalCost && (
                    <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-1 font-medium">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>¡Atención! El precio del combo es inferior al costo de los componentes (${modalCalculations.totalCost.toFixed(2)}).</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {editingCombo ? 'Guardar Cambios' : 'Crear Combo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
