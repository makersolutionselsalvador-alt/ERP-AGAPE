import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Power,
  History,
  DollarSign,
  Calendar,
  Percent,
  CreditCard,
  X,
  Building,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { Client } from '../../types';
import {
  CATALOGO_DEPARTAMENTOS,
  CATALOGO_MUNICIPIOS_POR_DEPTO,
  CATALOGO_ACTIVIDADES_ECONOMICAS
} from '../../utils/dteHelpers';

export const ClientsView: React.FC = () => {
  const { clients, sales, addClient, updateClient, toggleClientActive, setSelectedSaleForTicket } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Client History Modal (RF-027)
  const [historyClient, setHistoryClient] = useState<Client | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    taxId: '',
    nrc: '',
    codActividad: '47110',
    descActividad: 'Venta al por menor en comercios no especializados',
    departamento: '06',
    municipio: '14',
    esGranContribuyente: false,
    email: '',
    phone: '',
    address: '',
    category: 'Minorista' as Client['category'],
    creditLimit: 0,
    currentDebt: 0,
    discountPercentage: 0
  });

  const openCreateModal = () => {
    setEditingClient(null);
    setFormData({
      code: `CLI-0${(clients.length + 1).toString().padStart(2, '0')}`,
      name: '',
      taxId: '',
      nrc: '',
      codActividad: '47110',
      descActividad: 'Venta al por menor en comercios no especializados',
      departamento: '06',
      municipio: '14',
      esGranContribuyente: false,
      email: '',
      phone: '',
      address: '',
      category: 'Minorista',
      creditLimit: 500,
      currentDebt: 0,
      discountPercentage: 0
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cli: Client) => {
    setEditingClient(cli);
    setFormData({
      code: cli.code,
      name: cli.name,
      taxId: cli.taxId,
      nrc: cli.nrc || '',
      codActividad: cli.codActividad || '47110',
      descActividad: cli.descActividad || 'Venta al por menor en comercios no especializados',
      departamento: cli.departamento || '06',
      municipio: cli.municipio || '14',
      esGranContribuyente: Boolean(cli.esGranContribuyente),
      email: cli.email,
      phone: cli.phone,
      address: cli.address,
      category: cli.category,
      creditLimit: cli.creditLimit,
      currentDebt: cli.currentDebt,
      discountPercentage: cli.discountPercentage
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const actividadNombre = CATALOGO_ACTIVIDADES_ECONOMICAS.find(a => a.codigo === formData.codActividad)?.nombre || formData.descActividad;
    const finalData = {
      ...formData,
      descActividad: actividadNombre
    };

    if (editingClient) {
      updateClient(editingClient.id, finalData);
    } else {
      addClient({
        ...finalData,
        isActive: true
      });
    }
    setIsModalOpen(false);
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const term = searchTerm.toLowerCase();
      return (
        term === '' ||
        c.name.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term) ||
        c.taxId.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
      );
    });
  }, [clients, searchTerm]);

  // Client Purchase History
  const clientPurchases = useMemo(() => {
    if (!historyClient) return [];
    return sales.filter(s => s.clientId === historyClient.id);
  }, [historyClient, sales]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Gestión de Clientes & Fidelización (RF-023 / RF-024)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro de clientes, límites de crédito, descuentos asignados e historial de compras.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Registrar Cliente (RF-023)</span>
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
            placeholder="Buscar por nombre, código CLI, NIT/DNI o correo..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Cliente / Razón Social</th>
                <th className="py-2.5 px-3">NIT / Doc. Fiscal</th>
                <th className="py-2.5 px-3">NRC / DTE 2.0</th>
                <th className="py-2.5 px-3">Contacto</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3 text-right">Límite Crédito</th>
                <th className="py-2.5 px-3 text-right">Deuda Pendiente</th>
                <th className="py-2.5 px-3 text-center">Descuento</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
                <th className="py-2.5 px-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map(client => (
                <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                    {client.code}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-900 block">{client.name}</span>
                    <span className="text-[10px] text-slate-400">{client.address}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">
                    {client.taxId}
                  </td>
                  <td className="py-2.5 px-3">
                    {client.nrc ? (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Building className="h-3 w-3" />
                          NRC: {client.nrc}
                        </span>
                        <span className="block text-[9px] text-emerald-700 font-semibold">
                          ✓ Apto Crédito Fiscal (03)
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400">
                        Consumidor Final (01)
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    <span>{client.phone}</span>
                    <span className="block text-[10px] text-slate-400">{client.email}</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[11px] font-medium text-slate-700">
                      {client.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                    ${client.creditLimit.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                    <span className={client.currentDebt > 0 ? 'text-rose-600' : 'text-slate-500'}>
                      ${client.currentDebt.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-mono tabular-nums font-semibold text-emerald-700">
                      {client.discountPercentage}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded ${
                        client.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {client.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {/* Histórico (RF-027) */}
                      <button
                        onClick={() => setHistoryClient(client)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                        title="Ver histórico de compras (RF-027)"
                      >
                        <History className="h-3.5 w-3.5" />
                      </button>
                      {/* Editar (RF-025) */}
                      <button
                        onClick={() => openEditModal(client)}
                        className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                        title="Editar cliente"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      {/* Desactivar (RF-026) */}
                      <button
                        onClick={() => toggleClientActive(client.id)}
                        className={`p-1 rounded ${
                          client.isActive
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={client.isActive ? 'Desactivar cliente' : 'Activar cliente'}
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

      {/* HISTORICO DE COMPRAS MODAL (RF-027) */}
      {historyClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Histórico de Compras del Cliente (RF-027)
                </h3>
                <p className="text-[11px] text-slate-500">
                  {historyClient.name} · {historyClient.category} (Descuento fidelidad: {historyClient.discountPercentage}%)
                </p>
              </div>
              <button onClick={() => setHistoryClient(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Total Facturado Histórico</span>
                  <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                    ${historyClient.totalPurchases.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Saldo Deudor Actual</span>
                  <span className="text-base font-bold font-mono text-rose-600 tabular-nums">
                    ${historyClient.currentDebt.toFixed(2)}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Límite de Crédito Autorizado</span>
                  <span className="text-base font-bold font-mono text-indigo-700 tabular-nums">
                    ${historyClient.creditLimit.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[9px]">
                    <tr>
                      <th className="py-2 px-3">Ticket</th>
                      <th className="py-2 px-3">Fecha</th>
                      <th className="py-2 px-3">Método</th>
                      <th className="py-2 px-3 text-right">Total</th>
                      <th className="py-2 px-3 text-center">Ticket</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientPurchases.map(sale => (
                      <tr key={sale.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{sale.ticketNumber}</td>
                        <td className="py-2 px-3 font-mono text-slate-500">{sale.createdAt}</td>
                        <td className="py-2 px-3">{sale.paymentMethod}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold">${sale.total.toFixed(2)}</td>
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => {
                              setSelectedSaleForTicket(sale);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 font-medium text-[11px]"
                          >
                            Ver Comprobante
                          </button>
                        </td>
                      </tr>
                    ))}
                    {clientPurchases.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No se han emitido ventas a este cliente en la sesión actual.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT CLIENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3">
              <h3 className="font-bold text-sm text-slate-900">
                {editingClient ? 'Editar Cliente (RF-025)' : 'Registrar Nuevo Cliente (RF-023)'}
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
                  <label className="block font-semibold text-slate-700 mb-1">NIT / DUI / RFC</label>
                  <input
                    type="text"
                    required
                    value={formData.taxId}
                    onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="0614-..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Completo o Razón Social</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Distribuidora Central S.A."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Correo Electrónico</label>
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

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dirección Fiscal / Entrega</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Cliente</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Minorista">Minorista</option>
                    <option value="Mayorista">Mayorista</option>
                    <option value="Corporativo">Corporativo</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Límite Crédito ($)</label>
                  <input
                    type="number"
                    step="50"
                    value={formData.creditLimit}
                    onChange={e => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Descuento (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.discountPercentage}
                    onChange={e => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Sección DTE 2.0: Datos Fiscales para Crédito Fiscal (03) y Facturación Electrónica */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    <span>Facturación Electrónica DTE (Normativa 2.0 MH)</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Requerido para CCF (03)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      NRC (Nº Registro de Contribuyente)
                    </label>
                    <input
                      type="text"
                      value={formData.nrc}
                      onChange={e => setFormData({ ...formData, nrc: e.target.value })}
                      placeholder="Ej: 245678-9"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">Obligatorio si emite Crédito Fiscal (03)</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Actividad Económica (CAT-019)
                    </label>
                    <select
                      value={formData.codActividad}
                      onChange={e => setFormData({ ...formData, codActividad: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      {CATALOGO_ACTIVIDADES_ECONOMICAS.map(act => (
                        <option key={act.codigo} value={act.codigo}>
                          {act.codigo} — {act.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Departamento (CAT-012)
                    </label>
                    <select
                      value={formData.departamento}
                      onChange={e => {
                        const depto = e.target.value;
                        const municipios = CATALOGO_MUNICIPIOS_POR_DEPTO[depto] || [];
                        setFormData({
                          ...formData,
                          departamento: depto,
                          municipio: municipios[0]?.codigo || '01'
                        });
                      }}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      {CATALOGO_DEPARTAMENTOS.map(d => (
                        <option key={d.codigo} value={d.codigo}>
                          {d.codigo} — {d.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Municipio (CAT-013)
                    </label>
                    <select
                      value={formData.municipio}
                      onChange={e => setFormData({ ...formData, municipio: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      {(CATALOGO_MUNICIPIOS_POR_DEPTO[formData.departamento] || []).map(m => (
                        <option key={m.codigo} value={m.codigo}>
                          {m.codigo} — {m.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="esGranContribuyente"
                    checked={formData.esGranContribuyente}
                    onChange={e => setFormData({ ...formData, esGranContribuyente: e.target.checked })}
                    className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="esGranContribuyente" className="text-slate-700 text-xs font-medium cursor-pointer">
                    Cliente clasificado como <b>Gran Contribuyente</b> (Aplica retención 1% IVA en compras)
                  </label>
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
                  Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
