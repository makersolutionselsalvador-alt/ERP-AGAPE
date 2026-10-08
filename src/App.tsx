import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { TicketModal } from './components/common/TicketModal';
import { AuthModal } from './components/auth/AuthModal';
import { LoginView } from './components/auth/LoginView';
import { AccessDeniedView } from './components/common/AccessDeniedView';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { PosView } from './components/pos/PosView';
import { SalesListView } from './components/sales/SalesListView';
import { QuotesView } from './components/sales/QuotesView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { InventoryView } from './components/inventory/InventoryView';
import { StockAdjustmentsView } from './components/inventory/StockAdjustmentsView';
import { StockMovementsView } from './components/inventory/StockMovementsView';
import { KardexView } from './components/inventory/KardexView';
import { StockTransfersView } from './components/inventory/StockTransfersView';
import { WarehouseReportView } from './components/inventory/WarehouseReportView';
import { ProductsView } from './components/products/ProductsView';
import { CategoriesView } from './components/products/CategoriesView';
import { CombosView } from './components/products/CombosView';
import { PromotionsView } from './components/products/PromotionsView';
import { ClientsView } from './components/contacts/ClientsView';
import { SuppliersView } from './components/contacts/SuppliersView';
import { AccountsReceivableView } from './components/contacts/AccountsReceivableView';
import { AccountsPayableView } from './components/contacts/AccountsPayableView';
import { CashRegisterView } from './components/cash/CashRegisterView';
import { ReportsHubView } from './components/reports/ReportsHubView';
import { EmployeesView } from './components/admin/EmployeesView';
import { BranchesView } from './components/admin/BranchesView';
import { RolesPermissionsView } from './components/admin/RolesPermissionsView';
import { UsersView } from './components/admin/UsersView';
import { AuditLogView } from './components/audit/AuditLogView';
import { SettingsView } from './components/settings/SettingsView';
import { DteManagementView } from './components/dte/DteManagementView';

import { X, CheckCircle, AlertTriangle, Info, AlertOctagon } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { currentModule, toasts, removeToast, currentUser, canAccess } = useApp();

  // Auth Modal State (for changing password while logged in)
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'changePassword' | 'forgotPassword'>('login');

  const openLogin = () => {
    setAuthMode('login');
    setIsAuthOpen(true);
  };

  const openPasswordChange = () => {
    setAuthMode('changePassword');
    setIsAuthOpen(true);
  };

  // If user is not logged in, render the dedicated Login Screen!
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900">
        <LoginView />

        {/* Toast Notification Container */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl shadow-lg border text-xs font-medium transition-all animate-in fade-in slide-in-from-bottom-2 ${
                toast.type === 'error'
                  ? 'bg-rose-50 text-rose-900 border-rose-200'
                  : toast.type === 'warning'
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : toast.type === 'info'
                  ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'error' && <AlertOctagon className="h-4 w-4 text-rose-600 shrink-0" />}
                {toast.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />}
                {toast.type === 'info' && <Info className="h-4 w-4 text-indigo-600 shrink-0" />}
                {toast.type === 'success' && <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const renderActiveModule = () => {
    // RBAC validation: verify current user has permission to access this module
    if (currentModule !== 'dashboard' && !canAccess(currentModule)) {
      return <AccessDeniedView attemptedModule={currentModule} />;
    }

    switch (currentModule) {
      case 'dashboard':
        return <DashboardView />;
      // Administración
      case 'admin-employees':
        return <EmployeesView />;
      case 'admin-branches':
      case 'admin-warehouses':
        return <BranchesView />;
      case 'admin-roles':
      case 'admin-permissions':
        return <RolesPermissionsView />;
      case 'admin-users':
        return <UsersView />;
      // Productos
      case 'products-list':
        return <ProductsView />;
      case 'products-categories':
      case 'products-subcategories':
        return <CategoriesView />;
      case 'products-combos':
        return <CombosView />;
      case 'products-promotions':
        return <PromotionsView />;
      // Inventario
      case 'inventory-stock':
        return <InventoryView />;
      case 'inventory-low-stock':
        return <InventoryView onlyLowStock={true} />;
      case 'inventory-adjustments':
        return <StockAdjustmentsView />;
      case 'inventory-movements':
        return <StockMovementsView />;
      case 'inventory-kardex':
        return <KardexView />;
      case 'inventory-transfers':
        return <StockTransfersView />;
      case 'inventory-warehouse-report':
        return <WarehouseReportView />;
      // Clientes & Proveedores
      case 'contacts-clients':
        return <ClientsView />;
      case 'contacts-suppliers':
        return <SuppliersView />;
      case 'contacts-receivable':
        return <AccountsReceivableView />;
      case 'contacts-payable':
        return <AccountsPayableView />;
      // Compras
      case 'purchases-new':
        return <PurchasesView initialTab="new" />;
      case 'purchases-list':
        return <PurchasesView initialTab="list" />;
      // Ventas
      case 'pos-new-sale':
        return <PosView />;
      case 'sales-quotes':
        return <QuotesView />;
      case 'sales-list':
        return <SalesListView />;
      case 'sales-dte':
        return <DteManagementView />;
      // Caja y Gastos
      case 'cash-open':
      case 'cash-close':
        return <CashRegisterView initialTab="status" />;
      case 'cash-history':
        return <CashRegisterView initialTab="history" />;
      case 'cash-new-expense':
        return <CashRegisterView initialTab="expense" />;
      case 'cash-expenses-list':
        return <CashRegisterView initialTab="expenses-list" />;
      // Reportes
      case 'reports-hub':
        return <ReportsHubView />;
      // Auditoría & Configuración
      case 'audit-trail':
        return <AuditLogView />;
      case 'settings-general':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Navbar */}
      <Navbar onOpenAuth={openLogin} onOpenPasswordModal={openPasswordChange} />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Modular Sidebar (ETAPA 2) */}
        <Sidebar />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {renderActiveModule()}
          </div>
        </main>
      </div>

      {/* Global Thermal POS Receipt / Ticket Modal (RF-048 / RF-049) */}
      <TicketModal />

      {/* Auth & Security Modal (RF-001 - RF-004) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        mode={authMode}
        setMode={setAuthMode}
      />

      {/* Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl shadow-lg border text-xs font-medium transition-all animate-in fade-in slide-in-from-bottom-2 ${
              toast.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : toast.type === 'warning'
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : toast.type === 'info'
                ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'error' && <AlertOctagon className="h-4 w-4 text-rose-600 shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />}
              {toast.type === 'info' && <Info className="h-4 w-4 text-indigo-600 shrink-0" />}
              {toast.type === 'success' && <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
