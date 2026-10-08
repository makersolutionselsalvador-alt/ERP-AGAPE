import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Warehouse as WarehouseIcon, Plus, Edit2, CheckCircle2 } from 'lucide-react';
import { Branch, Warehouse } from '../../types';

export const BranchesView: React.FC = () => {
  const { branches, warehouses, addBranch, updateBranch, addWarehouse, updateWarehouse } = useApp();

  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState({
    code: '',
    name: '',
    address: '',
    city: '',
    phone: '',
    managerName: '',
    isMain: false
  });

  // Warehouse Modal (RF-015)
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [warehouseForm, setWarehouseForm] = useState<{
    code: string;
    name: string;
    branchId: string;
    type: Warehouse['type'];
    capacityNotes: string;
  }>({
    code: '',
    name: '',
    branchId: branches[0]?.id || '',
    type: 'Principal',
    capacityNotes: ''
  });

  const openNewBranch = () => {
    setEditingBranch(null);
    setBranchForm({
      code: `SUC-0${branches.length + 1}`,
      name: '',
      address: '',
      city: 'San Salvador',
      phone: '',
      managerName: '',
      isMain: false
    });
    setIsBranchModalOpen(true);
  };

  const openEditBranch = (b: Branch) => {
    setEditingBranch(b);
    setBranchForm({
      code: b.code,
      name: b.name,
      address: b.address,
      city: b.city,
      phone: b.phone,
      managerName: b.managerName,
      isMain: b.isMain
    });
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      updateBranch(editingBranch.id, branchForm);
    } else {
      addBranch({
        ...branchForm,
        isActive: true
      });
    }
    setIsBranchModalOpen(false);
  };

  const openNewWarehouse = () => {
    setEditingWarehouse(null);
    setWarehouseForm({
      code: `BOD-0${warehouses.length + 1}`,
      name: '',
      branchId: branches[0]?.id || '',
      type: 'Secundaria',
      capacityNotes: ''
    });
    setIsWarehouseModalOpen(true);
  };

  const openEditWarehouse = (w: Warehouse) => {
    setEditingWarehouse(w);
    setWarehouseForm({
      code: w.code,
      name: w.name,
      branchId: w.branchId,
      type: w.type,
      capacityNotes: w.capacityNotes || ''
    });
    setIsWarehouseModalOpen(true);
  };

  const handleSaveWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWarehouse) {
      updateWarehouse(editingWarehouse.id, warehouseForm);
    } else {
      addWarehouse({
        ...warehouseForm,
        isActive: true
      });
    }
    setIsWarehouseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* SECCIÓN 1: SUCURSALES (RF-013 / RF-014) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Sucursales y Tiendas (RF-013 / RF-014)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Establecimientos comerciales, locales físicos y responsables de sucursal.
            </p>
          </div>

          <button
            onClick={openNewBranch}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Registrar Sucursal (RF-013)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map(branch => {
            const branchWarehouses = warehouses.filter(w => w.branchId === branch.id);

            return (
              <div
                key={branch.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{branch.name}</span>
                      {branch.isMain && (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-slate-400 block">{branch.code}</span>
                  </div>

                  <button
                    onClick={() => openEditBranch(branch)}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                    title="Editar sucursal (RF-014)"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1 text-slate-600">
                  <p><strong>Dirección:</strong> {branch.address}, {branch.city}</p>
                  <p><strong>Teléfono:</strong> {branch.phone}</p>
                  <p><strong>Gerente:</strong> {branch.managerName}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500">
                  <span>{branchWarehouses.length} bodegas vinculadas</span>
                  <span className="text-emerald-700 font-medium">Operativa</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 2: BODEGAS O ALMACENES (RF-015) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Administración de Bodegas y Almacenes (RF-015)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pisos de venta, bodegas de custodia y almacenes de reabastecimiento.
            </p>
          </div>

          <button
            onClick={openNewWarehouse}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 text-slate-500" />
            <span>Crear Bodega (RF-015)</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Nombre Bodega</th>
                  <th className="py-2.5 px-3">Sucursal Perteneciente</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Especificaciones / Capacidad</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                  <th className="py-2.5 px-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {warehouses.map(wh => {
                  const br = branches.find(b => b.id === wh.branchId);
                  return (
                    <tr key={wh.id} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{wh.code}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{wh.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{br?.name}</td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {wh.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{wh.capacityNotes || '—'}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                          Activa
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => openEditWarehouse(wh)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* BRANCH MODAL */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">
              {editingBranch ? 'Editar Sucursal (RF-014)' : 'Registrar Nueva Sucursal (RF-013)'}
            </h3>

            <form onSubmit={handleSaveBranch} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código</label>
                  <input
                    type="text"
                    required
                    value={branchForm.code}
                    onChange={e => setBranchForm({ ...branchForm, code: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    required
                    value={branchForm.city}
                    onChange={e => setBranchForm({ ...branchForm, city: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre Comercial de la Sucursal</label>
                <input
                  type="text"
                  required
                  value={branchForm.name}
                  onChange={e => setBranchForm({ ...branchForm, name: e.target.value })}
                  placeholder="Ej: Sucursal Escalón"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dirección Exacta</label>
                <input
                  type="text"
                  required
                  value={branchForm.address}
                  onChange={e => setBranchForm({ ...branchForm, address: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={branchForm.phone}
                    onChange={e => setBranchForm({ ...branchForm, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gerente Encargado</label>
                  <input
                    type="text"
                    value={branchForm.managerName}
                    onChange={e => setBranchForm({ ...branchForm, managerName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isMainBranch"
                  checked={branchForm.isMain}
                  onChange={e => setBranchForm({ ...branchForm, isMain: e.target.checked })}
                  className="rounded border-slate-300"
                />
                <label htmlFor="isMainBranch" className="text-slate-700 font-medium">
                  Marcar como Casa Matriz / Sucursal Principal
                </label>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="flex-1 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Guardar Sucursal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WAREHOUSE MODAL (RF-015) */}
      {isWarehouseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">
              {editingWarehouse ? 'Editar Bodega' : 'Crear Bodega (RF-015)'}
            </h3>

            <form onSubmit={handleSaveWarehouse} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código</label>
                  <input
                    type="text"
                    required
                    value={warehouseForm.code}
                    onChange={e => setWarehouseForm({ ...warehouseForm, code: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tipo de Almacén</label>
                  <select
                    value={warehouseForm.type}
                    onChange={e => setWarehouseForm({ ...warehouseForm, type: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Principal">Principal</option>
                    <option value="Secundaria">Secundaria / Piso de Venta</option>
                    <option value="Merma">Merma / Cuarentena</option>
                    <option value="Tránsito">En Tránsito</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre de la Bodega</label>
                <input
                  type="text"
                  required
                  value={warehouseForm.name}
                  onChange={e => setWarehouseForm({ ...warehouseForm, name: e.target.value })}
                  placeholder="Ej: Bodega Central de Repuestos"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sucursal a la que Pertenece</label>
                <select
                  value={warehouseForm.branchId}
                  onChange={e => setWarehouseForm({ ...warehouseForm, branchId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Capacidad / Notas de Almacenaje</label>
                <textarea
                  rows={2}
                  value={warehouseForm.capacityNotes}
                  onChange={e => setWarehouseForm({ ...warehouseForm, capacityNotes: e.target.value })}
                  placeholder="Estanterías pesadas, control climatizado..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsWarehouseModalOpen(false)}
                  className="flex-1 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Guardar Bodega
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
