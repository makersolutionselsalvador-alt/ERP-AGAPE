import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Tag,
  Plus,
  Search,
  Edit2,
  Trash2,
  Power,
  Calendar,
  Percent,
  DollarSign,
  Copy,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  AlertCircle,
  X,
  Zap,
  ShoppingBag,
  SlidersHorizontal
} from 'lucide-react';
import { Promotion, PromotionType, PromotionTarget } from '../../types';

export const PromotionsView: React.FC = () => {
  const {
    promotions,
    products,
    categories,
    combos,
    addPromotion,
    updatePromotion,
    deletePromotion,
    togglePromotionActive,
    showToast
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'auto' | 'coupon'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);

  const todayStr = new Date().toISOString().substring(0, 10);

  // Form State
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    description: string;
    type: PromotionType;
    target: PromotionTarget;
    targetId: string;
    discountValue: number;
    minPurchaseAmount: number;
    minQuantity: number;
    startDate: string;
    endDate: string;
    autoApply: boolean;
    usageLimit: number;
    isActive: boolean;
  }>({
    code: '',
    name: '',
    description: '',
    type: 'PORCENTAJE',
    target: 'TODO_CARRITO',
    targetId: '',
    discountValue: 10,
    minPurchaseAmount: 0,
    minQuantity: 1,
    startDate: todayStr,
    endDate: new Date(Date.now() + 60 * 86400000).toISOString().substring(0, 10),
    autoApply: true,
    usageLimit: 0,
    isActive: true
  });

  // Filtered Promotions
  const filteredPromotions = useMemo(() => {
    return promotions.filter(promo => {
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        term === '' ||
        promo.name.toLowerCase().includes(term) ||
        promo.code.toLowerCase().includes(term) ||
        promo.description.toLowerCase().includes(term);

      if (!matchesSearch) return false;

      const isCurrent =
        promo.isActive &&
        (!promo.startDate || todayStr >= promo.startDate) &&
        (!promo.endDate || todayStr <= promo.endDate);

      if (filterTab === 'active') return isCurrent;
      if (filterTab === 'auto') return promo.autoApply && isCurrent;
      if (filterTab === 'coupon') return !promo.autoApply;

      return true;
    });
  }, [promotions, searchTerm, filterTab, todayStr]);

  // Overall Stats
  const stats = useMemo(() => {
    const total = promotions.length;
    const activeToday = promotions.filter(
      p =>
        p.isActive &&
        (!p.startDate || todayStr >= p.startDate) &&
        (!p.endDate || todayStr <= p.endDate)
    ).length;
    const autoApplyCount = promotions.filter(p => p.autoApply && p.isActive).length;
    const totalUses = promotions.reduce((acc, p) => acc + (p.usageCount || 0), 0);

    return { total, activeToday, autoApplyCount, totalUses };
  }, [promotions, todayStr]);

  // Copy code to clipboard
  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    showToast(`Código "${code}" copiado al portapapeles`, 'info');
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingPromotion(null);
    setFormData({
      code: `PROMO-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      description: '',
      type: 'PORCENTAJE',
      target: 'TODO_CARRITO',
      targetId: '',
      discountValue: 10,
      minPurchaseAmount: 50,
      minQuantity: 1,
      startDate: todayStr,
      endDate: new Date(Date.now() + 60 * 86400000).toISOString().substring(0, 10),
      autoApply: true,
      usageLimit: 100,
      isActive: true
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (promo: Promotion) => {
    setEditingPromotion(promo);
    setFormData({
      code: promo.code,
      name: promo.name,
      description: promo.description,
      type: promo.type,
      target: promo.target,
      targetId: promo.targetId || '',
      discountValue: promo.discountValue,
      minPurchaseAmount: promo.minPurchaseAmount || 0,
      minQuantity: promo.minQuantity || 1,
      startDate: promo.startDate,
      endDate: promo.endDate,
      autoApply: promo.autoApply,
      usageLimit: promo.usageLimit || 0,
      isActive: promo.isActive
    });
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSavePromotion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    const promoPayload = {
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      type: formData.type,
      target: formData.target,
      targetId: formData.targetId || undefined,
      discountValue: formData.discountValue,
      minPurchaseAmount: formData.minPurchaseAmount > 0 ? formData.minPurchaseAmount : undefined,
      minQuantity: formData.minQuantity > 1 ? formData.minQuantity : undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      autoApply: formData.autoApply,
      usageLimit: formData.usageLimit > 0 ? formData.usageLimit : undefined,
      isActive: formData.isActive
    };

    if (editingPromotion) {
      updatePromotion(editingPromotion.id, promoPayload);
    } else {
      addPromotion(promoPayload);
    }

    setIsModalOpen(false);
  };

  const getTargetLabel = (promo: Promotion) => {
    switch (promo.target) {
      case 'PRODUCTO': {
        const prod = products.find(p => p.id === promo.targetId);
        return prod ? `Producto: ${prod.name}` : 'Producto individual';
      }
      case 'CATEGORIA': {
        const cat = categories.find(c => c.id === promo.targetId);
        return cat ? `Categoría: ${cat.name}` : 'Categoría completa';
      }
      case 'COMBO': {
        const cmb = combos.find(c => c.id === promo.targetId);
        return cmb ? `Combo: ${cmb.name}` : 'Todos los combos';
      }
      case 'TODO_CARRITO':
      default:
        return 'Todo el Carrito / Total Venta';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Tag className="h-6 w-6 text-pink-600" />
            <span>Gestión de Promociones, Descuentos y Cupones</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configura reglas de descuento automáticas (2x1, % por categoría, monto mínimo) o cupones canjeables en la terminal de facturación POS.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Crear Nueva Promoción</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Promociones Creadas</span>
            <Tag className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">{stats.total}</p>
          <span className="text-[11px] text-slate-400">Total en el sistema</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Vigentes Hoy</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600 mt-2">{stats.activeToday}</p>
          <span className="text-[11px] text-emerald-600">Listas para aplicar</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Automáticas en POS</span>
            <Zap className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-600 mt-2">{stats.autoApplyCount}</p>
          <span className="text-[11px] text-amber-600">Se activan solas al cumplir condición</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Canjes / Usos</span>
            <Sparkles className="h-4 w-4 text-pink-500" />
          </div>
          <p className="text-xl font-bold text-pink-600 mt-2">{stats.totalUses}</p>
          <span className="text-[11px] text-slate-400">Veces aplicadas en tickets</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, nombre o descripción..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto text-xs bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              filterTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({promotions.length})
          </button>
          <button
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              filterTab === 'active'
                ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Activas Hoy
          </button>
          <button
            onClick={() => setFilterTab('auto')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              filterTab === 'auto'
                ? 'bg-white text-amber-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Automáticas
          </button>
          <button
            onClick={() => setFilterTab('coupon')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              filterTab === 'coupon'
                ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cupones Manuales
          </button>
        </div>
      </div>

      {/* Promotions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPromotions.map(promo => {
          const isExpired = promo.endDate && todayStr > promo.endDate;
          const isUpcoming = promo.startDate && todayStr < promo.startDate;
          const isCurrentlyActive = promo.isActive && !isExpired && !isUpcoming;

          return (
            <div
              key={promo.id}
              className={`bg-white border rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:shadow-md ${
                isCurrentlyActive
                  ? 'border-slate-200'
                  : 'border-slate-200 opacity-60 bg-slate-50/50'
              }`}
            >
              {/* Card Header with Coupon Code Badge */}
              <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black tracking-wider px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 border border-pink-200 flex items-center gap-1.5">
                      <Tag className="h-3 w-3" />
                      {promo.code}
                    </span>
                    <button
                      onClick={() => handleCopyCode(promo.code)}
                      className="p-1 text-slate-400 hover:text-pink-600 rounded-md transition-colors"
                      title="Copiar código promocional"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isCurrentlyActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        : isUpcoming
                        ? 'bg-blue-50 text-blue-700'
                        : isExpired
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isCurrentlyActive
                      ? 'Vigente'
                      : isUpcoming
                      ? 'Programada'
                      : isExpired
                      ? 'Vencida'
                      : 'Pausada'}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-2 line-clamp-1">{promo.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{promo.description}</p>
              </div>

              {/* Discount Value Highlight */}
              <div className="px-4 py-3 bg-linear-to-r from-pink-50/70 via-rose-50/50 to-amber-50/70 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">
                    Beneficio ofrecido
                  </span>
                  <span className="text-base font-black text-pink-700">
                    {promo.type === 'PORCENTAJE' && `${promo.discountValue}% de Descuento`}
                    {promo.type === 'MONTO_FIJO' && `$${promo.discountValue.toFixed(2)} Descuento Directo`}
                    {promo.type === 'DOS_POR_UNO' && 'Promoción 2x1 (Lleva 2, Paga 1)'}
                    {promo.type === 'DESCUENTO_ESCALONADO' && `${promo.discountValue}% por volumen`}
                  </span>
                </div>

                <div className="text-right">
                  {promo.autoApply ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                      <Zap className="h-3 w-3 text-amber-600 fill-amber-500" />
                      Auto en POS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      Cupón Manual
                    </span>
                  )}
                </div>
              </div>

              {/* Conditions and Target Details */}
              <div className="p-4 space-y-2.5 text-xs flex-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-[11px] text-slate-400">Aplica a:</span>
                  <span className="font-semibold text-slate-800 text-right truncate max-w-[200px]">
                    {getTargetLabel(promo)}
                  </span>
                </div>

                {promo.minPurchaseAmount && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Compra mínima:</span>
                    <span className="font-semibold text-slate-800">
                      ${promo.minPurchaseAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                {promo.minQuantity && promo.minQuantity > 1 && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-[11px] text-slate-400">Cantidad mínima:</span>
                    <span className="font-semibold text-slate-800">{promo.minQuantity} unidades</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-[11px] text-slate-400">Vigencia:</span>
                  <span className="font-mono text-[11px] text-slate-700">
                    {promo.startDate} al {promo.endDate}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 pt-2 border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">Usos registrados:</span>
                  <span className="font-bold text-slate-900">
                    {promo.usageCount} {promo.usageLimit ? `/ ${promo.usageLimit}` : 'veces'}
                  </span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => togglePromotionActive(promo.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    promo.isActive
                      ? 'text-amber-700 hover:bg-amber-100'
                      : 'text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  <Power className="h-3.5 w-3.5" />
                  <span>{promo.isActive ? 'Pausar' : 'Activar'}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(promo)}
                    className="p-1.5 text-slate-600 hover:text-pink-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="Editar promoción"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar la promoción "${promo.name}"?`)) {
                        deletePromotion(promo.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                    title="Eliminar promoción"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPromotions.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Tag className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No hay promociones en este filtro</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Configura descuentos en porcentaje, ofertas 2x1 o cupones de compra para impulsar tus ventas.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 bg-pink-600 text-white rounded-xl text-xs font-semibold hover:bg-pink-700 cursor-pointer"
          >
            Crear Promoción Ahora
          </button>
        </div>
      )}

      {/* Modal: Create / Edit Promotion */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-pink-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  {editingPromotion ? 'Editar Regla de Promoción' : 'Crear Nueva Promoción'}
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
            <form onSubmit={handleSavePromotion} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código Promocional / Cupón *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. BLACKFRIDAY20"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Beneficio *
                  </label>
                  <select
                    value={formData.type}
                    onChange={e =>
                      setFormData({ ...formData, type: e.target.value as PromotionType })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="PORCENTAJE">Porcentaje (%) de Descuento</option>
                    <option value="MONTO_FIJO">Monto Fijo en Dinero ($)</option>
                    <option value="DOS_POR_UNO">2x1 (Lleva 2, Paga 1)</option>
                    <option value="DESCUENTO_ESCALONADO">Descuento Escalonado por Volumen</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre Descriptivo de la Promoción *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 15% OFF en Línea de Cómputo"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descripción / Términos de la oferta
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Válido en compras mayores a $100 hasta agotar existencias"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Alcance / Objetivo *
                  </label>
                  <select
                    value={formData.target}
                    onChange={e => {
                      const newTarget = e.target.value as PromotionTarget;
                      setFormData({
                        ...formData,
                        target: newTarget,
                        targetId: ''
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500"
                  >
                    <option value="TODO_CARRITO">Todo el Carrito / Total de Venta</option>
                    <option value="CATEGORIA">Categoría Específica</option>
                    <option value="PRODUCTO">Producto Específico</option>
                    <option value="COMBO">Combos Promocionales</option>
                  </select>
                </div>

                {/* Target Specific Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {formData.target === 'CATEGORIA' && 'Seleccionar Categoría'}
                    {formData.target === 'PRODUCTO' && 'Seleccionar Producto'}
                    {formData.target === 'COMBO' && 'Seleccionar Combo'}
                    {formData.target === 'TODO_CARRITO' && 'Elemento Asignado'}
                  </label>

                  {formData.target === 'CATEGORIA' && (
                    <select
                      value={formData.targetId}
                      onChange={e => setFormData({ ...formData, targetId: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <option value="">Selecciona una categoría...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {formData.target === 'PRODUCTO' && (
                    <select
                      value={formData.targetId}
                      onChange={e => setFormData({ ...formData, targetId: e.target.value })}
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <option value="">Selecciona un producto...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (${p.sellingPrice.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  )}

                  {formData.target === 'COMBO' && (
                    <select
                      value={formData.targetId}
                      onChange={e => setFormData({ ...formData, targetId: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <option value="">Todos los combos</option>
                      {combos.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} (${c.price.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  )}

                  {formData.target === 'TODO_CARRITO' && (
                    <div className="px-3 py-2 text-xs bg-slate-100 text-slate-600 rounded-lg">
                      Aplica al subtotal general de la orden
                    </div>
                  )}
                </div>

                {/* Value field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {formData.type === 'PORCENTAJE' || formData.type === 'DESCUENTO_ESCALONADO'
                      ? 'Porcentaje de Descuento (%) *'
                      : formData.type === 'MONTO_FIJO'
                      ? 'Monto a Descontar ($) *'
                      : 'Porcentaje en segunda unidad (%)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.1}
                    max={formData.type === 'PORCENTAJE' ? 100 : undefined}
                    value={formData.discountValue}
                    onChange={e =>
                      setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monto Mínimo de Compra ($)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min={0}
                    placeholder="0 para sin mínimo"
                    value={formData.minPurchaseAmount || ''}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        minPurchaseAmount: parseFloat(e.target.value) || 0
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha Inicio de Vigencia
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha Fin de Vigencia
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Mode toggles */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.autoApply}
                    onChange={e => setFormData({ ...formData, autoApply: e.target.checked })}
                    className="h-4 w-4 rounded-md text-pink-600 focus:ring-pink-500 border-slate-300 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Aplicar automáticamente en POS si se cumple la condición
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Si está desactivado, el cajero o cliente debe ingresar el código o cupón manual en la terminal.
                    </span>
                  </div>
                </label>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Límite de Usos (Opcional)
                    </label>
                    <input
                      type="number"
                      min={0}
                      placeholder="0 para ilimitado"
                      value={formData.usageLimit || ''}
                      onChange={e =>
                        setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cantidad Mínima Requerida (para 2x1 o volumen)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.minQuantity}
                      onChange={e =>
                        setFormData({ ...formData, minQuantity: parseInt(e.target.value) || 1 })
                      }
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
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
                  className="px-5 py-2 text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white rounded-xl shadow-xs cursor-pointer"
                >
                  {editingPromotion ? 'Guardar Cambios' : 'Crear Promoción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
