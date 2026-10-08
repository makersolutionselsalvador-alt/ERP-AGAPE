import React, { useState } from 'react';
import { useApp, ActiveModule } from '../../context/AppContext';
import {
  LayoutDashboard,
  Shield,
  Package,
  Boxes,
  Users,
  ShoppingBag,
  ShoppingCart,
  Coins,
  BarChart3,
  Settings,
  History,
  ChevronDown,
  ChevronRight,
  UserCheck,
  Building,
  Warehouse,
  Key,
  FolderTree,
  AlertTriangle,
  ArrowRightLeft,
  FileText,
  DollarSign,
  TrendingDown,
  Layers,
  LogOut
} from 'lucide-react';

interface NavSection {
  title: string;
  key: string;
  icon: React.ElementType;
  items: {
    label: string;
    module: ActiveModule;
    badge?: number;
    badgeVariant?: 'amber' | 'indigo' | 'rose';
  }[];
}

export const Sidebar: React.FC = () => {
  const {
    currentModule,
    setCurrentModule,
    lowStockProducts,
    accountsReceivable,
    accountsPayable,
    sales,
    canAccess,
    currentUser,
    logout
  } = useApp();

  // Keep expanded sections tracked
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    admin: false,
    products: true,
    inventory: true,
    contacts: false,
    purchases: false,
    sales: true,
    cash: false,
    reports: false,
    settings: false
  });

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const pendingReceivablesCount = accountsReceivable.filter(a => a.status === 'PENDIENTE' || a.status === 'VENCIDO').length;
  const pendingPayablesCount = accountsPayable.filter(a => a.status === 'PENDIENTE' || a.status === 'VENCIDO').length;
  const contingencyDteCount = sales.filter(s => s.estadoDte === 'CONTINGENCIA').length;

  const rawSections: NavSection[] = [
    {
      title: 'Administración',
      key: 'admin',
      icon: Shield,
      items: [
        { label: 'Empleados', module: 'admin-employees' },
        { label: 'Sucursales', module: 'admin-branches' },
        { label: 'Bodegas / Almacenes', module: 'admin-warehouses' },
        { label: 'Roles', module: 'admin-roles' },
        { label: 'Permisos', module: 'admin-permissions' },
        { label: 'Usuarios', module: 'admin-users' }
      ]
    },
    {
      title: 'Productos',
      key: 'products',
      icon: Package,
      items: [
        { label: 'Productos', module: 'products-list' },
        { label: 'Categorías', module: 'products-categories' },
        { label: 'Subcategorías', module: 'products-subcategories' },
        { label: 'Combos y Paquetes', module: 'products-combos' },
        { label: 'Promociones y Descuentos', module: 'products-promotions' }
      ]
    },
    {
      title: 'Inventario',
      key: 'inventory',
      icon: Boxes,
      items: [
        { label: 'Inventario', module: 'inventory-stock' },
        {
          label: 'Bajo stock',
          module: 'inventory-low-stock',
          badge: lowStockProducts.length > 0 ? lowStockProducts.length : undefined,
          badgeVariant: 'amber'
        },
        { label: 'Ajustes de inventario', module: 'inventory-adjustments' },
        { label: 'Movimientos de inventario', module: 'inventory-movements' },
        { label: 'Kardex Valorado', module: 'inventory-kardex' },
        { label: 'Transferencias', module: 'inventory-transfers' },
        { label: 'Reporte de Bodega', module: 'inventory-warehouse-report' }
      ]
    },
    {
      title: 'Clientes y Proveedores',
      key: 'contacts',
      icon: Users,
      items: [
        { label: 'Clientes', module: 'contacts-clients' },
        { label: 'Proveedores', module: 'contacts-suppliers' },
        {
          label: 'Cuentas por cobrar',
          module: 'contacts-receivable',
          badge: pendingReceivablesCount > 0 ? pendingReceivablesCount : undefined,
          badgeVariant: 'indigo'
        },
        {
          label: 'Cuentas por pagar',
          module: 'contacts-payable',
          badge: pendingPayablesCount > 0 ? pendingPayablesCount : undefined,
          badgeVariant: 'rose'
        }
      ]
    },
    {
      title: 'Compras',
      key: 'purchases',
      icon: ShoppingBag,
      items: [
        { label: 'Nueva compra', module: 'purchases-new' },
        { label: 'Consultar compras', module: 'purchases-list' }
      ]
    },
    {
      title: 'Ventas',
      key: 'sales',
      icon: ShoppingCart,
      items: [
        { label: 'Nueva venta (POS)', module: 'pos-new-sale' },
        { label: 'Cotizaciones', module: 'sales-quotes' },
        { label: 'Consultar ventas', module: 'sales-list' },
        {
          label: 'Facturación DTE (Hacienda)',
          module: 'sales-dte',
          badge: contingencyDteCount > 0 ? contingencyDteCount : undefined,
          badgeVariant: 'amber'
        }
      ]
    },
    {
      title: 'Caja y Gastos',
      key: 'cash',
      icon: Coins,
      items: [
        { label: 'Apertura de caja', module: 'cash-open' },
        { label: 'Cierre de caja', module: 'cash-close' },
        { label: 'Historial de cierres', module: 'cash-history' },
        { label: 'Registrar gasto', module: 'cash-new-expense' },
        { label: 'Consultar gastos', module: 'cash-expenses-list' }
      ]
    },
    {
      title: 'Reportes',
      key: 'reports',
      icon: BarChart3,
      items: [
        { label: 'Centro de Reportes', module: 'reports-hub' }
      ]
    }
  ];

  // Filter sections by role privileges (RBAC)
  const sections = rawSections
    .map(sec => ({
      ...sec,
      items: sec.items.filter(item => canAccess(item.module))
    }))
    .filter(sec => sec.items.length > 0);

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-slate-50/70 h-[calc(100vh-53px)] overflow-y-auto select-none p-3 flex flex-col justify-between">
      <div className="space-y-1">
        {/* INICIO / DASHBOARD */}
        {canAccess('dashboard') && (
          <button
            onClick={() => setCurrentModule('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              currentModule === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </button>
        )}

        {/* SECTION ACCORDIONS */}
        <div className="pt-2 space-y-1">
          {sections.map(sec => {
            const Icon = sec.icon;
            const isOpen = openSections[sec.key];
            const isAnyActive = sec.items.some(i => i.module === currentModule);

            return (
              <div key={sec.key} className="space-y-0.5">
                <button
                  onClick={() => toggleSection(sec.key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    isAnyActive && !isOpen
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-700 hover:bg-slate-200/50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isAnyActive ? 'text-blue-900' : 'text-slate-500'}`} />
                    <span>{sec.title}</span>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="ml-5 pl-2 border-l border-slate-200 space-y-0.5 py-1">
                    {sec.items.map(item => {
                      const isActive = currentModule === item.module;
                      return (
                        <button
                          key={item.module}
                          onClick={() => setCurrentModule(item.module)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors text-left cursor-pointer ${
                            isActive
                              ? 'bg-blue-900 text-white font-medium shadow-xs'
                              : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 font-normal'
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          {item.badge !== undefined && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-mono tabular-nums font-semibold ${
                                isActive
                                  ? 'bg-amber-400 text-blue-950 font-bold'
                                  : item.badgeVariant === 'amber'
                                  ? 'bg-amber-100 text-amber-800'
                                  : item.badgeVariant === 'rose'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-blue-100 text-blue-900'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* BOTTOM SECTIONS: CONFIGURACION & AUDITORIA (Filtered by privilege) */}
        {(canAccess('audit-trail') || canAccess('settings-general')) && (
          <div className="pt-3 mt-3 border-t border-slate-200 space-y-0.5">
            {canAccess('audit-trail') && (
              <button
                onClick={() => setCurrentModule('audit-trail')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentModule === 'audit-trail'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <History className="h-4 w-4" />
                <span>Auditoría (RF-072)</span>
              </button>
            )}

            {canAccess('settings-general') && (
              <button
                onClick={() => setCurrentModule('settings-general')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentModule === 'settings-general'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-200/60 hover:text-slate-900'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Configuración General</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* QUICK FOOTER INFO & USER BADGE */}
      <div className="pt-3 border-t border-slate-200 text-xs">
        {currentUser && (
          <div className="p-2 rounded-xl bg-white border border-slate-200 shadow-2xs mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-blue-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-blue-900 font-semibold truncate">
                  {currentUser.role}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
        <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
          <span>RF-001 / RF-072</span>
          <span className="font-mono text-slate-400 font-medium">v2.5 PRO</span>
        </div>
      </div>
    </aside>
  );
};
