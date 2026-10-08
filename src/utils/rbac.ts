import { User, Role, UserRole } from '../types';
import { ActiveModule } from '../context/AppContext';

/**
 * Mapping of system modules to required permission codes and allowed roles
 */
interface ModuleAccessRule {
  requiredPermission?: string;
  allowedRoles?: UserRole[];
  moduleName: string;
}

export const MODULE_ACCESS_MAP: Record<ActiveModule, ModuleAccessRule> = {
  dashboard: {
    moduleName: 'Tablero Principal'
  },

  // Administración (RF-005 a RF-016)
  'admin-employees': {
    requiredPermission: 'ADM_USERS',
    allowedRoles: ['Administrador'],
    moduleName: 'Gestión de Empleados'
  },
  'admin-branches': {
    requiredPermission: 'ADM_BRANCHES',
    allowedRoles: ['Administrador'],
    moduleName: 'Sucursales'
  },
  'admin-warehouses': {
    requiredPermission: 'ADM_BRANCHES',
    allowedRoles: ['Administrador'],
    moduleName: 'Bodegas y Almacenes'
  },
  'admin-roles': {
    requiredPermission: 'ADM_USERS',
    allowedRoles: ['Administrador'],
    moduleName: 'Roles de Sistema'
  },
  'admin-permissions': {
    requiredPermission: 'ADM_USERS',
    allowedRoles: ['Administrador'],
    moduleName: 'Matriz de Permisos'
  },
  'admin-users': {
    requiredPermission: 'ADM_USERS',
    allowedRoles: ['Administrador'],
    moduleName: 'Gestión de Usuarios'
  },

  // Catálogos y Productos (RF-017 a RF-022)
  'products-list': {
    requiredPermission: 'CAT_PRODUCTS',
    allowedRoles: ['Administrador', 'Gerente', 'Bodeguero'],
    moduleName: 'Catálogo de Productos'
  },
  'products-categories': {
    requiredPermission: 'CAT_PRODUCTS',
    allowedRoles: ['Administrador', 'Gerente', 'Bodeguero'],
    moduleName: 'Categorías'
  },
  'products-subcategories': {
    requiredPermission: 'CAT_PRODUCTS',
    allowedRoles: ['Administrador', 'Gerente', 'Bodeguero'],
    moduleName: 'Subcategorías'
  },
  'products-combos': {
    requiredPermission: 'CAT_PRODUCTS',
    allowedRoles: ['Administrador', 'Gerente', 'Bodeguero'],
    moduleName: 'Combos y Paquetes'
  },
  'products-promotions': {
    requiredPermission: 'CAT_PRODUCTS',
    allowedRoles: ['Administrador', 'Gerente'],
    moduleName: 'Promociones y Descuentos'
  },

  // Inventario (RF-034 a RF-040)
  'inventory-stock': {
    requiredPermission: 'INV_MANAGE',
    allowedRoles: ['Administrador', 'Gerente', 'Bodeguero'],
    moduleName: 'Inventario General'
  },
  'inventory-low-stock': {
    requiredPermission: 'INV_MANAGE',
    allowedRoles: ['Administrador', 'Gerente', 'Bodeguero'],
    moduleName: 'Productos con Bajo Stock'
  },
  'inventory-adjustments': {
    requiredPermission: 'INV_MANAGE',
    allowedRoles: ['Administrador', 'Gerente', 'Bodeguero'],
    moduleName: 'Ajustes de Inventario'
  },
  'inventory-movements': {
    requiredPermission: 'INV_MANAGE',
    allowedRoles: ['Administrador', 'Gerente', 'Bodeguero'],
    moduleName: 'Movimientos de Stock'
  },
  'inventory-transfers': {
    requiredPermission: 'INV_MANAGE',
    allowedRoles: ['Administrador', 'Gerente', 'Bodeguero'],
    moduleName: 'Transferencias entre Almacenes'
  },
  'inventory-warehouse-report': {
    requiredPermission: 'INV_MANAGE',
    allowedRoles: ['Administrador', 'Gerente', 'Bodeguero'],
    moduleName: 'Reporte de Bodega'
  },
  'inventory-kardex': {
    requiredPermission: 'INV_MANAGE',
    allowedRoles: ['Administrador', 'Gerente', 'Bodeguero'],
    moduleName: 'Kardex Valorado'
  },

  // Clientes y Proveedores (RF-025 a RF-033, RF-044, RF-055)
  'contacts-clients': {
    requiredPermission: 'CLI_MANAGE',
    allowedRoles: ['Administrador', 'Gerente', 'Cajero', 'Vendedor'],
    moduleName: 'Clientes'
  },
  'contacts-suppliers': {
    requiredPermission: 'SUP_MANAGE',
    allowedRoles: ['Administrador', 'Gerente', 'Bodeguero'],
    moduleName: 'Proveedores'
  },
  'contacts-receivable': {
    requiredPermission: 'CLI_MANAGE',
    allowedRoles: ['Administrador', 'Gerente', 'Cajero'],
    moduleName: 'Cuentas por Cobrar'
  },
  'contacts-payable': {
    requiredPermission: 'SUP_MANAGE',
    allowedRoles: ['Administrador', 'Gerente'],
    moduleName: 'Cuentas por Pagar'
  },

  // Compras (RF-041 a RF-046)
  'purchases-new': {
    requiredPermission: 'PUR_MANAGE',
    allowedRoles: ['Administrador', 'Gerente', 'Bodeguero'],
    moduleName: 'Nueva Compra'
  },
  'purchases-list': {
    requiredPermission: 'PUR_MANAGE',
    allowedRoles: ['Administrador', 'Gerente', 'Bodeguero'],
    moduleName: 'Historial de Compras'
  },

  // Ventas (RF-047 a RF-054)
  'pos-new-sale': {
    requiredPermission: 'POS_SELL',
    allowedRoles: ['Administrador', 'Gerente', 'Cajero', 'Vendedor'],
    moduleName: 'Punto de Venta (POS)'
  },
  'sales-quotes': {
    requiredPermission: 'POS_SELL',
    allowedRoles: ['Administrador', 'Gerente', 'Cajero', 'Vendedor'],
    moduleName: 'Cotizaciones'
  },
  'sales-list': {
    requiredPermission: 'POS_SELL',
    allowedRoles: ['Administrador', 'Gerente', 'Cajero'],
    moduleName: 'Ventas Procesadas'
  },
  'sales-dte': {
    requiredPermission: 'POS_SELL',
    allowedRoles: ['Administrador', 'Gerente', 'Cajero'],
    moduleName: 'Facturación DTE Hacienda 2.0'
  },

  // Caja y Gastos (RF-058 a RF-062)
  'cash-open': {
    requiredPermission: 'CASH_MANAGE',
    allowedRoles: ['Administrador', 'Gerente', 'Cajero'],
    moduleName: 'Apertura de Caja'
  },
  'cash-close': {
    requiredPermission: 'CASH_MANAGE',
    allowedRoles: ['Administrador', 'Gerente', 'Cajero'],
    moduleName: 'Cierre de Caja y Arqueo'
  },
  'cash-history': {
    requiredPermission: 'CASH_MANAGE',
    allowedRoles: ['Administrador', 'Gerente'],
    moduleName: 'Historial de Cierres'
  },
  'cash-new-expense': {
    requiredPermission: 'CASH_MANAGE',
    allowedRoles: ['Administrador', 'Gerente', 'Cajero'],
    moduleName: 'Registrar Gasto'
  },
  'cash-expenses-list': {
    requiredPermission: 'CASH_MANAGE',
    allowedRoles: ['Administrador', 'Gerente'],
    moduleName: 'Consultar Gastos'
  },

  // Reportes (RF-064 a RF-070)
  'reports-hub': {
    requiredPermission: 'REP_VIEW',
    allowedRoles: ['Administrador', 'Gerente'],
    moduleName: 'Centro de Reportes'
  },

  // Auditoría & Configuración (RF-016, RF-072)
  'audit-trail': {
    requiredPermission: 'AUD_VIEW',
    allowedRoles: ['Administrador'],
    moduleName: 'Bitácora de Auditoría'
  },
  'settings-general': {
    requiredPermission: 'CFG_MANAGE',
    allowedRoles: ['Administrador'],
    moduleName: 'Configuración del Sistema'
  }
};

