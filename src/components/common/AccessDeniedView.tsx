import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, ArrowLeft, UserCheck, Lock } from 'lucide-react';
import { getDefaultModuleForRole, getRoleBadgeInfo } from '../../utils/rbac';

interface AccessDeniedViewProps {
  attemptedModule: string;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({ attemptedModule }) => {
  const { currentUser, setCurrentModule, switchUser, users } = useApp();

  const roleInfo = currentUser ? getRoleBadgeInfo(currentUser.role) : null;
  const homeModule = currentUser ? getDefaultModuleForRole(currentUser.role) : 'dashboard';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            Control de Acceso (RF-008 / RF-009)
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-3">Privilegios Insuficientes</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            El módulo al que intentas acceder no está habilitado para el perfil asignado a tu cuenta.
          </p>
        </div>

        {currentUser && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Usuario activo:</span>
              <span className="font-bold text-slate-800">{currentUser.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Rol asignado:</span>
              <span className={`px-2 py-0.5 rounded font-bold border text-[10px] ${roleInfo?.badgeBg} ${roleInfo?.badgeText}`}>
                {currentUser.role}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Módulo solicitado:</span>
              <span className="font-mono text-slate-700 bg-slate-200/60 px-1.5 py-0.5 rounded text-[11px]">
                {attemptedModule}
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={() => setCurrentModule(homeModule)}
            className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Ir a Mi Panel Permitido</span>
          </button>

          {/* If user is testing, allow quick switch to Admin */}
          {currentUser?.role !== 'Administrador' && (
            <button
              onClick={() => {
                const adminUser = users.find(u => u.role === 'Administrador');
                if (adminUser) switchUser(adminUser.id);
              }}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="h-4 w-4" />
              <span>Cambiar a Administrador</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
