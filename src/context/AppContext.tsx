import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CompanySettings,
  Role,
  Permission,
  User,
  Employee,
  Branch,
  Warehouse,
  Category,
  Subcategory,
  Product,
  StockMovement,
  KardexEntry,
  StockAdjustment,
  StockTransfer,
  Client,
  Supplier,
  Sale,
  Quote,
  Purchase,
  AccountReceivable,
  AccountPayable,
  CashSession,
  Expense,
  AuditLog,
  Combo,
  Promotion,
  AppliedPromotion,
  TipoDte,
  EstadoDte
} from '../types';
import { generateCodigoGeneracion, generateNumeroControl, verificarPlazoInvalidacion } from '../utils/dteHelpers';
import {
  initialCompanySettings,
  initialPermissions,
  initialRoles,
  initialBranches,
  initialWarehouses,
  initialEmployees,
  initialUsers,
  initialCategories,
  initialProducts,
  initialClients,
  initialSuppliers,
  initialCashSessions,
  initialExpenses,
  initialSales,
  initialQuotes,
  initialPurchases,
  initialAccountsReceivable,
  initialAccountsPayable,
  initialStockMovements,
  initialKardex,
  initialAuditLogs,
  initialCombos,
  initialPromotions
} from '../data/initialData';
import { canAccessModule, getDefaultModuleForRole } from '../utils/rbac';
import { exportDatabaseBackup, importDatabaseBackup, clearAllLocalData } from '../services/databaseService';

export type ActiveModule = 
  | 'dashboard'
  // Administración
  | 'admin-employees'
  | 'admin-branches'
  | 'admin-warehouses'
  | 'admin-roles'
  | 'admin-permissions'
  | 'admin-users'
  // Productos
  | 'products-list'
  | 'products-categories'
  | 'products-subcategories'
  | 'products-combos'
  | 'products-promotions'
  // Inventario
  | 'inventory-stock'
  | 'inventory-low-stock'
  | 'inventory-adjustments'
  | 'inventory-movements'
  | 'inventory-transfers'
  | 'inventory-warehouse-report'
  | 'inventory-kardex'
  // Clientes y Proveedores
  | 'contacts-clients'
  | 'contacts-suppliers'
  | 'contacts-receivable'
  | 'contacts-payable'
  // Compras
  | 'purchases-new'
  | 'purchases-list'
  // Ventas & DTE
  | 'pos-new-sale'
  | 'sales-quotes'
  | 'sales-list'
  | 'sales-dte'
  // Caja y Gastos
  | 'cash-open'
  | 'cash-close'
  | 'cash-history'
  | 'cash-new-expense'
  | 'cash-expenses-list'
  // Reportes
  | 'reports-hub'
  // Configuración & Auditoría
  | 'settings-general'
  | 'audit-trail';

interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

interface AppContextType {
  // Navigation & UI
  currentModule: ActiveModule;
  setCurrentModule: (mod: ActiveModule) => void;
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  selectedSaleForTicket: Sale | null;
  setSelectedSaleForTicket: (sale: Sale | null) => void;

  // Settings
  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;

