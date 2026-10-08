import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Power,
  Trash2,
  Tag,
  Barcode,
  DollarSign,
  AlertTriangle,
  Boxes
} from 'lucide-react';
import { Product } from '../../types';

export const ProductsView: React.FC = () => {
  const {
    products,
    categories,
    combos,
    promotions,
    warehouses,
    addProduct,
    updateProduct,
    toggleProductActive,
    setCurrentModule,
    companySettings
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    code: string;
    barcode: string;
    name: string;
    description: string;
    categoryId: string;
    subcategoryId: string;
    brand: string;
    unit: string;
    costPrice: number;
    sellingPrice: number;
    wholesalePrice: number;
    taxRate: number;
    minStock: number;
    maxStock: number;
    warehouseStock: Record<string, number>;
  }>({
    code: '',
    barcode: '',
    name: '',
    description: '',
    categoryId: categories[0]?.id || '',
    subcategoryId: '',
    brand: '',
    unit: 'Unidad',
    costPrice: 0,
    sellingPrice: 0,
    wholesalePrice: 0,
    taxRate: companySettings.defaultTaxRate,
    minStock: 5,
    maxStock: 50,
    warehouseStock: {}
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    const initialStock: Record<string, number> = {};
    warehouses.forEach(w => {
      initialStock[w.id] = 5;
    });
    setFormData({
      code: `PRD-0${products.length + 1}`.padStart(7, '0'),
      barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      name: '',
      description: '',
      categoryId: categories[0]?.id || '',
      subcategoryId: categories[0]?.subcategories[0]?.id || '',
      brand: '',
      unit: 'Unidad',
      costPrice: 10,
      sellingPrice: 15,
      wholesalePrice: 13,
      taxRate: companySettings.defaultTaxRate,
      minStock: 4,
      maxStock: 50,
      warehouseStock: initialStock
    });
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      code: prod.code,
      barcode: prod.barcode,
      name: prod.name,
      description: prod.description || '',
      categoryId: prod.categoryId,
      subcategoryId: prod.subcategoryId || '',
      brand: prod.brand || '',
      unit: prod.unit,
      costPrice: prod.costPrice,
      sellingPrice: prod.sellingPrice,
      wholesalePrice: prod.wholesalePrice || prod.sellingPrice,
      taxRate: prod.taxRate,
      minStock: prod.minStock,
      maxStock: prod.maxStock || 50,
      warehouseStock: { ...prod.warehouseStock }
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, {
        ...formData
      });
    } else {
      addProduct({
        ...formData,
        isActive: true
      });
    }
    setIsModalOpen(false);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch =
        searchTerm === '' ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.barcode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const selectedCategoryObj = categories.find(c => c.id === formData.categoryId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Catálogo de Productos & Precios (RF-017 / RF-018)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administra artículos, precios de venta, costos de compra, códigos de barra y márgenes.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setCurrentModule('products-combos')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors shadow-xs cursor-pointer"
          >
            <Boxes className="h-3.5 w-3.5" />
            <span>Combos y Paquetes</span>
          </button>
          <button
            onClick={() => setCurrentModule('products-promotions')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-pink-700 bg-pink-50 border border-pink-200 rounded-lg hover:bg-pink-100 transition-colors shadow-xs cursor-pointer"
          >
            <Tag className="h-3.5 w-3.5" />
            <span>Promociones y Descuentos</span>
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Registrar Producto (RF-017)</span>
          </button>
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
            placeholder="Buscar por código, nombre, marca o código de barra..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs"
        >
          <option value="all">Todas las categorías</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Código / Barras</th>
                <th className="py-2.5 px-3">Producto</th>
                <th className="py-2.5 px-3">Categoría</th>
                <th className="py-2.5 px-3 text-right">Costo</th>
                <th className="py-2.5 px-3 text-right">Precio Venta</th>
                <th className="py-2.5 px-3 text-right">Margen %</th>
                <th className="py-2.5 px-3 text-right">Stock Total</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(prod => {
                const totalStock = Object.values(prod.warehouseStock || {}).reduce((a, b) => a + b, 0);
                const margin = prod.sellingPrice > 0 ? ((prod.sellingPrice - prod.costPrice) / prod.sellingPrice) * 100 : 0;
                const cat = categories.find(c => c.id === prod.categoryId);

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-bold text-slate-900 block">{prod.code}</span>
                      <span className="font-mono text-[10px] text-slate-400">{prod.barcode}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-800 block">{prod.name}</span>
                      <span className="text-[10px] text-slate-400">{prod.brand || 'Genérico'} · {prod.unit}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {cat?.name || 'General'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                      ${prod.costPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${prod.sellingPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-indigo-700 font-semibold">
                      {margin.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                      <span className={totalStock <= prod.minStock ? 'text-amber-700' : 'text-slate-900'}>
                        {totalStock}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded ${
                          prod.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {prod.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                          title="Editar producto (RF-019)"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => toggleProductActive(prod.id)}
                          className={`p-1 rounded transition-colors ${
                            prod.isActive
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={prod.isActive ? 'Desactivar producto (RF-020)' : 'Activar producto'}
                        >
                          <Power className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL (RF-017 / RF-019) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
              <h3 className="font-bold text-sm text-slate-900">
                {editingProduct ? 'Editar Producto (RF-019)' : 'Registrar Nuevo Producto (RF-017)'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código Interno</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código de Barras</label>
                  <input
                    type="text"
                    required
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marca / Fabricante</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Ej. Logitech, Dell..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Comercial del Producto</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Teclado Mecánico Inalámbrico..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoría (RF-021)</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => {
                      const catId = e.target.value;
                      const catObj = categories.find(c => c.id === catId);
                      setFormData({
                        ...formData,
                        categoryId: catId,
                        subcategoryId: catObj?.subcategories[0]?.id || ''
                      });
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subcategoría (RF-022)</label>
                  <select
                    value={formData.subcategoryId}
                    onChange={e => setFormData({ ...formData, subcategoryId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="">Ninguna</option>
                    {selectedCategoryObj?.subcategories.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unidad de Medida</label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Unidad">Unidad</option>
                    <option value="Caja">Caja</option>
                    <option value="Kit">Kit / Combo</option>
                    <option value="Metro">Metro</option>
                    <option value="Servicio">Servicio</option>
                  </select>
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Costo de Compra ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.costPrice}
                    onChange={e => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio de Venta ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.sellingPrice}
                    onChange={e => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-indigo-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Precio Mayorista ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.wholesalePrice}
                    onChange={e => setFormData({ ...formData, wholesalePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Stock Thresholds */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Mínimo (Alerta RF-036)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.minStock}
                    onChange={e => setFormData({ ...formData, minStock: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tasa de Impuesto (%)</label>
                  <input
                    type="number"
                    value={formData.taxRate}
                    onChange={e => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
