import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Truck, Plus, Search, Edit2, Power, Phone, Mail, Building } from 'lucide-react';
import { Supplier } from '../../types';

export const SuppliersView: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, toggleSupplierActive } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    contactName: '',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    creditDays: 30,
    currentDebt: 0,
    category: 'Cómputo y Electrónica'
  });

  const openCreateModal = () => {
    setEditingSupplier(null);
    setFormData({
      code: `PROV-0${(suppliers.length + 1).toString().padStart(2, '0')}`,
      name: '',
      contactName: '',
      taxId: '',
      email: '',
      phone: '',
      address: '',
      creditDays: 30,
      currentDebt: 0,
      category: 'Cómputo y Electrónica'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormData({
      code: sup.code,
      name: sup.name,
      contactName: sup.contactName,
      taxId: sup.taxId,
      email: sup.email,
      phone: sup.phone,
      address: sup.address,
      creditDays: sup.creditDays,
      currentDebt: sup.currentDebt,
      category: sup.category
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      updateSupplier(editingSupplier.id, formData);
    } else {
      addSupplier({
        ...formData,
        isActive: true
      });
    }
    setIsModalOpen(false);
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const term = searchTerm.toLowerCase();
      return (
        term === '' ||
        s.name.toLowerCase().includes(term) ||
        s.code.toLowerCase().includes(term) ||
        s.taxId.toLowerCase().includes(term) ||
        s.contactName.toLowerCase().includes(term)
      );
    });
  }, [suppliers, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Proveedores & Cuentas de Abastecimiento (RF-028 / RF-029)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro comercial de distribuidores, condiciones de pago, crédito y saldos acreedores.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Registrar Proveedor (RF-028)</span>
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
            placeholder="Buscar proveedor por razón social, contacto o NIT..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Empresa Proveedora</th>
                <th className="py-2.5 px-3">Representante / Contacto</th>
                <th className="py-2.5 px-3">NIT / Doc. Fiscal</th>
                <th className="py-2.5 px-3">Rubro</th>
                <th className="py-2.5 px-3 text-center">Días Crédito</th>
                <th className="py-2.5 px-3 text-right">Saldo Pendiente (CxP)</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSuppliers.map(sup => (
                <tr key={sup.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {sup.code}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-900 block">{sup.name}</span>
                    <span className="text-[10px] text-slate-400">{sup.address}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700">
                    <span>{sup.contactName}</span>
                    <span className="block text-[10px] text-slate-400">{sup.phone} · {sup.email}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {sup.taxId}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {sup.category}
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-700">
                    {sup.creditDays} días
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                    <span className={sup.currentDebt > 0 ? 'text-rose-600' : 'text-slate-500'}>
                      ${sup.currentDebt.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded ${
                        sup.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {sup.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEditModal(sup)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                        title="Editar proveedor (RF-030)"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => toggleSupplierActive(sup.id)}
                        className={`p-1 rounded ${
                          sup.isActive
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={sup.isActive ? 'Desactivar proveedor (RF-031)' : 'Activar proveedor'}
                      >
                        <Power className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT SUPPLIER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
              <h3 className="font-bold text-sm text-slate-900">
                {editingSupplier ? 'Editar Proveedor (RF-030)' : 'Registrar Nuevo Proveedor (RF-028)'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIT / Registro Fiscal</label>
                  <input
                    type="text"
                    required
                    value={formData.taxId}
                    onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Razón Social de la Empresa</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Mayoristas Tecnológicos S.A."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Persona de Contacto</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rubro Principal</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Días de Crédito Concedidos</label>
                  <input
                    type="number"
                    value={formData.creditDays}
                    onChange={e => setFormData({ ...formData, creditDays: parseInt(e.target.value) || 0 })}
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
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