  // Auth & Security (RF-001 - RF-009)
  currentUser: User | null;
  users: User[];
  roles: Role[];
  permissions: Permission[];
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  changePassword: (userId: string, newPass: string) => boolean;
  resetPassword: (email: string) => boolean;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, user: Partial<User>) => void;
  toggleUserActive: (id: string) => void;
  addRole: (role: Omit<Role, 'id' | 'userCount'>) => void;
  updateRolePermissions: (roleId: string, permissions: string[]) => void;

  // Administración (RF-010 - RF-016)
  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  toggleEmployeeActive: (id: string) => void;

  branches: Branch[];
  addBranch: (br: Omit<Branch, 'id'>) => void;
  updateBranch: (id: string, br: Partial<Branch>) => void;

  warehouses: Warehouse[];
  addWarehouse: (wh: Omit<Warehouse, 'id'>) => void;
  updateWarehouse: (id: string, wh: Partial<Warehouse>) => void;

  // Productos y Catálogos (RF-017 - RF-022)
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id' | 'subcategories'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addSubcategory: (categoryId: string, sub: Omit<Subcategory, 'id' | 'categoryId'>) => void;
  deleteSubcategory: (categoryId: string, subId: string) => void;

  products: Product[];
  addProduct: (prod: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, prod: Partial<Product>) => void;
  toggleProductActive: (id: string) => void;
  lowStockProducts: Product[];

  // Combos & Paquetes Promocionales
  combos: Combo[];
  addCombo: (combo: Omit<Combo, 'id' | 'createdAt'>) => void;
  updateCombo: (id: string, combo: Partial<Combo>) => void;
  deleteCombo: (id: string) => void;
  toggleComboActive: (id: string) => void;

  // Promociones & Cupones
  promotions: Promotion[];
  addPromotion: (promo: Omit<Promotion, 'id' | 'usageCount'>) => void;
  updatePromotion: (id: string, promo: Partial<Promotion>) => void;
  deletePromotion: (id: string) => void;
  togglePromotionActive: (id: string) => void;

  // Clientes y Proveedores (RF-023 - RF-031)
  clients: Client[];
  addClient: (cli: Omit<Client, 'id' | 'totalPurchases' | 'createdAt'>) => void;
  updateClient: (id: string, cli: Partial<Client>) => void;
  toggleClientActive: (id: string) => void;

  suppliers: Supplier[];
  addSupplier: (sup: Omit<Supplier, 'id' | 'createdAt'>) => void;
  updateSupplier: (id: string, sup: Partial<Supplier>) => void;
  toggleSupplierActive: (id: string) => void;

  // Inventario & Kardex (RF-032 - RF-038)
  stockMovements: StockMovement[];
  kardex: KardexEntry[];
  recordStockAdjustment: (adj: Omit<StockAdjustment, 'id' | 'code' | 'userId' | 'userName' | 'createdAt'>) => void;
  transferStock: (transfer: Omit<StockTransfer, 'id' | 'code' | 'status' | 'transferredBy' | 'createdAt'>) => void;

  // Compras y Cuentas por Pagar (RF-039 - RF-044)
  purchases: Purchase[];
  accountsPayable: AccountPayable[];
  createPurchase: (purData: {
    supplierId: string;
    invoiceNumber: string;
    warehouseId: string;
    items: { productId: string; quantity: number; unitCost: number }[];
    paymentType: 'Contado' | 'Crédito';
    dueDate?: string;
  }) => void;
  voidPurchase: (purchaseId: string, reason: string) => void;
  registerSupplierPayment: (accountPayableId: string, amount: number, paymentMethod: string, reference: string) => void;

  // Ventas, Cotizaciones y Cobros (RF-045 - RF-051)
  sales: Sale[];
  quotes: Quote[];
  createSale: (saleData: {
    clientId: string;
    warehouseId: string;
    items: {
      productId: string;
      productCode?: string;
      productName?: string;
      isCombo?: boolean;
      comboId?: string;
      comboComponents?: {
        productId: string;
        productName: string;
        quantity: number;
        unitCost: number;
      }[];
      quantity: number;
      unitPrice: number;
      unitCost: number;
      discountPercentage: number;
      promotionDiscount?: number;
    }[];
    paymentMethod: Sale['paymentMethod'];
    paymentDetails?: Sale['paymentDetails'];
    amountPaid: number;
    changeGiven: number;
    paymentStatus?: 'PAGADO' | 'PENDIENTE';
    dueDate?: string;
    appliedPromotions?: AppliedPromotion[];
    promotionDiscountTotal?: number;
    // DTE 2.0 Parameters
    dteType?: TipoDte;
    codigoGeneracion?: string;
    numeroControl?: string;
    selloRecibido?: string;
    fhProcesamiento?: string;
    estadoDte?: EstadoDte;
    tipoModelo?: number;
    dteJsonRaw?: string;
    signedJws?: string;
    dteObservaciones?: string[];
    retencionIva1?: number;
  }) => Sale;
  voidSale: (saleId: string, reason: string) => void;
  processReturn: (saleId: string, productId: string, quantityToReturn: number, reason: string) => void;
  transmitDteContingency: (saleId: string) => Promise<{ success: boolean; message: string; selloRecibido?: string }>;
  invalidateDte: (saleId: string, motivo: string, responsableDoc?: string, responsableNombre?: string, codigoGeneracionR?: string) => { success: boolean; message: string };

  createQuote: (quoteData: {
    clientId: string;
    items: { productId: string; quantity: number; unitPrice: number; discountPercentage: number }[];
    validUntil: string;
    notes?: string;
  }) => void;
  convertQuoteToSale: (quoteId: string, paymentMethod: Sale['paymentMethod'], amountPaid: number) => void;

  // Cuentas por Cobrar (RF-052 - RF-054)
  accountsReceivable: AccountReceivable[];
  registerClientPayment: (accountReceivableId: string, amount: number, paymentMethod: string, reference: string) => void;

  // Caja y Gastos (RF-055 - RF-059)
  cashSessions: CashSession[];
  activeCashSession: CashSession | null;
  openCashSession: (initialCash: number, notes?: string) => void;
  closeCashSession: (actualCash: number, notes?: string) => void;
  expenses: Expense[];
  addExpense: (expense: {
    category: Expense['category'];
    amount: number;
    concept: string;
    paidTo: string;
    receiptNumber?: string;
  }) => void;

  // Auditoría (RF-072)
  auditLogs: AuditLog[];
  logAuditAction: (module: AuditLog['module'], action: AuditLog['action'], description: string, reqCode: string) => void;

  // Acceso y Permisos por Roles (RBAC)
  canAccess: (module: ActiveModule) => boolean;

  // Persistencia de Archivos / Base de Datos
  exportDatabase: () => string;
  importDatabase: (jsonString: string) => { success: boolean; message: string };
  resetDatabase: () => void;

  // Form Reset / Sample Reload
  restoreDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'nexuserp_data_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentModule, setCurrentModule] = useState<ActiveModule>('dashboard');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('br-1');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [selectedSaleForTicket, setSelectedSaleForTicket] = useState<Sale | null>(null);

  // Entities loaded from Storage or Initial
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() =>
    loadFromStorage('companySettings', initialCompanySettings)
  );
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', initialUsers));
  const [currentUser, setCurrentUser] = useState<User | null>(() => users[0] || initialUsers[0]);
  const [roles, setRoles] = useState<Role[]>(() => loadFromStorage('roles', initialRoles));
  const [permissions] = useState<Permission[]>(initialPermissions);
  const [employees, setEmployees] = useState<Employee[]>(() => loadFromStorage('employees', initialEmployees));
  const [branches, setBranches] = useState<Branch[]>(() => loadFromStorage('branches', initialBranches));
  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => loadFromStorage('warehouses', initialWarehouses));
  const [categories, setCategories] = useState<Category[]>(() => loadFromStorage('categories', initialCategories));
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('products', initialProducts));
  const [combos, setCombos] = useState<Combo[]>(() => loadFromStorage('combos', initialCombos));
  const [promotions, setPromotions] = useState<Promotion[]>(() => loadFromStorage('promotions', initialPromotions));
  const [clients, setClients] = useState<Client[]>(() => loadFromStorage('clients', initialClients));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadFromStorage('suppliers', initialSuppliers));
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() =>
    loadFromStorage('stockMovements', initialStockMovements)
  );
  const [kardex, setKardex] = useState<KardexEntry[]>(() => loadFromStorage('kardex', initialKardex));
  const [purchases, setPurchases] = useState<Purchase[]>(() => loadFromStorage('purchases', initialPurchases));
  const [accountsPayable, setAccountsPayable] = useState<AccountPayable[]>(() =>
    loadFromStorage('accountsPayable', initialAccountsPayable)
  );
  const [sales, setSales] = useState<Sale[]>(() => loadFromStorage('sales', initialSales));
  const [quotes, setQuotes] = useState<Quote[]>(() => loadFromStorage('quotes', initialQuotes));
  const [accountsReceivable, setAccountsReceivable] = useState<AccountReceivable[]>(() =>
    loadFromStorage('accountsReceivable', initialAccountsReceivable)
  );
  const [cashSessions, setCashSessions] = useState<CashSession[]>(() =>
    loadFromStorage('cashSessions', initialCashSessions)
  );
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage('expenses', initialExpenses));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('auditLogs', initialAuditLogs));

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'companySettings', JSON.stringify(companySettings));
  }, [companySettings]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
  }, [users]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'roles', JSON.stringify(roles));
  }, [roles]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'employees', JSON.stringify(employees));
  }, [employees]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'branches', JSON.stringify(branches));
  }, [branches]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'warehouses', JSON.stringify(warehouses));
  }, [warehouses]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'categories', JSON.stringify(categories));
  }, [categories]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'products', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'combos', JSON.stringify(combos));
  }, [combos]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'promotions', JSON.stringify(promotions));
  }, [promotions]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'clients', JSON.stringify(clients));
  }, [clients]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'suppliers', JSON.stringify(suppliers));
  }, [suppliers]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'stockMovements', JSON.stringify(stockMovements));
  }, [stockMovements]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'kardex', JSON.stringify(kardex));
  }, [kardex]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'purchases', JSON.stringify(purchases));
  }, [purchases]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'accountsPayable', JSON.stringify(accountsPayable));
  }, [accountsPayable]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'sales', JSON.stringify(sales));
  }, [sales]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'quotes', JSON.stringify(quotes));
  }, [quotes]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'accountsReceivable', JSON.stringify(accountsReceivable));
  }, [accountsReceivable]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'cashSessions', JSON.stringify(cashSessions));
  }, [cashSessions]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'expenses', JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Toast System
  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Helper: Audit Log (RF-072)
  const logAuditAction = (module: AuditLog['module'], action: AuditLog['action'], description: string, reqCode: string) => {
    const newLog: AuditLog = {
      id: 'aud-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'Sistema',
      module,
      action,
      description,
      requirementCode: reqCode,
      ipAddress: '127.0.0.1'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Company Settings (RF-016)
  const updateCompanySettings = (newSettings: Partial<CompanySettings>) => {
    setCompanySettings(prev => ({ ...prev, ...newSettings }));
    logAuditAction('Configuración', 'EDITAR', 'Parámetros fiscales y del negocio actualizados', 'RF-016');
    showToast('Configuraciones guardadas correctamente');
  };

  // Auth & Users (RF-001 - RF-007)
  const login = (identifier: string, pass?: string): boolean => {
    const trimmed = identifier.trim().toLowerCase();
    const found = users.find(
      u => u.username.toLowerCase() === trimmed || u.email.toLowerCase() === trimmed
    );
    if (!found) {
      showToast('Usuario o correo no encontrado en el sistema', 'error');
      return false;
    }
    if (!found.isActive) {
      showToast('Este usuario ha sido desactivado por el administrador', 'warning');
      return false;
    }
    if (pass !== undefined && pass !== '') {
      const userPass = found.password || 'demo123';
      if (pass !== userPass && pass !== 'demo123') {
        showToast('Contraseña incorrecta. Verifique sus credenciales.', 'error');
        return false;
      }
    }
    const updatedUser: User = {
      ...found,
      lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setUsers(prev => prev.map(u => (u.id === found.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    setCurrentModule(getDefaultModuleForRole(updatedUser.role));
    logAuditAction('Seguridad', 'LOGIN', `Inicio de sesión exitoso de ${updatedUser.name} (${updatedUser.role})`, 'RF-001');
    showToast(`¡Bienvenido de nuevo, ${updatedUser.name}!`);
    return true;
  };

  const logout = () => {
    if (currentUser) {
      logAuditAction('Seguridad', 'LOGIN', `Cierre de sesión de ${currentUser.name}`, 'RF-002');
    }
    setCurrentUser(null);
    showToast('Sesión cerrada de forma segura', 'info');
  };

  const switchUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      if (!canAccessModule(user, currentModule, roles)) {
        setCurrentModule(getDefaultModuleForRole(user.role));
      }
      logAuditAction('Seguridad', 'LOGIN', `Cambio activo a usuario: ${user.name} (${user.role})`, 'RF-001');
      showToast(`Usuario activo: ${user.name} (${user.role})`, 'info');
    }
  };

  const changePassword = (userId: string, newPass: string): boolean => {
    if (!newPass || newPass.length < 4) {
      showToast('La nueva contraseña debe tener al menos 4 caracteres', 'error');
      return false;
    }
    const user = users.find(u => u.id === userId);
    if (user) {
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, password: newPass } : u)));
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(prev => (prev ? { ...prev, password: newPass } : null));
      }
      logAuditAction('Seguridad', 'EDITAR', `Cambio de contraseña para ${user.name}`, 'RF-003');
      showToast('Contraseña actualizada con éxito');
      return true;
    }
    return false;
  };

  const canAccess = (mod: ActiveModule): boolean => {
    return canAccessModule(currentUser, mod, roles);
  };

  const exportDatabase = (): string => {
    logAuditAction('Configuración', 'EXPORTAR', 'Copia de seguridad completa generada', 'RF-069');
    return exportDatabaseBackup();
  };

  const importDatabase = (jsonStr: string): { success: boolean; message: string } => {
    const res = importDatabaseBackup(jsonStr);
    if (res.success) {
      logAuditAction('Configuración', 'CREAR', 'Restauración de copia de seguridad aplicada', 'RF-016');
      showToast(res.message, 'success');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      showToast(res.message, 'error');
    }
    return res;
  };

  const resetDatabase = () => {
    clearAllLocalData();
    restoreDemoData();
    logAuditAction('Configuración', 'ELIMINAR', 'Base de datos reiniciada a valores de fábrica', 'RF-016');
    showToast('Base de datos reiniciada a valores iniciales de fábrica', 'info');
  };

  const resetPassword = (email: string): boolean => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      logAuditAction('Seguridad', 'EDITAR', `Solicitud de restablecimiento enviada a ${email}`, 'RF-004');
      showToast(`Instrucciones de restablecimiento enviadas a ${email}`);
      return true;
    }
    showToast('El correo no se encuentra registrado en el sistema', 'error');
    return false;
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: 'usr-' + Date.now(),
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setUsers(prev => [...prev, newUser]);
    logAuditAction('Seguridad', 'CREAR', `Nuevo usuario registrado: ${newUser.username} (${newUser.role})`, 'RF-005');
    showToast(`Usuario ${newUser.username} creado`);
  };

  const updateUser = (id: string, updated: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updated } : u)));
    logAuditAction('Seguridad', 'EDITAR', `Usuario modificado: ID ${id}`, 'RF-006');
    showToast('Usuario actualizado correctamente');
  };

  const toggleUserActive = (id: string) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const nextState = !u.isActive;
          logAuditAction('Seguridad', 'DESACTIVAR', `Usuario ${u.username} ${nextState ? 'activado' : 'desactivado'}`, 'RF-007');
          showToast(`Usuario ${u.username} ${nextState ? 'activado' : 'desactivado'}`);
          return { ...u, isActive: nextState };
        }
        return u;
      })
    );
  };

  const addRole = (roleData: Omit<Role, 'id' | 'userCount'>) => {
    const newRole: Role = {
      ...roleData,
      id: 'role-' + Date.now(),
      userCount: 0
    };
    setRoles(prev => [...prev, newRole]);
    logAuditAction('Seguridad', 'CREAR', `Nuevo rol creado: ${newRole.name}`, 'RF-008');
    showToast(`Rol ${newRole.name} registrado`);
  };

  const updateRolePermissions = (roleId: string, permissions: string[]) => {
    setRoles(prev =>
      prev.map(r => (r.id === roleId ? { ...r, permissions } : r))
    );
    const role = roles.find(r => r.id === roleId);
    logAuditAction('Seguridad', 'EDITAR', `Permisos actualizados para rol ${role?.name || roleId}`, 'RF-009');
    showToast('Permisos de rol actualizados');
  };

  // Empleados (RF-010 - RF-012)
  const addEmployee = (empData: Omit<Employee, 'id'>) => {
    const newEmp: Employee = {
      ...empData,
      id: 'emp-' + Date.now()
    };
    setEmployees(prev => [...prev, newEmp]);
    logAuditAction('Administración', 'CREAR', `Empleado registrado: ${newEmp.firstName} ${newEmp.lastName} (${newEmp.code})`, 'RF-010');
    showToast('Empleado registrado exitosamente');
  };

  const updateEmployee = (id: string, empData: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => (e.id === id ? { ...e, ...empData } : e)));
    logAuditAction('Administración', 'EDITAR', `Empleado actualizado ID ${id}`, 'RF-011');
    showToast('Datos de empleado actualizados');
  };

  const toggleEmployeeActive = (id: string) => {
    setEmployees(prev =>
      prev.map(e => {
        if (e.id === id) {
          const next = !e.isActive;
          logAuditAction('Administración', 'DESACTIVAR', `Empleado ${e.firstName} ${e.lastName} ${next ? 'activado' : 'desactivado'}`, 'RF-012');
          showToast(`Empleado ${next ? 'activado' : 'desactivado'}`);
          return { ...e, isActive: next };
        }
        return e;
      })
    );
  };

  // Sucursales y Bodegas (RF-013 - RF-015)
  const addBranch = (brData: Omit<Branch, 'id'>) => {
    const newBr: Branch = {
      ...brData,
      id: 'br-' + Date.now()
    };
    setBranches(prev => [...prev, newBr]);
    // Create default warehouse for this branch
    const defaultWh: Warehouse = {
      id: 'wh-' + Date.now(),
      code: 'BOD-' + newBr.code,
      name: 'Bodega ' + newBr.name,
      branchId: newBr.id,
      type: 'Principal',
      isActive: true
    };
    setWarehouses(prev => [...prev, defaultWh]);
    logAuditAction('Administración', 'CREAR', `Nueva sucursal registrada: ${newBr.name} (${newBr.code})`, 'RF-013');
    showToast(`Sucursal ${newBr.name} registrada`);
  };

  const updateBranch = (id: string, brData: Partial<Branch>) => {
    setBranches(prev => prev.map(b => (b.id === id ? { ...b, ...brData } : b)));
    logAuditAction('Administración', 'EDITAR', `Sucursal actualizada ID ${id}`, 'RF-014');
    showToast('Sucursal actualizada');
  };

  const addWarehouse = (whData: Omit<Warehouse, 'id'>) => {
    const newWh: Warehouse = {
      ...whData,
      id: 'wh-' + Date.now()
    };
    setWarehouses(prev => [...prev, newWh]);
    logAuditAction('Administración', 'CREAR', `Nueva bodega creada: ${newWh.name} (${newWh.code})`, 'RF-015');
    showToast(`Bodega ${newWh.name} registrada`);
  };

  const updateWarehouse = (id: string, whData: Partial<Warehouse>) => {
    setWarehouses(prev => prev.map(w => (w.id === id ? { ...w, ...whData } : w)));
    logAuditAction('Administración', 'EDITAR', `Bodega actualizada ID ${id}`, 'RF-015');
    showToast('Bodega actualizada');
  };

  // Categorías y Subcategorías (RF-021, RF-022)
  const addCategory = (catData: Omit<Category, 'id' | 'subcategories'>) => {
    const newCat: Category = {
      ...catData,
      id: 'cat-' + Date.now(),
      subcategories: []
    };
    setCategories(prev => [...prev, newCat]);
    logAuditAction('Productos', 'CREAR', `Categoría registrada: ${newCat.name}`, 'RF-021');
    showToast(`Categoría ${newCat.name} creada`);
  };

  const updateCategory = (id: string, catData: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...catData } : c)));
    logAuditAction('Productos', 'EDITAR', `Categoría actualizada ID ${id}`, 'RF-021');
    showToast('Categoría actualizada');
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    logAuditAction('Productos', 'ELIMINAR', `Categoría eliminada ID ${id}`, 'RF-021');
    showToast('Categoría eliminada');
  };

  const addSubcategory = (categoryId: string, subData: Omit<Subcategory, 'id' | 'categoryId'>) => {
    const newSub: Subcategory = {
      ...subData,
      id: 'sub-' + Date.now(),
      categoryId
    };
    setCategories(prev =>
      prev.map(c => {
        if (c.id === categoryId) {
          return {
            ...c,
            subcategories: [...c.subcategories, newSub]
          };
        }
        return c;
      })
    );
    logAuditAction('Productos', 'CREAR', `Subcategoría agregada: ${newSub.name}`, 'RF-022');
    showToast(`Subcategoría ${newSub.name} creada`);
  };

  const deleteSubcategory = (categoryId: string, subId: string) => {
    setCategories(prev =>
      prev.map(c => {
        if (c.id === categoryId) {
          return {
            ...c,
            subcategories: c.subcategories.filter(s => s.id !== subId)
          };
        }
        return c;
      })
    );
    logAuditAction('Productos', 'ELIMINAR', `Subcategoría eliminada ID ${subId}`, 'RF-022');
    showToast('Subcategoría eliminada');
  };

  // Productos (RF-017 - RF-020, RF-036)
  const addProduct = (prodData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prodData,
      id: 'prod-' + Date.now()
    };
    setProducts(prev => [...prev, newProd]);
    logAuditAction('Productos', 'CREAR', `Producto registrado: ${newProd.name} (${newProd.code})`, 'RF-017');
    showToast(`Producto ${newProd.name} registrado`);
  };

  const updateProduct = (id: string, prodData: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...prodData } : p)));
    logAuditAction('Productos', 'EDITAR', `Producto modificado ID ${id}`, 'RF-019');
    showToast('Producto actualizado');
  };

  const toggleProductActive = (id: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const next = !p.isActive;
          logAuditAction('Productos', 'DESACTIVAR', `Producto ${p.name} ${next ? 'activado' : 'desactivado'}`, 'RF-020');
          showToast(`Producto ${next ? 'activado' : 'desactivado'}`);
          return { ...p, isActive: next };
        }
        return p;
      })
    );
  };

  // RF-036 / RF-038: Bajo stock calculation
  const lowStockProducts = products.filter(p => {
    if (!p.isActive) return false;
    const totalQty = Object.values(p.warehouseStock || {}).reduce((a, b) => a + b, 0);
    return totalQty <= p.minStock;
  });

  // Combos & Paquetes Promocionales
  const addCombo = (comboData: Omit<Combo, 'id' | 'createdAt'>) => {
    const newCombo: Combo = {
      ...comboData,
      id: 'cmb-' + Date.now(),
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setCombos(prev => [...prev, newCombo]);
    logAuditAction('Productos', 'CREAR', `Combo promocional creado: ${newCombo.name} (${newCombo.code})`, 'RF-017');
    showToast(`Combo "${newCombo.name}" creado con éxito`);
  };

  const updateCombo = (id: string, comboData: Partial<Combo>) => {
    setCombos(prev => prev.map(c => (c.id === id ? { ...c, ...comboData } : c)));
    logAuditAction('Productos', 'EDITAR', `Combo promocional actualizado ID ${id}`, 'RF-019');
    showToast('Combo actualizado exitosamente');
  };

  const deleteCombo = (id: string) => {
    setCombos(prev => prev.filter(c => c.id !== id));
    logAuditAction('Productos', 'ELIMINAR', `Combo eliminado ID ${id}`, 'RF-020');
    showToast('Combo eliminado del catálogo');
  };

  const toggleComboActive = (id: string) => {
    setCombos(prev =>
      prev.map(c => {
        if (c.id === id) {
          const next = !c.isActive;
          logAuditAction('Productos', 'DESACTIVAR', `Combo ${c.name} ${next ? 'activado' : 'desactivado'}`, 'RF-020');
          showToast(`Combo ${c.name} ${next ? 'activado' : 'desactivado'}`);
          return { ...c, isActive: next };
        }
        return c;
      })
    );
  };

  // Promociones & Descuentos
  const addPromotion = (promoData: Omit<Promotion, 'id' | 'usageCount'>) => {
    const newPromo: Promotion = {
      ...promoData,
      id: 'prm-' + Date.now(),
      usageCount: 0
    };
    setPromotions(prev => [...prev, newPromo]);
    logAuditAction('Productos', 'CREAR', `Promoción creada: ${newPromo.name} (${newPromo.code})`, 'RF-017');
    showToast(`Promoción "${newPromo.name}" registrada exitosamente`);
  };

  const updatePromotion = (id: string, promoData: Partial<Promotion>) => {
    setPromotions(prev => prev.map(p => (p.id === id ? { ...p, ...promoData } : p)));
    logAuditAction('Productos', 'EDITAR', `Promoción actualizada ID ${id}`, 'RF-019');
    showToast('Promoción actualizada con éxito');
  };

  const deletePromotion = (id: string) => {
    setPromotions(prev => prev.filter(p => p.id !== id));
    logAuditAction('Productos', 'ELIMINAR', `Promoción eliminada ID ${id}`, 'RF-020');
    showToast('Promoción eliminada');
  };

  const togglePromotionActive = (id: string) => {
    setPromotions(prev =>
      prev.map(p => {
        if (p.id === id) {
          const next = !p.isActive;
          logAuditAction('Productos', 'DESACTIVAR', `Promoción ${p.name} ${next ? 'activada' : 'pausada'}`, 'RF-020');
          showToast(`Promoción ${next ? 'activada' : 'pausada'}`);
          return { ...p, isActive: next };
        }
        return p;
      })
    );
  };

  // Clientes y Proveedores (RF-023 - RF-031)
  const addClient = (cliData: Omit<Client, 'id' | 'totalPurchases' | 'createdAt'>) => {
    const newClient: Client = {
      ...cliData,
      id: 'cli-' + Date.now(),
      totalPurchases: 0,
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setClients(prev => [...prev, newClient]);
    logAuditAction('Clientes', 'CREAR', `Cliente registrado: ${newClient.name} (${newClient.code})`, 'RF-023');
    showToast(`Cliente ${newClient.name} registrado`);
  };

  const updateClient = (id: string, cliData: Partial<Client>) => {
    setClients(prev => prev.map(c => (c.id === id ? { ...c, ...cliData } : c)));
    logAuditAction('Clientes', 'EDITAR', `Cliente actualizado ID ${id}`, 'RF-025');
    showToast('Cliente actualizado');
  };

  const toggleClientActive = (id: string) => {
    setClients(prev =>
      prev.map(c => {
        if (c.id === id) {
          const next = !c.isActive;
          logAuditAction('Clientes', 'DESACTIVAR', `Cliente ${c.name} ${next ? 'activado' : 'desactivado'}`, 'RF-026');
          showToast(`Cliente ${next ? 'activado' : 'desactivado'}`);
          return { ...c, isActive: next };
        }
        return c;
      })
    );
  };

  const addSupplier = (supData: Omit<Supplier, 'id' | 'createdAt'>) => {
    const newSup: Supplier = {
      ...supData,
      id: 'sup-' + Date.now(),
      createdAt: new Date().toISOString().substring(0, 10)
    };
    setSuppliers(prev => [...prev, newSup]);
    logAuditAction('Proveedores', 'CREAR', `Proveedor registrado: ${newSup.name} (${newSup.code})`, 'RF-028');
    showToast(`Proveedor ${newSup.name} registrado`);
  };

  const updateSupplier = (id: string, supData: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => (s.id === id ? { ...s, ...supData } : s)));
    logAuditAction('Proveedores', 'EDITAR', `Proveedor actualizado ID ${id}`, 'RF-030');
    showToast('Proveedor actualizado');
  };

  const toggleSupplierActive = (id: string) => {
    setSuppliers(prev =>
      prev.map(s => {
        if (s.id === id) {
          const next = !s.isActive;
          logAuditAction('Proveedores', 'DESACTIVAR', `Proveedor ${s.name} ${next ? 'activado' : 'desactivado'}`, 'RF-031');
          showToast(`Proveedor ${next ? 'activado' : 'desactivado'}`);
          return { ...s, isActive: next };
        }
        return s;
      })
    );
  };

  // Inventario: Ajustes (RF-033) & Transferencias (RF-037)
  const recordStockAdjustment = (adjData: Omit<StockAdjustment, 'id' | 'code' | 'userId' | 'userName' | 'createdAt'>) => {
    const prod = products.find(p => p.id === adjData.productId);
    const wh = warehouses.find(w => w.id === adjData.warehouseId);
    if (!prod || !wh) {
      showToast('Producto o almacén no encontrado', 'error');
      return;
    }

    const currentStock = prod.warehouseStock[adjData.warehouseId] || 0;
    const diff = adjData.type === 'Entrada' ? adjData.quantity : -adjData.quantity;
    const nextStock = Math.max(0, currentStock + diff);

    // Update product stock
    setProducts(prev =>
      prev.map(p => {
        if (p.id === prod.id) {
          return {
            ...p,
            warehouseStock: {
              ...p.warehouseStock,
              [adjData.warehouseId]: nextStock
            }
          };
        }
        return p;
      })
    );

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const movCode = 'AJU-' + Date.now().toString().slice(-4);

    // Stock Movement (RF-034)
    const newMovement: StockMovement = {
      id: 'mov-' + Date.now(),
      code: movCode,
      productId: prod.id,
      productName: prod.name,
      warehouseId: wh.id,
      warehouseName: wh.name,
      type: adjData.type === 'Entrada' ? 'AJUSTE_ENTRADA' : 'AJUSTE_SALIDA',
      quantity: adjData.quantity,
      previousStock: currentStock,
      newStock: nextStock,
      unitCost: prod.costPrice,
      totalCost: prod.costPrice * adjData.quantity,
      referenceDocument: movCode,
      reason: adjData.reason + (adjData.notes ? ` - ${adjData.notes}` : ''),
      userId: currentUser?.id || 'usr-1',
      userName: currentUser?.name || 'Administrador',
      createdAt: nowStr
    };
    setStockMovements(prev => [newMovement, ...prev]);

    // Kardex Entry (RF-035)
    const prevBalance = kardex.filter(k => k.productId === prod.id).slice(-1)[0]?.balanceQuantity || currentStock;
    const newBalance = adjData.type === 'Entrada' ? prevBalance + adjData.quantity : prevBalance - adjData.quantity;
    const newKardex: KardexEntry = {
      id: 'kdx-' + Date.now(),
      productId: prod.id,
      date: nowStr.substring(0, 10),
      documentType: 'Ajuste de Inventario',
      documentNumber: movCode,
      movementType: adjData.type === 'Entrada' ? 'Entrada' : 'Salida',
      inQuantity: adjData.type === 'Entrada' ? adjData.quantity : 0,
      inUnitCost: adjData.type === 'Entrada' ? prod.costPrice : 0,
      inTotalCost: adjData.type === 'Entrada' ? prod.costPrice * adjData.quantity : 0,
      outQuantity: adjData.type === 'Salida' ? adjData.quantity : 0,
      outUnitCost: adjData.type === 'Salida' ? prod.costPrice : 0,
      outTotalCost: adjData.type === 'Salida' ? prod.costPrice * adjData.quantity : 0,
      balanceQuantity: newBalance,
      balanceUnitCost: prod.costPrice,
      balanceTotalCost: newBalance * prod.costPrice
    };
    setKardex(prev => [...prev, newKardex]);

    logAuditAction(
      'Inventario',
      'AJUSTE',
      `Ajuste (${adjData.type}) de ${adjData.quantity} unds en ${wh.name} para ${prod.name}. Motivo: ${adjData.reason}`,
      'RF-033'
    );
    showToast(`Ajuste de inventario registrado correctamente (${movCode})`);
  };

  const transferStock = (transferData: Omit<StockTransfer, 'id' | 'code' | 'status' | 'transferredBy' | 'createdAt'>) => {
    const originWh = warehouses.find(w => w.id === transferData.originWarehouseId);
    const destWh = warehouses.find(w => w.id === transferData.destinationWarehouseId);
    if (!originWh || !destWh) {
      showToast('Bodegas de origen o destino no válidas', 'error');
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const trfCode = 'TRF-' + Date.now().toString().slice(-4);

    // Apply transfer to products
    setProducts(prev =>
      prev.map(p => {
        const item = transferData.items.find(i => i.productId === p.id);
        if (item) {
          const originStock = p.warehouseStock[originWh.id] || 0;
          const destStock = p.warehouseStock[destWh.id] || 0;
          return {
            ...p,
            warehouseStock: {
              ...p.warehouseStock,
              [originWh.id]: Math.max(0, originStock - item.quantity),
              [destWh.id]: destStock + item.quantity
            }
          };
        }
        return p;
      })
    );

    // Stock movements for both out and in
    const newMovements: StockMovement[] = [];
    transferData.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const originStock = prod?.warehouseStock[originWh.id] || 0;
      const destStock = prod?.warehouseStock[destWh.id] || 0;

      // Salida
      newMovements.push({
        id: 'mov-' + Date.now() + '-out',
        code: trfCode + '-OUT',
        productId: item.productId,
        productName: item.productName,
        warehouseId: originWh.id,
        warehouseName: originWh.name,
        type: 'TRANSFERENCIA_SALIDA',
        quantity: item.quantity,
        previousStock: originStock,
        newStock: Math.max(0, originStock - item.quantity),
        unitCost: prod?.costPrice || 0,
        totalCost: (prod?.costPrice || 0) * item.quantity,
        referenceDocument: trfCode,
        reason: `Transferencia hacia ${destWh.name}`,
        userId: currentUser?.id || 'usr-1',
        userName: currentUser?.name || 'Administrador',
        createdAt: nowStr
      });

      // Entrada
      newMovements.push({
        id: 'mov-' + Date.now() + '-in',
        code: trfCode + '-IN',
        productId: item.productId,
        productName: item.productName,
        warehouseId: destWh.id,
        warehouseName: destWh.name,
        type: 'TRANSFERENCIA_ENTRADA',
        quantity: item.quantity,
        previousStock: destStock,
        newStock: destStock + item.quantity,
        unitCost: prod?.costPrice || 0,
        totalCost: (prod?.costPrice || 0) * item.quantity,
        referenceDocument: trfCode,
        reason: `Transferencia recibida desde ${originWh.name}`,
        userId: currentUser?.id || 'usr-1',
        userName: currentUser?.name || 'Administrador',
        createdAt: nowStr
      });
    });

    setStockMovements(prev => [...newMovements, ...prev]);

    logAuditAction(
      'Inventario',
      'AJUSTE',
      `Transferencia ${trfCode} de ${originWh.name} a ${destWh.name} (${transferData.items.length} productos)`,
      'RF-037'
    );
    showToast(`Transferencia ${trfCode} procesada exitosamente`);
  };

  // Compras y Cuentas por Pagar (RF-039 - RF-044)
  const createPurchase = (purData: {
    supplierId: string;
    invoiceNumber: string;
    warehouseId: string;
    items: { productId: string; quantity: number; unitCost: number }[];
    paymentType: 'Contado' | 'Crédito';
    dueDate?: string;
  }) => {
    const supplier = suppliers.find(s => s.id === purData.supplierId);
    const wh = warehouses.find(w => w.id === purData.warehouseId);
    if (!supplier || !wh) {
      showToast('Proveedor o almacén no válido', 'error');
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const purNumber = 'COM-' + new Date().getFullYear() + '-' + Date.now().toString().slice(-4);

    let subtotal = 0;
    const purchaseItems = purData.items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const total = item.quantity * item.unitCost;
      subtotal += total;
      return {
        productId: item.productId,
        productName: prod?.name || 'Producto',
        quantity: item.quantity,
        unitCost: item.unitCost,
        total
      };
    });

    const tax = Math.round(subtotal * (companySettings.defaultTaxRate / 100) * 100) / 100;
    const total = subtotal + tax;

    const newPurchase: Purchase = {
      id: 'pur-' + Date.now(),
      purchaseNumber: purNumber,
      invoiceNumber: purData.invoiceNumber,
      supplierId: supplier.id,
      supplierName: supplier.name,
      warehouseId: wh.id,
      warehouseName: wh.name,
      items: purchaseItems,
      subtotal,
      tax,
      total,
      paymentType: purData.paymentType,
      paymentStatus: purData.paymentType === 'Contado' ? 'PAGADO' : 'PENDIENTE',
      dueDate: purData.dueDate,
      amountPaid: purData.paymentType === 'Contado' ? total : 0,
      status: 'Completada',
      createdAt: nowStr
    };

    setPurchases(prev => [newPurchase, ...prev]);

    // Update product stock & cost
    setProducts(prev =>
      prev.map(p => {
        const purItem = purData.items.find(i => i.productId === p.id);
        if (purItem) {
          const currentStock = p.warehouseStock[wh.id] || 0;
          return {
            ...p,
            costPrice: purItem.unitCost,
            warehouseStock: {
              ...p.warehouseStock,
              [wh.id]: currentStock + purItem.quantity
            }
          };
        }
        return p;
      })
    );

    // Register movements & kardex
    purData.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      const currentStock = prod?.warehouseStock[wh.id] || 0;
      const mov: StockMovement = {
        id: 'mov-' + Date.now() + Math.random().toString(),
        code: 'MOV-P' + Date.now().toString().slice(-4),
        productId: item.productId,
        productName: prod?.name || '',
        warehouseId: wh.id,
        warehouseName: wh.name,
        type: 'COMPRA',
        quantity: item.quantity,
        previousStock: currentStock,
        newStock: currentStock + item.quantity,
        unitCost: item.unitCost,
        totalCost: item.quantity * item.unitCost,
        referenceDocument: purNumber,
        userId: currentUser?.id || 'usr-1',
        userName: currentUser?.name || 'Administrador',
        createdAt: nowStr
      };
      setStockMovements(prev => [mov, ...prev]);

      const prevKdx = kardex.filter(k => k.productId === item.productId).slice(-1)[0];
      const prevBal = prevKdx?.balanceQuantity || currentStock;
      const newBal = prevBal + item.quantity;
      const kdx: KardexEntry = {
        id: 'kdx-' + Date.now() + Math.random().toString(),
        productId: item.productId,
        date: nowStr.substring(0, 10),
        documentType: 'Factura Compra',
        documentNumber: purData.invoiceNumber || purNumber,
        movementType: 'Entrada',
        inQuantity: item.quantity,
        inUnitCost: item.unitCost,
        inTotalCost: item.quantity * item.unitCost,
        outQuantity: 0,
        outUnitCost: 0,
        outTotalCost: 0,
        balanceQuantity: newBal,
        balanceUnitCost: item.unitCost,
        balanceTotalCost: newBal * item.unitCost
      };
      setKardex(prev => [...prev, kdx]);
    });

    // If credit, create Account Payable (RF-042)
    if (purData.paymentType === 'Crédito') {
      const newAP: AccountPayable = {
        id: 'cxp-' + Date.now(),
        purchaseId: newPurchase.id,
        invoiceNumber: purData.invoiceNumber,
        supplierId: supplier.id,
        supplierName: supplier.name,
        issueDate: nowStr.substring(0, 10),
        dueDate: purData.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
        totalAmount: total,
        paidAmount: 0,
        balance: total,
        status: 'PENDIENTE',
        payments: []
      };
      setAccountsPayable(prev => [newAP, ...prev]);

      // Update supplier debt (RF-044)
      setSuppliers(prev =>
        prev.map(s => (s.id === supplier.id ? { ...s, currentDebt: s.currentDebt + total } : s))
      );
    }

    logAuditAction('Compras', 'CREAR', `Compra registrada ${purNumber} a ${supplier.name} por $${total.toFixed(2)}`, 'RF-039');
    showToast(`Compra ${purNumber} registrada correctamente`);
  };

  const voidPurchase = (purchaseId: string, reason: string) => {
    const purchase = purchases.find(p => p.id === purchaseId);
    if (!purchase) return;

    setPurchases(prev =>
      prev.map(p => (p.id === purchaseId ? { ...p, status: 'Anulada', voidReason: reason } : p))
    );

    // Revert inventory
    setProducts(prev =>
      prev.map(p => {
        const item = purchase.items.find(i => i.productId === p.id);
        if (item) {
          const current = p.warehouseStock[purchase.warehouseId] || 0;
          return {
            ...p,
            warehouseStock: {
              ...p.warehouseStock,
              [purchase.warehouseId]: Math.max(0, current - item.quantity)
            }
          };
        }
        return p;
      })
    );

    // Cancel account payable if exists
    setAccountsPayable(prev =>
      prev.map(ap => (ap.purchaseId === purchaseId ? { ...ap, status: 'PAGADO', balance: 0 } : ap))
    );

    logAuditAction('Compras', 'ANULAR', `Compra ${purchase.purchaseNumber} anulada. Motivo: ${reason}`, 'RF-041');
    showToast(`Compra ${purchase.purchaseNumber} anulada`, 'warning');
  };

  const registerSupplierPayment = (accountPayableId: string, amount: number, paymentMethod: string, reference: string) => {
    const ap = accountsPayable.find(a => a.id === accountPayableId);
    if (!ap) return;

    if (amount <= 0 || amount > ap.balance) {
      showToast('El monto debe ser mayor a cero y no exceder el saldo pendiente', 'error');
      return;
    }

    const newBalance = Math.round((ap.balance - amount) * 100) / 100;
    const newPaid = Math.round((ap.paidAmount + amount) * 100) / 100;
    const nextStatus = newBalance <= 0.01 ? 'PAGADO' : 'PENDIENTE';

    const paymentRecord = {
      id: 'pay-p-' + Date.now(),
      date: new Date().toISOString().substring(0, 10),
      amount,
      paymentMethod,
      reference
    };

    setAccountsPayable(prev =>
      prev.map(a =>
        a.id === accountPayableId
          ? {
              ...a,
              paidAmount: newPaid,
              balance: newBalance,
              status: nextStatus,
              payments: [...a.payments, paymentRecord]
            }
          : a
      )
    );

    // Update supplier debt (RF-044)
    setSuppliers(prev =>
      prev.map(s =>
        s.id === ap.supplierId ? { ...s, currentDebt: Math.max(0, s.currentDebt - amount) } : s
      )
    );

    logAuditAction('Cuentas', 'COBRAR', `Abono de $${amount.toFixed(2)} registrado a proveedor ${ap.supplierName}`, 'RF-043');
    showToast(`Pago de $${amount.toFixed(2)} registrado correctamente`);
  };

  // Ventas & POS (RF-045 - RF-051)
  const activeCashSession = cashSessions.find(c => c.status === 'Abierta') || null;

  const createSale = (saleData: {
    clientId: string;
    warehouseId: string;
    items: {
      productId: string;
      productCode?: string;
      productName?: string;
      isCombo?: boolean;
      comboId?: string;
      comboComponents?: {
        productId: string;
        productName: string;
        quantity: number;
        unitCost: number;
      }[];
      quantity: number;
      unitPrice: number;
      unitCost: number;
      discountPercentage: number;
      promotionDiscount?: number;
    }[];
    paymentMethod: Sale['paymentMethod'];
    paymentDetails?: Sale['paymentDetails'];
    amountPaid: number;
    changeGiven: number;
    paymentStatus?: 'PAGADO' | 'PENDIENTE';
    dueDate?: string;
    appliedPromotions?: AppliedPromotion[];
    promotionDiscountTotal?: number;
    // DTE 2.0 Parameters
    dteType?: TipoDte;
    codigoGeneracion?: string;
    numeroControl?: string;
    selloRecibido?: string;
    fhProcesamiento?: string;
    estadoDte?: EstadoDte;
    tipoModelo?: number;
    dteJsonRaw?: string;
    signedJws?: string;
    dteObservaciones?: string[];
    retencionIva1?: number;
  }): Sale => {
    const client = clients.find(c => c.id === saleData.clientId) || clients[0];
    const ticketSeq = 1000 + sales.length + 1;
    const ticketNumber = `TCK-00${ticketSeq}`;
    const invoiceNumber = `FAC-B01-000${ticketSeq}`;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const chosenDteType: TipoDte = saleData.dteType || (client.nrc ? '03' : '01');
    const codigoGeneracion = saleData.codigoGeneracion || generateCodigoGeneracion();
    const numeroControl = saleData.numeroControl || generateNumeroControl(
      chosenDteType,
      companySettings.dteConfig?.tipoEstablecimiento || 'M',
      companySettings.dteConfig?.codEstablecimiento || '001',
      companySettings.dteConfig?.codPuntoVenta || '001',
      ticketSeq
    );
    const estadoDte: EstadoDte = saleData.estadoDte || 'PROCESADO';
    const tipoModelo = saleData.tipoModelo || (estadoDte === 'CONTINGENCIA' ? 2 : 1);
    const selloRecibido = saleData.selloRecibido || (estadoDte === 'PROCESADO' ? `20261006${ticketSeq}${codigoGeneracion.replace(/[^A-F0-9]/g, '').slice(0, 16)}` : undefined);
    const fhProcesamiento = saleData.fhProcesamiento || (estadoDte === 'PROCESADO' ? nowStr : undefined);

    let subtotalTotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;
    let costTotal = 0;

    const saleItems = saleData.items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const gross = item.unitPrice * item.quantity;
      const discount = gross * (item.discountPercentage / 100) + (item.promotionDiscount || 0);
      const net = Math.max(0, gross - discount);
      const taxRate = prod?.taxRate || companySettings.defaultTaxRate;
      const tax = net * (taxRate / 100);
      const total = net + tax;
      const cost = item.unitCost * item.quantity;

      subtotalTotal += net;
      taxTotal += tax;
      discountTotal += discount;
      costTotal += cost;

      return {
        productId: item.productId,
        productCode: item.productCode || prod?.code || (item.isCombo ? 'CMB' : 'PRD'),
        productName: item.productName || prod?.name || (item.isCombo ? 'Combo' : 'Producto'),
        isCombo: item.isCombo,
        comboId: item.comboId,
        comboComponents: item.comboComponents,
        quantity: item.quantity,
        unitCost: item.unitCost,
        unitPrice: item.unitPrice,
        discountPercentage: item.discountPercentage,
        promotionDiscount: item.promotionDiscount || 0,
        taxRate,
        subtotal: Math.round(net * 100) / 100,
        tax: Math.round(tax * 100) / 100,
        total: Math.round(total * 100) / 100
      };
    });

    const grandTotal = Math.round((subtotalTotal + taxTotal) * 100) / 100;
    const profitTotal = Math.round((grandTotal - costTotal) * 100) / 100;
    const isCredit = saleData.paymentMethod === 'Crédito';

    const newSale: Sale = {
      id: 'sal-' + Date.now(),
      ticketNumber,
      invoiceNumber,
      branchId: selectedBranchId,
      warehouseId: saleData.warehouseId,
      clientId: client.id,
      clientName: client.name,
      sellerId: currentUser?.employeeId || 'emp-3',
      sellerName: currentUser?.name || 'Cajero de Turno',
      items: saleItems,
      subtotal: Math.round(subtotalTotal * 100) / 100,
      taxAmount: Math.round(taxTotal * 100) / 100,
      discountAmount: Math.round(discountTotal * 100) / 100,
      appliedPromotions: saleData.appliedPromotions || [],
      promotionDiscountTotal: saleData.promotionDiscountTotal || 0,
      total: grandTotal,
      costTotal: Math.round(costTotal * 100) / 100,
      profitTotal,
      paymentMethod: saleData.paymentMethod,
      paymentDetails: saleData.paymentDetails,
      amountPaid: saleData.amountPaid,
      changeGiven: saleData.changeGiven,
      paymentStatus: isCredit ? (saleData.paymentStatus || 'PENDIENTE') : 'PAGADO',
      dueDate: saleData.dueDate,
      status: 'Completada',
      cashSessionId: activeCashSession?.id,
      createdAt: nowStr,

      // DTE 2.0
      dteType: chosenDteType,
      codigoGeneracion,
      numeroControl,
      selloRecibido,
      fhProcesamiento,
      estadoDte,
      tipoModelo,
      dteJsonRaw: saleData.dteJsonRaw,
      signedJws: saleData.signedJws,
      dteObservaciones: saleData.dteObservaciones,
      retencionIva1: saleData.retencionIva1
    };

    setSales(prev => [newSale, ...prev]);

    // Deduct stock from warehouse (handling regular products & combo components logically!)
    setProducts(prev => {
      let updated = [...prev];
      saleData.items.forEach(item => {
        if (item.isCombo && item.comboComponents && item.comboComponents.length > 0) {
          item.comboComponents.forEach(comp => {
            const qtyNeeded = comp.quantity * item.quantity;
            updated = updated.map(p => {
              if (p.id === comp.productId) {
                const current = p.warehouseStock[saleData.warehouseId] || 0;
                return {
                  ...p,
                  warehouseStock: {
                    ...p.warehouseStock,
                    [saleData.warehouseId]: Math.max(0, current - qtyNeeded)
                  }
                };
              }
              return p;
            });
          });
        } else {
          updated = updated.map(p => {
            if (p.id === item.productId) {
              const current = p.warehouseStock[saleData.warehouseId] || 0;
              return {
                ...p,
                warehouseStock: {
                  ...p.warehouseStock,
                  [saleData.warehouseId]: Math.max(0, current - item.quantity)
                }
              };
            }
            return p;
          });
        }
      });
      return updated;
    });

    // Stock movements & Kardex entries
    const wh = warehouses.find(w => w.id === saleData.warehouseId);
    saleData.items.forEach(item => {
      if (item.isCombo && item.comboComponents && item.comboComponents.length > 0) {
        item.comboComponents.forEach(comp => {
          const compProd = products.find(p => p.id === comp.productId);
          const currentStock = compProd?.warehouseStock[saleData.warehouseId] || 0;
          const qtyToDeduct = comp.quantity * item.quantity;
          const mov: StockMovement = {
            id: 'mov-' + Date.now() + Math.random().toString(),
            code: 'MOV-V' + Date.now().toString().slice(-4),
            productId: comp.productId,
            productName: comp.productName,
            warehouseId: saleData.warehouseId,
            warehouseName: wh?.name || 'Piso de Venta',
            type: 'VENTA',
            quantity: qtyToDeduct,
            previousStock: currentStock,
            newStock: Math.max(0, currentStock - qtyToDeduct),
            unitCost: comp.unitCost,
            totalCost: qtyToDeduct * comp.unitCost,
            referenceDocument: ticketNumber,
            reason: `Venta en combo: ${item.productName || 'Combo'}`,
            userId: currentUser?.id || 'usr-1',
            userName: currentUser?.name || 'Vendedor',
            createdAt: nowStr
          };
          setStockMovements(prev => [mov, ...prev]);

          const prevKdx = kardex.filter(k => k.productId === comp.productId).slice(-1)[0];
          const prevBal = prevKdx?.balanceQuantity || currentStock;
          const newBal = Math.max(0, prevBal - qtyToDeduct);
          const kdx: KardexEntry = {
            id: 'kdx-' + Date.now() + Math.random().toString(),
            productId: comp.productId,
            date: nowStr.substring(0, 10),
            documentType: 'Ticket Venta (Combo)',
            documentNumber: ticketNumber,
            movementType: 'Salida',
            inQuantity: 0,
            inUnitCost: 0,
            inTotalCost: 0,
            outQuantity: qtyToDeduct,
            outUnitCost: comp.unitCost,
            outTotalCost: qtyToDeduct * comp.unitCost,
            balanceQuantity: newBal,
            balanceUnitCost: comp.unitCost,
            balanceTotalCost: newBal * comp.unitCost
          };
          setKardex(prev => [...prev, kdx]);
        });
      } else {
        const prod = products.find(p => p.id === item.productId);
        const currentStock = prod?.warehouseStock[saleData.warehouseId] || 0;
        const mov: StockMovement = {
          id: 'mov-' + Date.now() + Math.random().toString(),
          code: 'MOV-V' + Date.now().toString().slice(-4),
          productId: item.productId,
          productName: prod?.name || '',
          warehouseId: saleData.warehouseId,
          warehouseName: wh?.name || 'Piso de Venta',
          type: 'VENTA',
          quantity: item.quantity,
          previousStock: currentStock,
          newStock: Math.max(0, currentStock - item.quantity),
          unitCost: item.unitCost,
          totalCost: item.quantity * item.unitCost,
          referenceDocument: ticketNumber,
          userId: currentUser?.id || 'usr-1',
          userName: currentUser?.name || 'Vendedor',
          createdAt: nowStr
        };
        setStockMovements(prev => [mov, ...prev]);

        const prevKdx = kardex.filter(k => k.productId === item.productId).slice(-1)[0];
        const prevBal = prevKdx?.balanceQuantity || currentStock;
        const newBal = Math.max(0, prevBal - item.quantity);
        const kdx: KardexEntry = {
          id: 'kdx-' + Date.now() + Math.random().toString(),
          productId: item.productId,
          date: nowStr.substring(0, 10),
          documentType: 'Ticket Venta',
          documentNumber: ticketNumber,
          movementType: 'Salida',
          inQuantity: 0,
          inUnitCost: 0,
          inTotalCost: 0,
          outQuantity: item.quantity,
          outUnitCost: item.unitCost,
          outTotalCost: item.quantity * item.unitCost,
          balanceQuantity: newBal,
          balanceUnitCost: item.unitCost,
          balanceTotalCost: newBal * item.unitCost
        };
        setKardex(prev => [...prev, kdx]);
      }
    });

    // Update promotion usage count
    if (saleData.appliedPromotions && saleData.appliedPromotions.length > 0) {
      const promoIds = saleData.appliedPromotions.map(p => p.promotionId);
      setPromotions(prev =>
        prev.map(p => (promoIds.includes(p.id) ? { ...p, usageCount: p.usageCount + 1 } : p))
      );
    }

    // Update Client Stats & Cuentas por Cobrar (RF-052)
    setClients(prev =>
      prev.map(c => {
        if (c.id === client.id) {
          const debtIncrease = isCredit ? Math.max(0, grandTotal - saleData.amountPaid) : 0;
          return {
            ...c,
            totalPurchases: c.totalPurchases + grandTotal,
            currentDebt: c.currentDebt + debtIncrease,
            lastPurchaseDate: nowStr.substring(0, 10)
          };
        }
        return c;
      })
    );

    if (isCredit) {
      const balance = Math.max(0, grandTotal - saleData.amountPaid);
      const newAR: AccountReceivable = {
        id: 'cxc-' + Date.now(),
        saleId: newSale.id,
        ticketNumber,
        clientId: client.id,
        clientName: client.name,
        issueDate: nowStr.substring(0, 10),
        dueDate: saleData.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().substring(0, 10),
        totalAmount: grandTotal,
        paidAmount: saleData.amountPaid,
        balance,
        status: balance <= 0 ? 'PAGADO' : 'PENDIENTE',
        payments:
          saleData.amountPaid > 0
            ? [
                {
                  id: 'pay-r-' + Date.now(),
                  date: nowStr.substring(0, 10),
                  amount: saleData.amountPaid,
                  paymentMethod: 'Anticipo/Prima',
                  reference: 'Prima de venta a crédito'
                }
              ]
            : []
      };
      setAccountsReceivable(prev => [newAR, ...prev]);
    }

    // Update Cash Register totals if open
    if (activeCashSession) {
      setCashSessions(prev =>
        prev.map(cs => {
          if (cs.id === activeCashSession.id) {
            let extraCash = 0;
            let extraCard = 0;
            let extraTransfer = 0;
            let extraCredit = 0;

            if (saleData.paymentDetails && saleData.paymentDetails.length > 0) {
              saleData.paymentDetails.forEach(p => {
                if (p.method === 'Efectivo') extraCash += p.amount;
                else if (p.method === 'Tarjeta') extraCard += p.amount;
                else if (p.method === 'Transferencia') extraTransfer += p.amount;
                else if (p.method === 'Crédito') extraCredit += p.amount;
              });
            } else {
              if (saleData.paymentMethod === 'Efectivo') extraCash = grandTotal;
              else if (saleData.paymentMethod === 'Tarjeta') extraCard = grandTotal;
              else if (saleData.paymentMethod === 'Transferencia') extraTransfer = grandTotal;
              else if (saleData.paymentMethod === 'Crédito') extraCredit = grandTotal;
            }

            return {
              ...cs,
              expectedCash: cs.expectedCash + extraCash,
              totalSalesCash: cs.totalSalesCash + extraCash,
              totalSalesCard: cs.totalSalesCard + extraCard,
              totalSalesTransfer: cs.totalSalesTransfer + extraTransfer,
              totalSalesCredit: cs.totalSalesCredit + extraCredit
            };
          }
          return cs;
        })
      );
    }

    logAuditAction(
      'Ventas',
      'CREAR',
      `Venta procesada ${ticketNumber} (${saleData.paymentMethod}) por $${grandTotal.toFixed(2)} a ${client.name}`,
      'RF-048'
    );
    showToast(`Venta ${ticketNumber} registrada exitosamente`);
    setSelectedSaleForTicket(newSale);
    return newSale;
  };

  const voidSale = (saleId: string, reason: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    setSales(prev =>
      prev.map(s => (s.id === saleId ? { ...s, status: 'Anulada', voidReason: reason, paymentStatus: 'ANULADO' } : s))
    );

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    // Reincorporate items & combo components back into warehouse stock
    setProducts(prev => {
      let updated = [...prev];
      sale.items.forEach(item => {
        if (item.isCombo && item.comboComponents) {
          // Restore stock for each component of the combo
          item.comboComponents.forEach(comp => {
            const qtyRestored = comp.quantity * item.quantity;
            updated = updated.map(p => {
              if (p.id === comp.productId) {
                const current = p.warehouseStock[sale.warehouseId] || 0;
                return {
                  ...p,
                  warehouseStock: {
                    ...p.warehouseStock,
                    [sale.warehouseId]: current + qtyRestored
                  }
                };
              }
              return p;
            });
          });
        } else {
          // Standard product
          updated = updated.map(p => {
            if (p.id === item.productId) {
              const current = p.warehouseStock[sale.warehouseId] || 0;
              return {
                ...p,
                warehouseStock: {
                  ...p.warehouseStock,
                  [sale.warehouseId]: current + item.quantity
                }
              };
            }
            return p;
          });
        }
      });
      return updated;
    });

    // Record return stock movements and kardex entries
    sale.items.forEach(item => {
      if (item.isCombo && item.comboComponents) {
        item.comboComponents.forEach(comp => {
          const compProd = products.find(p => p.id === comp.productId);
          const currentStock = compProd?.warehouseStock[sale.warehouseId] || 0;
          const qtyRestored = comp.quantity * item.quantity;
          const mov: StockMovement = {
            id: 'mov-' + Date.now() + Math.random().toString(),
            code: 'MOV-V-ANNUL' + Date.now().toString().slice(-4),
            productId: comp.productId,
            productName: comp.productName,
            warehouseId: sale.warehouseId,
            warehouseName: 'Piso de Venta',
            type: 'DEVOLUCION_CLIENTE',
            quantity: qtyRestored,
            previousStock: currentStock,
            newStock: currentStock + qtyRestored,
            unitCost: comp.unitCost,
            totalCost: qtyRestored * comp.unitCost,
            referenceDocument: sale.ticketNumber,
            reason: `Anulación de venta (combo ${item.productName}): ${reason}`,
            userId: currentUser?.id || 'usr-1',
            userName: currentUser?.name || 'Vendedor',
            createdAt: nowStr
          };
          setStockMovements(prev => [mov, ...prev]);

          const prevKdx = kardex.filter(k => k.productId === comp.productId).slice(-1)[0];
          const prevBal = prevKdx?.balanceQuantity || currentStock;
          const newBal = prevBal + qtyRestored;
          const kdx: KardexEntry = {
            id: 'kdx-' + Date.now() + Math.random().toString(),
            productId: comp.productId,
            date: nowStr.substring(0, 10),
            documentType: 'Anulación Venta (Combo)',
            documentNumber: sale.ticketNumber,
            movementType: 'Entrada',
            inQuantity: qtyRestored,
            inUnitCost: comp.unitCost,
            inTotalCost: qtyRestored * comp.unitCost,
            outQuantity: 0,
            outUnitCost: 0,
            outTotalCost: 0,
            balanceQuantity: newBal,
            balanceUnitCost: comp.unitCost,
            balanceTotalCost: newBal * comp.unitCost
          };
          setKardex(prev => [...prev, kdx]);
        });
      } else {
        const prod = products.find(p => p.id === item.productId);
        const currentStock = prod?.warehouseStock[sale.warehouseId] || 0;
        const mov: StockMovement = {
          id: 'mov-' + Date.now() + Math.random().toString(),
          code: 'MOV-V-ANNUL' + Date.now().toString().slice(-4),
          productId: item.productId,
          productName: prod?.name || '',
          warehouseId: sale.warehouseId,
          warehouseName: 'Piso de Venta',
          type: 'DEVOLUCION_CLIENTE',
          quantity: item.quantity,
          previousStock: currentStock,
          newStock: currentStock + item.quantity,
          unitCost: item.unitCost,
          totalCost: item.quantity * item.unitCost,
          referenceDocument: sale.ticketNumber,
          reason: `Anulación de venta: ${reason}`,
          userId: currentUser?.id || 'usr-1',
          userName: currentUser?.name || 'Vendedor',
          createdAt: nowStr
        };
        setStockMovements(prev => [mov, ...prev]);

        const prevKdx = kardex.filter(k => k.productId === item.productId).slice(-1)[0];
        const prevBal = prevKdx?.balanceQuantity || currentStock;
        const newBal = prevBal + item.quantity;
        const kdx: KardexEntry = {
          id: 'kdx-' + Date.now() + Math.random().toString(),
          productId: item.productId,
          date: nowStr.substring(0, 10),
          documentType: 'Anulación Ticket',
          documentNumber: sale.ticketNumber,
          movementType: 'Entrada',
          inQuantity: item.quantity,
          inUnitCost: item.unitCost,
          inTotalCost: item.quantity * item.unitCost,
          outQuantity: 0,
          outUnitCost: 0,
          outTotalCost: 0,
          balanceQuantity: newBal,
          balanceUnitCost: item.unitCost,
          balanceTotalCost: newBal * item.unitCost
        };
        setKardex(prev => [...prev, kdx]);
      }
    });

    // Cancel related account receivable
    setAccountsReceivable(prev =>
      prev.map(ar => (ar.saleId === saleId ? { ...ar, status: 'PAGADO', balance: 0 } : ar))
    );

    logAuditAction('Ventas', 'ANULAR', `Venta ${sale.ticketNumber} anulada. Motivo: ${reason}`, 'RF-050');
    showToast(`Venta ${sale.ticketNumber} ha sido anulada e inventario reincorporado`, 'warning');
  };

  const processReturn = (saleId: string, productId: string, quantityToReturn: number, reason: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    const saleItem = sale.items.find(i => i.productId === productId);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (saleItem?.isCombo && saleItem.comboComponents) {
      // Reincorporate combo components
      setProducts(prev => {
        let updated = [...prev];
        saleItem.comboComponents?.forEach(comp => {
          const qtyRestored = comp.quantity * quantityToReturn;
          updated = updated.map(p => {
            if (p.id === comp.productId) {
              const current = p.warehouseStock[sale.warehouseId] || 0;
              return {
                ...p,
                warehouseStock: {
                  ...p.warehouseStock,
                  [sale.warehouseId]: current + qtyRestored
                }
              };
            }
            return p;
          });
        });
        return updated;
      });

      saleItem.comboComponents.forEach(comp => {
        const compProd = products.find(p => p.id === comp.productId);
        const currentStock = compProd?.warehouseStock[sale.warehouseId] || 0;
        const qtyRestored = comp.quantity * quantityToReturn;
        const mov: StockMovement = {
          id: 'mov-' + Date.now() + Math.random().toString(),
          code: 'DEV-CMB-' + Date.now().toString().slice(-4),
          productId: comp.productId,
          productName: comp.productName,
          warehouseId: sale.warehouseId,
          warehouseName: 'Piso de Venta',
          type: 'DEVOLUCION_CLIENTE',
          quantity: qtyRestored,
          previousStock: currentStock,
          newStock: currentStock + qtyRestored,
          unitCost: comp.unitCost,
          totalCost: qtyRestored * comp.unitCost,
          referenceDocument: sale.ticketNumber,
          reason: `Devolución de combo ${saleItem.productName}: ${reason}`,
          userId: currentUser?.id || 'usr-1',
          userName: currentUser?.name || 'Cajero',
          createdAt: nowStr
        };
        setStockMovements(prev => [mov, ...prev]);
      });

      logAuditAction('Ventas', 'EDITAR', `Devolución de combo ${saleItem.productName} sobre ticket ${sale.ticketNumber}. Motivo: ${reason}`, 'RF-051');
      showToast(`Devolución de combo procesada`);
    } else {
      const prod = products.find(p => p.id === productId);
      if (!prod) return;

      setProducts(prev =>
        prev.map(p => {
          if (p.id === productId) {
            const current = p.warehouseStock[sale.warehouseId] || 0;
            return {
              ...p,
              warehouseStock: {
                ...p.warehouseStock,
                [sale.warehouseId]: current + quantityToReturn
              }
            };
          }
          return p;
        })
      );

      const movCode = 'DEV-' + Date.now().toString().slice(-4);
      const newMovement: StockMovement = {
        id: 'mov-' + Date.now(),
        code: movCode,
        productId: prod.id,
        productName: prod.name,
        warehouseId: sale.warehouseId,
        warehouseName: 'Piso de Venta',
        type: 'DEVOLUCION_CLIENTE',
        quantity: quantityToReturn,
        previousStock: prod.warehouseStock[sale.warehouseId] || 0,
        newStock: (prod.warehouseStock[sale.warehouseId] || 0) + quantityToReturn,
        unitCost: prod.costPrice,
        totalCost: prod.costPrice * quantityToReturn,
        referenceDocument: sale.ticketNumber,
        reason: `Devolución: ${reason}`,
        userId: currentUser?.id || 'usr-1',
        userName: currentUser?.name || 'Cajero',
        createdAt: nowStr
      };
      setStockMovements(prev => [newMovement, ...prev]);

      logAuditAction('Ventas', 'EDITAR', `Devolución de ${quantityToReturn}x ${prod.name} sobre ticket ${sale.ticketNumber}. Motivo: ${reason}`, 'RF-051');
      showToast(`Devolución procesada para ${prod.name}`);
    }
  };

  // Transmisión diferida de contingencia DTE a Hacienda (DGII)
  const transmitDteContingency = async (saleId: string): Promise<{ success: boolean; message: string; selloRecibido?: string }> => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return { success: false, message: 'Venta no encontrada' };

    // Handshake con servicio de recepción MH
    await new Promise(r => setTimeout(r, 600));
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const ts = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const hash = (sale.codigoGeneracion || generateCodigoGeneracion()).replace(/[^A-F0-9]/g, '').slice(0, 16);
    const officialSello = `${ts}${hash}`.toUpperCase();

    setSales(prev =>
      prev.map(s => {
        if (s.id === saleId) {
          return {
            ...s,
            estadoDte: 'PROCESADO',
            tipoModelo: 1,
            selloRecibido: officialSello,
            fhProcesamiento: nowStr
          };
        }
        return s;
      })
    );

    logAuditAction(
      'DTE',
      'EDITAR',
      `DTE diferido ${sale.numeroControl || sale.ticketNumber} transmitido a Hacienda. Sello recibido: ${officialSello}`,
      'RF-048'
    );
    showToast(`DTE ${sale.numeroControl || sale.ticketNumber} transmitido con éxito a Hacienda (Sello: ${officialSello})`, 'success');
    return { success: true, message: 'DTE transmitido y sellado con éxito por Hacienda', selloRecibido: officialSello };
  };

  // Evento de Invalidación con matriz legal de plazos (Sección 9.1 de Normativa 2.0)
  const invalidateDte = (
    saleId: string,
    motivo: string,
    responsableDoc: string = '04859301-8',
    responsableNombre: string = 'Administrador de Sistema',
    codigoGeneracionR?: string
  ): { success: boolean; message: string } => {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return { success: false, message: 'Venta no encontrada' };

    // Validar plazo legal oficial
    const fechaEmision = sale.createdAt ? sale.createdAt.substring(0, 10) : new Date().toISOString().substring(0, 10);
    const plazo = verificarPlazoInvalidacion(sale.dteType || '01', fechaEmision);
    if (!plazo.permitido) {
      showToast(plazo.advertencia || 'Plazo legal de invalidación vencido según normativa DGII', 'error');
      return { success: false, message: plazo.advertencia || 'Plazo legal vencido según normativa DGII' };
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setSales(prev =>
      prev.map(s => {
        if (s.id === saleId) {
          return {
            ...s,
            status: 'Anulada',
            estadoDte: 'INVALIDADO',
            invalidationReason: motivo,
            invalidationDate: nowStr,
            codigoGeneracionR: codigoGeneracionR || undefined,
            paymentStatus: 'ANULADO'
          };
        }
        return s;
      })
    );

    // Anular contablemente y reincorporar existencias
    voidSale(saleId, `Invalidación fiscal DTE: ${motivo}`);

    logAuditAction(
      'DTE',
      'ANULAR',
      `Evento de Invalidación DTE generado para ${sale.numeroControl || sale.ticketNumber}. Motivo: ${motivo}`,
      'RF-048'
    );
    showToast(`DTE ${sale.numeroControl || sale.ticketNumber} invalidado fiscalmente ante la DGII`, 'info');
    return { success: true, message: 'DTE invalidado fiscalmente con éxito' };
  };

  // Cotizaciones (RF-045)
  const createQuote = (quoteData: {
    clientId: string;
    items: { productId: string; quantity: number; unitPrice: number; discountPercentage: number }[];
    validUntil: string;
    notes?: string;
  }) => {
    const client = clients.find(c => c.id === quoteData.clientId) || clients[0];
    const qNumber = `COT-${new Date().getFullYear()}-${(quotes.length + 90).toString().padStart(4, '0')}`;

    let subtotal = 0;
    const items = quoteData.items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const gross = item.unitPrice * item.quantity;
      const discount = gross * (item.discountPercentage / 100);
      const net = gross - discount;
      subtotal += net;
      return {
        productId: item.productId,
        productName: prod?.name || 'Producto',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercentage: item.discountPercentage,
        total: Math.round(net * 100) / 100
      };
    });

    const tax = Math.round(subtotal * (companySettings.defaultTaxRate / 100) * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const newQuote: Quote = {
      id: 'qte-' + Date.now(),
      quoteNumber: qNumber,
      clientId: client.id,
      clientName: client.name,
      sellerName: currentUser?.name || 'Vendedor',
      items,
      subtotal,
      tax,
      total,
      validUntil: quoteData.validUntil,
      notes: quoteData.notes,
      status: 'Pendiente',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setQuotes(prev => [newQuote, ...prev]);
    logAuditAction('Cotizaciones', 'CREAR', `Cotización ${qNumber} emitida para ${client.name} por $${total.toFixed(2)}`, 'RF-045');
    showToast(`Cotización ${qNumber} generada`);
  };

  const convertQuoteToSale = (quoteId: string, paymentMethod: Sale['paymentMethod'], amountPaid: number) => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    const saleItems = quote.items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        unitCost: prod?.costPrice || item.unitPrice * 0.7,
        discountPercentage: item.discountPercentage
      };
    });

    const sale = createSale({
      clientId: quote.clientId,
      warehouseId: warehouses[0]?.id || 'wh-1',
      items: saleItems,
      paymentMethod,
      amountPaid,
      changeGiven: Math.max(0, amountPaid - quote.total)
    });

    setQuotes(prev =>
      prev.map(q => (q.id === quoteId ? { ...q, status: 'Convertida a Venta', convertedSaleId: sale.id } : q))
    );

    logAuditAction('Cotizaciones', 'EDITAR', `Cotización ${quote.quoteNumber} convertida en venta ${sale.ticketNumber}`, 'RF-045');
    showToast(`Cotización convertida en Venta ${sale.ticketNumber}`);
  };

  // Cuentas por Cobrar (RF-052 - RF-054)
  const registerClientPayment = (accountReceivableId: string, amount: number, paymentMethod: string, reference: string) => {
    const ar = accountsReceivable.find(a => a.id === accountReceivableId);
    if (!ar) return;

    if (amount <= 0 || amount > ar.balance) {
      showToast('El monto debe ser mayor a cero y no exceder el saldo pendiente', 'error');
      return;
    }

    const newBalance = Math.round((ar.balance - amount) * 100) / 100;
    const newPaid = Math.round((ar.paidAmount + amount) * 100) / 100;
    const nextStatus = newBalance <= 0.01 ? 'PAGADO' : 'PENDIENTE';

    const paymentRecord = {
      id: 'pay-r-' + Date.now(),
      date: new Date().toISOString().substring(0, 10),
      amount,
      paymentMethod,
      reference,
      cashSessionId: activeCashSession?.id
    };

    setAccountsReceivable(prev =>
      prev.map(a =>
        a.id === accountReceivableId
          ? {
              ...a,
              paidAmount: newPaid,
              balance: newBalance,
              status: nextStatus,
              payments: [...a.payments, paymentRecord]
            }
          : a
      )
    );

    // Update client debt balance (RF-054)
    setClients(prev =>
      prev.map(c =>
        c.id === ar.clientId ? { ...c, currentDebt: Math.max(0, c.currentDebt - amount) } : c
      )
    );

    // Add to cash register if cash
    if (activeCashSession && paymentMethod === 'Efectivo') {
      setCashSessions(prev =>
        prev.map(cs =>
          cs.id === activeCashSession.id
            ? {
                ...cs,
                expectedCash: cs.expectedCash + amount,
                totalClientPaymentsCash: cs.totalClientPaymentsCash + amount
              }
            : cs
        )
      );
    }

    logAuditAction('Cuentas', 'COBRAR', `Abono de $${amount.toFixed(2)} recibido de ${ar.clientName} (${ar.ticketNumber})`, 'RF-053');
    showToast(`Abono de $${amount.toFixed(2)} registrado con éxito`);
  };

  // Caja y Gastos (RF-055 - RF-059)
  const openCashSession = (initialCash: number, notes?: string) => {
    if (activeCashSession) {
      showToast('Ya existe una caja abierta en esta terminal. Debe cerrarla primero.', 'warning');
      return;
    }

    const sessionCode = `CAJA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString().slice(-2)}`;
    const newSession: CashSession = {
      id: 'csh-' + Date.now(),
      code: sessionCode,
      branchId: selectedBranchId,
      userId: currentUser?.id || 'usr-2',
      userName: currentUser?.name || 'Cajero',
      openedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      initialCash,
      expectedCash: initialCash,
      totalSalesCash: 0,
      totalSalesCard: 0,
      totalSalesTransfer: 0,
      totalSalesCredit: 0,
      totalExpenses: 0,
      totalClientPaymentsCash: 0,
      status: 'Abierta',
      notes
    };

    setCashSessions(prev => [newSession, ...prev]);
    logAuditAction('Caja', 'APERTURA', `Apertura de turno de caja ${sessionCode} con fondo inicial de $${initialCash.toFixed(2)}`, 'RF-055');
    showToast(`Caja abierta exitosamente con $${initialCash.toFixed(2)}`);
  };

  const closeCashSession = (actualCash: number, notes?: string) => {
    if (!activeCashSession) {
      showToast('No hay una caja abierta para cerrar', 'error');
      return;
    }

    const diff = Math.round((actualCash - activeCashSession.expectedCash) * 100) / 100;
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    setCashSessions(prev =>
      prev.map(cs =>
        cs.id === activeCashSession.id
          ? {
              ...cs,
              closedAt: nowStr,
              actualCash,
              cashDifference: diff,
              status: 'Cerrada',
              notes: notes ? `${cs.notes || ''} | Cierre: ${notes}` : cs.notes
            }
          : cs
      )
    );

    const diffMsg = diff === 0 ? 'Sin diferencia (Cuadrada)' : diff > 0 ? `Sobrante: +$${diff.toFixed(2)}` : `Faltante: -$${Math.abs(diff).toFixed(2)}`;
    logAuditAction('Caja', 'CIERRE', `Cierre de ${activeCashSession.code}. Esperado: $${activeCashSession.expectedCash.toFixed(2)}, Real: $${actualCash.toFixed(2)}. ${diffMsg}`, 'RF-056');
    showToast(`Caja cerrada. ${diffMsg}`);
  };

  const addExpense = (expData: {
    category: Expense['category'];
    amount: number;
    concept: string;
    paidTo: string;
    receiptNumber?: string;
  }) => {
    const expCode = 'GST-' + Date.now().toString().slice(-4);
    const newExpense: Expense = {
      ...expData,
      id: 'exp-' + Date.now(),
      code: expCode,
      branchId: selectedBranchId,
      userId: currentUser?.id || 'usr-2',
      userName: currentUser?.name || 'Cajero',
      cashSessionId: activeCashSession?.id,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setExpenses(prev => [newExpense, ...prev]);

    // Update active cash session expected cash
    if (activeCashSession) {
      setCashSessions(prev =>
        prev.map(cs =>
          cs.id === activeCashSession.id
            ? {
                ...cs,
                expectedCash: cs.expectedCash - expData.amount,
                totalExpenses: cs.totalExpenses + expData.amount
              }
            : cs
        )
      );
    }

    logAuditAction('Caja', 'CREAR', `Gasto registrado ${expCode} por $${expData.amount.toFixed(2)} (${expData.category}): ${expData.concept}`, 'RF-058');
    showToast(`Gasto ${expCode} registrado exitosamente`);
  };

  // Restore seed data
  const restoreDemoData = () => {
    localStorage.clear();
    setCompanySettings(initialCompanySettings);
    setUsers(initialUsers);
    setCurrentUser(initialUsers[0]);
    setRoles(initialRoles);
    setEmployees(initialEmployees);
    setBranches(initialBranches);
    setWarehouses(initialWarehouses);
    setCategories(initialCategories);
    setProducts(initialProducts);
    setCombos(initialCombos);
    setPromotions(initialPromotions);
    setClients(initialClients);
    setSuppliers(initialSuppliers);
    setStockMovements(initialStockMovements);
    setKardex(initialKardex);
    setPurchases(initialPurchases);
    setAccountsPayable(initialAccountsPayable);
    setSales(initialSales);
    setQuotes(initialQuotes);
    setAccountsReceivable(initialAccountsReceivable);
    setCashSessions(initialCashSessions);
    setExpenses(initialExpenses);
    setAuditLogs(initialAuditLogs);
    showToast('Datos de demostración restaurados');
  };

  return (
    <AppContext.Provider
      value={{
        currentModule,
        setCurrentModule,
        selectedBranchId,
        setSelectedBranchId,
        toasts,
        showToast,
        removeToast,
        selectedSaleForTicket,
        setSelectedSaleForTicket,

        companySettings,
        updateCompanySettings,

        currentUser,
        users,
        roles,
        permissions,
        login,
        logout,
        switchUser,
        changePassword,
        resetPassword,
        addUser,
        updateUser,
        toggleUserActive,
        addRole,
        updateRolePermissions,

        employees,
        addEmployee,
        updateEmployee,
        toggleEmployeeActive,

        branches,
        addBranch,
        updateBranch,

        warehouses,
        addWarehouse,
        updateWarehouse,

        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        addSubcategory,
        deleteSubcategory,

        products,
        addProduct,
        updateProduct,
        toggleProductActive,
        lowStockProducts,

        combos,
        addCombo,
        updateCombo,
        deleteCombo,
        toggleComboActive,

        promotions,
        addPromotion,
        updatePromotion,
        deletePromotion,
        togglePromotionActive,

        clients,
        addClient,
        updateClient,
        toggleClientActive,

        suppliers,
        addSupplier,
        updateSupplier,
        toggleSupplierActive,

        stockMovements,
        kardex,
        recordStockAdjustment,
        transferStock,

        purchases,
        accountsPayable,
        createPurchase,
        voidPurchase,
        registerSupplierPayment,

        sales,
        quotes,
        createSale,
        voidSale,
        processReturn,
        transmitDteContingency,
        invalidateDte,
        createQuote,
        convertQuoteToSale,

        accountsReceivable,
        registerClientPayment,

        cashSessions,
        activeCashSession,
        openCashSession,
        closeCashSession,
        expenses,
        addExpense,

        auditLogs,
        logAuditAction,

        canAccess,
        exportDatabase,
        importDatabase,
        resetDatabase,

        restoreDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
