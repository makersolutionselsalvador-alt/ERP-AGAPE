import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Store,
  Bell,
  Coins,
  ShoppingCart,
  UserCheck,
  LogOut,
  ChevronDown,
  Building2,
  KeyRound,
  FileSpreadsheet
} from 'lucide-react';
import { getRoleBadgeInfo } from '../../utils/rbac';
import { AgapeLogo } from './AgapeLogo';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenPasswordModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth, onOpenPasswordModal }) => {
  const {
    companySettings,
    currentUser,
    users,
    switchUser,
    logout,
    branches,
    selectedBranchId,
    setSelectedBranchId,
    activeCashSession,
    setCurrentModule,
    lowStockProducts,
    accountsReceivable
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingReceivables = accountsReceivable.filter(a => a.status === 'PENDIENTE' || a.status === 'VENCIDO');
  const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 shadow-xs">
      {/* Zone 1: Single text element wordmark & Branch selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCurrentModule('dashboard')}
          className="flex items-center gap-2 text-left group cursor-pointer"
        >
          <AgapeLogo variant="badge" size="md" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-blue-900 group-hover:text-blue-700 transition-colors uppercase">
                {companySettings.tradeName}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              Asociación AGAPE de El Salvador • ERP & Facturación
            </span>
          </div>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

        {/* Branch Selector */}
        <div className="relative hidden md:flex items-center">
          <Building2 className="h-4 w-4 text-slate-400 absolute left-2.5 pointer-events-none" />
          <select
            value={selectedBranchId}
            onChange={e => setSelectedBranchId(e.target.value)}
            className="pl-8 pr-7 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500 appearance-none"
          >
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name} {branch.isMain ? '(Principal)' : ''}
              </option>
            ))}
          </select>
          <ChevronDown className="h-3 w-3 text-slate-400 absolute right-2 pointer-events-none" />
        </div>
      </div>

      {/* Zone 2: Cash status indicator & Quick POS button */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Cash Status Button */}
        {activeCashSession ? (
          <button
            onClick={() => setCurrentModule('cash-close')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors whitespace-nowrap"
            title="Caja activa. Haga clic para corte y arqueo de caja."
          >
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
            <Coins className="h-3.5 w-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Caja Abierta:</span>
            <span className="font-mono tabular-nums">${activeCashSession.expectedCash.toFixed(2)}</span>
          </button>
        ) : (
          <button
            onClick={() => setCurrentModule('cash-open')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors whitespace-nowrap"
            title="No hay caja abierta. Haga clic para abrir turno."
          >
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            <Coins className="h-3.5 w-3.5 text-amber-700" />
            <span>Abrir Caja</span>
          </button>
        )}

        {/* Quick POS Trigger */}
        <button
          onClick={() => setCurrentModule('pos-new-sale')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-800 shadow-xs transition-colors whitespace-nowrap cursor-pointer"
        >
          <ShoppingCart className="h-3.5 w-3.5 text-amber-400" />
          <span>Nueva Venta (POS)</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Alertas del sistema"
          >
            <Bell className="h-4 w-4" />
            {(lowStockProducts.length > 0 || pendingReceivables.length > 0) && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white p-3 shadow-xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notificaciones</span>
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  {lowStockProducts.length + pendingReceivables.length} alertas
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
                {lowStockProducts.length > 0 && (
                  <div
                    onClick={() => {
                      setCurrentModule('inventory-low-stock');
                      setShowNotifications(false);
                    }}
                    className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 cursor-pointer border border-amber-200 transition-colors"
                  >
                    <div className="font-semibold text-amber-900 flex items-center justify-between">
                      <span>Bajo Stock Crítico</span>
                      <span className="font-mono tabular-nums font-bold text-amber-700">{lowStockProducts.length}</span>
                    </div>
                    <p className="text-amber-800 text-[11px] mt-0.5">
                      Hay productos por debajo del umbral mínimo de seguridad.
                    </p>
                  </div>
                )}

                {pendingReceivables.length > 0 && (
                  <div
                    onClick={() => {
                      setCurrentModule('contacts-receivable');
                      setShowNotifications(false);
                    }}
                    className="p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 cursor-pointer border border-indigo-200 transition-colors"
                  >
                    <div className="font-semibold text-indigo-900 flex items-center justify-between">
                      <span>Cuentas por Cobrar</span>
                      <span className="font-mono tabular-nums font-bold text-indigo-700">{pendingReceivables.length}</span>
                    </div>
                    <p className="text-indigo-800 text-[11px] mt-0.5">
                      Créditos pendientes de cobro y primas vencidas.
                    </p>
                  </div>
                )}

                {lowStockProducts.length === 0 && pendingReceivables.length === 0 && (
                  <div className="py-4 text-center text-slate-400">
                    No hay alertas pendientes en este momento.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Zone 3: Active User & Role Switcher */}
        <div className="relative">
          {currentUser ? (
            (() => {
              const badge = getRoleBadgeInfo(currentUser.role);
              return (
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <div className={`h-7 w-7 rounded-lg ${badge.iconBg} text-white flex items-center justify-center font-bold text-xs shadow-2xs`}>
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden lg:flex flex-col">
                    <span className="text-xs font-semibold text-slate-900 leading-tight">
                      {currentUser.name}
                    </span>
                    <span className={`text-[10px] font-bold ${badge.badgeText}`}>
                      {currentUser.role}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>
              );
            })()
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              Iniciar Sesión
            </button>
          )}

          {showUserDropdown && currentUser && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white py-2 shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                {(() => {
                  const b = getRoleBadgeInfo(currentUser.role);
                  return (
                    <div className="mt-2 flex items-center gap-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${b.badgeBg} ${b.badgeText}`}>
                        {b.label}
                      </span>
                      <span className="text-[10px] text-slate-400">• {b.description}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Demo Role Switcher (UX Testing feature) */}
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Cambiar Rol Activo (Modo Demo):
                </span>
                <div className="space-y-1">
                  {users.map(u => {
                    const ub = getRoleBadgeInfo(u.role);
                    return (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowUserDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg text-left transition-colors cursor-pointer ${
                          u.id === currentUser.id
                            ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{u.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ml-2 ${ub.badgeBg} ${ub.badgeText}`}>
                          {u.role}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-1">
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenPasswordModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg transition-colors text-left"
                >
                  <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                  <span>Cambiar Contraseña</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-left"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