/**
 * Checks if a given user has permission to access a specific module
 */
export function canAccessModule(user: User | null, module: ActiveModule, roles: Role[]): boolean {
  if (!user) return false;
  if (!user.isActive) return false;

  // Administrators always have full access
  if (user.role === 'Administrador') return true;

  const rule = MODULE_ACCESS_MAP[module];
  if (!rule) return true; // If no rule, allow

  // Check role whitelist
  if (rule.allowedRoles && rule.allowedRoles.includes(user.role)) {
    return true;
  }

  // Check specific permissions assigned to the user's role
  if (rule.requiredPermission) {
    const userRole = roles.find(r => r.name.toLowerCase().includes(user.role.toLowerCase()));
    if (userRole && userRole.permissions.includes(rule.requiredPermission)) {
      return true;
    }
  }

  return false;
}

/**
 * Returns the default home screen when a user logs in based on their role
 */
export function getDefaultModuleForRole(role: UserRole): ActiveModule {
  switch (role) {
    case 'Cajero':
      return 'pos-new-sale';
    case 'Bodeguero':
      return 'inventory-stock';
    case 'Vendedor':
      return 'pos-new-sale';
    case 'Gerente':
    case 'Administrador':
    default:
      return 'dashboard';
  }
}

/**
 * Visual styling details for each role
 */
export function getRoleBadgeInfo(role: UserRole): {
  label: string;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  description: string;
} {
  switch (role) {
    case 'Administrador':
      return {
        label: 'Administrador',
        badgeBg: 'bg-purple-100',
        badgeText: 'text-purple-800 border-purple-200',
        iconBg: 'bg-purple-600',
        description: 'Acceso total y configuración del sistema'
      };
    case 'Gerente':
      return {
        label: 'Gerente',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-800 border-blue-200',
        iconBg: 'bg-blue-600',
        description: 'Control de ventas, compras, caja y reportes'
      };
    case 'Cajero':
      return {
        label: 'Cajero',
        badgeBg: 'bg-emerald-100',
        badgeText: 'text-emerald-800 border-emerald-200',
        iconBg: 'bg-emerald-600',
        description: 'Punto de venta, cobros, clientes y apertura/cierre de caja'
      };
    case 'Bodeguero':
      return {
        label: 'Encargado de Bodega',
        badgeBg: 'bg-amber-100',
        badgeText: 'text-amber-800 border-amber-200',
        iconBg: 'bg-amber-600',
        description: 'Gestión de existencias, compras, transferencias y kardex'
      };
    case 'Vendedor':
      return {
        label: 'Vendedor',
        badgeBg: 'bg-cyan-100',
        badgeText: 'text-cyan-800 border-cyan-200',
        iconBg: 'bg-cyan-600',
        description: 'Atención al cliente, cotizaciones y pedidos'
      };
    default:
      return {
        label: role,
        badgeBg: 'bg-slate-100',
        badgeText: 'text-slate-800 border-slate-200',
        iconBg: 'bg-slate-600',
        description: 'Usuario del sistema'
      };
  }
}
