import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Shield, Plus, Key, Check, CheckSquare, Square } from 'lucide-react';
import { Role } from '../../types';

export const RolesPermissionsView: React.FC = () => {
  const { roles, permissions, addRole, updateRolePermissions } = useApp();

  const [selectedRoleId, setSelectedRoleId] = useState<string>(roles[0]?.id || '');
  const [isNewRoleModalOpen, setIsNewRoleModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];

  const handleTogglePermission = (permCode: string) => {
    if (!selectedRole) return;
    const current = selectedRole.permissions;
    const next = current.includes(permCode)
      ? current.filter(p => p !== permCode)
      : [...current, permCode];

    updateRolePermissions(selectedRole.id, next);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    addRole({
      name: newRoleName,
      description: newRoleDesc,
      permissions: ['POS_SELL']
    });
    setNewRoleName('');
    setNewRoleDesc('');
    setIsNewRoleModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Roles de Acceso & Matriz de Permisos (RF-008 / RF-009)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configuración de perfiles de usuario y asignación granular de privilegios en el sistema.
          </p>
        </div>

        <button
          onClick={() => setIsNewRoleModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Registrar Rol (RF-008)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        {/* Left: Role List */}
        <div className="space-y-2">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
            Roles Definidos ({roles.length})
          </span>

          <div className="space-y-2">
            {roles.map(role => {
              const isSelected = role.id === selectedRole?.id;

              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-indigo-50 border-indigo-600 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900">{role.name}</span>
                    <span className="text-[10px] font-mono text-indigo-700 bg-indigo-100/60 px-1.5 py-0.2 rounded font-semibold">
                      {role.permissions.length} permisos
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">
                    {role.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Permissions Matrix (RF-009) */}
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Matriz de Permisos para:</span>
                <span className="text-indigo-600">{selectedRole?.name}</span>
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Marca o desmarca los privilegios de acceso para los usuarios que tengan este perfil.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedRole) {
                    updateRolePermissions(selectedRole.id, permissions.map(p => p.code));
                  }
                }}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Conceder Todos
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {permissions.map(perm => {
              const hasPerm = selectedRole?.permissions.includes(perm.code);

              return (
                <div
                  key={perm.id}
                  onClick={() => handleTogglePermission(perm.code)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-2.5 ${
                    hasPerm
                      ? 'bg-slate-50 border-slate-300'
                      : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="pt-0.5">
                    {hasPerm ? (
                      <CheckSquare className="h-4 w-4 text-indigo-600" />
                    ) : (
                      <Square className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900">{perm.name}</span>
                      <span className="text-[9px] font-mono text-slate-400">({perm.code})</span>
                    </div>
                    <span className="text-[10px] text-indigo-700 font-medium block">
                      Módulo: {perm.module}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      {perm.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CREATE ROLE MODAL (RF-008) */}
      {isNewRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Registrar Nuevo Rol (RF-008)</h3>

            <form onSubmit={handleCreateRole} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre del Rol</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Supervisor de Turno..."
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={newRoleDesc}
                  onChange={e => setNewRoleDesc(e.target.value)}
                  placeholder="Responsabilidades y alcance..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewRoleModalOpen(false)}
                  className="flex-1 py-2 font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Crear Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
