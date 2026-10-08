import {
  CompanySettings,
  Role,
  Permission,
  User,
  Employee,
  Branch,
  Warehouse,
  Category,
  Product,
  StockMovement,
  KardexEntry,
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
  Promotion
} from '../types';

export const initialCompanySettings: CompanySettings = {
  name: "Asociación AGAPE de El Salvador",
  tradeName: "AGAPE El Salvador",
  taxId: "0315-170384-001-5",
  phone: "+503 2451-1400",
  email: "asociacionagapedeelsalvador@gmail.com",
  address: "Km. 63 Carretera a San Salvador, Sonsonate",
  city: "Sonsonate Centro",
  country: "El Salvador",
  currencySymbol: "$",
  currencyCode: "USD",
  defaultTaxRate: 13,
  taxName: "IVA",
  ticketHeader: "¡Gracias por apoyar las obras sociales de AGAPE!\nAsociación AGAPE de El Salvador • Amor y Servicio",
  ticketFooter: "Asociación AGAPE de El Salvador • Sonsonate\n¡Que Dios le bendiga por su preferencia y generosidad!",
  printLogo: true,
  lowStockAlertThreshold: 5,
  enableCreditSales: true,
  dteConfig: {
    ambiente: "00", // "00" = Pruebas (TEST), "01" = Producción (PROD)
    nitEmisor: "03151703840015",
    nrcEmisor: "1234567",
    nombreComercial: "AGAPE El Salvador",
    razonSocial: "Asociación AGAPE de El Salvador",
    codActividad: "47110",
    descActividad: "Venta al por menor en comercios no especializados",
    tipoEstablecimiento: "M",
    codEstablecimiento: "001",
    codPuntoVenta: "001",
    departamento: "03",
    municipio: "15",
    direccionComplemento: "Km. 63 Carretera a San Salvador, Sonsonate Centro",
    telefono: "24511400",
    correo: "asociacionagapedeelsalvador@gmail.com",
    firmadorUrl: "http://localhost:8080/firmardocumento/",
    firmadorPasswordPri: "ClaveCertificado2026",
    mhAuthPassword: "MhClaveAcceso2026*",
    modoSimulacion: true
  }
};

export const initialPermissions: Permission[] = [
  { id: 'perm-1', code: 'ACC_USERS', name: 'Gestión de Usuarios', module: 'Seguridad', description: 'Crear, editar y desactivar usuarios del sistema' },
  { id: 'perm-2', code: 'ACC_ROLES', name: 'Gestión de Roles', module: 'Seguridad', description: 'Crear roles y asignar matriz de permisos' },
  { id: 'perm-3', code: 'ADM_EMPLOYEES', name: 'Administrar Empleados', module: 'Administración', description: 'Manejo de nómina de personal y sucursales asignadas' },
  { id: 'perm-4', code: 'ADM_BRANCHES', name: 'Administrar Sucursales y Bodegas', module: 'Administración', description: 'Crear y configurar sucursales y almacenes' },
  { id: 'perm-5', code: 'CAT_PRODUCTS', name: 'Catálogo de Productos', module: 'Productos', description: 'Administrar productos, categorías y precios' },
  { id: 'perm-6', code: 'INV_MANAGE', name: 'Control de Inventario', module: 'Inventario', description: 'Ajustes físicos, transferencias entre bodegas y Kardex' },
  { id: 'perm-7', code: 'PUR_MANAGE', name: 'Gestión de Compras', module: 'Compras', description: 'Registrar compras y pagos a proveedores' },
  { id: 'perm-8', code: 'POS_SELL', name: 'Punto de Venta (POS)', module: 'Ventas', description: 'Efectuar ventas, cotizaciones y emitir tickets' },
  { id: 'perm-9', code: 'POS_VOID', name: 'Anular Ventas', module: 'Ventas', description: 'Permiso especial para anular tickets emitidos' },
  { id: 'perm-10', code: 'CASH_MANAGE', name: 'Arqueo y Cierre de Caja', module: 'Caja', description: 'Apertura de turno, gastos y conciliación de caja' },
  { id: 'perm-11', code: 'CLI_MANAGE', name: 'Clientes y Cuentas por Cobrar', module: 'Clientes', description: 'Cartera de clientes, límites de crédito y abonos' },
  { id: 'perm-12', code: 'REP_VIEW', name: 'Reportes y Analítica', module: 'Reportes', description: 'Consultar reportes ejecutivos, utilidades y exportación' },
  { id: 'perm-13', code: 'AUD_VIEW', name: 'Auditoría de Operaciones', module: 'Auditoría', description: 'Visualizar bitácora inmutable de transacciones' }
];

export const initialRoles: Role[] = [
  {
    id: 'role-admin',
    name: 'Administrador General',
    description: 'Acceso total y sin restricciones a todos los módulos y configuraciones.',
    permissions: initialPermissions.map(p => p.code),
    userCount: 1
  },
  {
    id: 'role-gerente',
    name: 'Gerente de Sucursal',
    description: 'Control de ventas, compras, caja, inventario y reportes operativos.',
    permissions: ['CAT_PRODUCTS', 'INV_MANAGE', 'PUR_MANAGE', 'POS_SELL', 'POS_VOID', 'CASH_MANAGE', 'CLI_MANAGE', 'REP_VIEW'],
    userCount: 1
  },
  {
    id: 'role-cajero',
    name: 'Cajero / Punto de Venta',
    description: 'Operación del punto de venta, apertura/cierre de su caja y cobro a clientes.',
    permissions: ['POS_SELL', 'CASH_MANAGE', 'CLI_MANAGE'],
    userCount: 2
  },
  {
    id: 'role-bodega',
    name: 'Encargado de Bodega',
    description: 'Recepción de compras, transferencias y ajustes de inventario físico.',
    permissions: ['INV_MANAGE', 'CAT_PRODUCTS', 'PUR_MANAGE'],
    userCount: 1
  }
];

export const initialBranches: Branch[] = [
  {
    id: 'br-1',
    code: 'SUC-01',
    name: 'Sucursal Central San Benito',
    address: 'Av. Las Magnolias #402',
    city: 'San Salvador',
    phone: '2244-8899',
    managerName: 'Lic. Roberto Mendoza',
    isMain: true,
    isActive: true
  },
  {
    id: 'br-2',
    code: 'SUC-02',
    name: 'Sucursal Plaza Merliot',
    address: 'Centro Comercial Plaza Merliot, Nivel 2, Local 210',
    city: 'Santa Tecla',
    phone: '2288-7711',
    managerName: 'Ing. Gabriela Carranza',
    isMain: false,
    isActive: true
  }
];

export const initialWarehouses: Warehouse[] = [
  {
    id: 'wh-1',
    code: 'BOD-CENTRAL',
    name: 'Bodega Principal Central',
    branchId: 'br-1',
    type: 'Principal',
    capacityNotes: 'Capacidad alta con estantería pesada y control climatizado',
    isActive: true
  },
  {
    id: 'wh-2',
    code: 'BOD-PVENTA-1',
    name: 'Almacén Piso de Venta Central',
    branchId: 'br-1',
    type: 'Secundaria',
    capacityNotes: 'Stock inmediato para despacho en caja San Benito',
    isActive: true
  },
  {
    id: 'wh-3',
    code: 'BOD-MERLIOT',
    name: 'Bodega Sucursal Merliot',
    branchId: 'br-2',
    type: 'Principal',
    capacityNotes: 'Almacén para tienda Santa Tecla',
    isActive: true
  }
];

export const initialEmployees: Employee[] = [
  {
    id: 'emp-1',
    code: 'EMP-001',
    firstName: 'Alejandro',
    lastName: 'Vargas Peña',
    documentId: '04859302-1',
    email: 'alejandro.vargas@makersolutions.sv',
    phone: '7722-1133',
    position: 'Director General de Operaciones',
    branchId: 'br-1',
    hireDate: '2022-01-15',
    salary: 2400,
    isActive: true
  },
  {
    id: 'emp-2',
    code: 'EMP-002',
    firstName: 'Gabriela',
    lastName: 'Carranza Morales',
    documentId: '05128392-4',
    email: 'gabriela.carranza@makersolutions.sv',
    phone: '7844-5566',
    position: 'Gerente de Sucursal Merliot',
    branchId: 'br-2',
    hireDate: '2023-03-01',
    salary: 1450,
    isActive: true
  },
  {
    id: 'emp-3',
    code: 'EMP-003',
    firstName: 'Carlos',
    lastName: 'Hernández Rivas',
    documentId: '03991204-7',
    email: 'carlos.rivas@makersolutions.sv',
    phone: '7102-3344',
    position: 'Cajero Principal',
    branchId: 'br-1',
    hireDate: '2023-08-10',
    salary: 680,
    isActive: true
  },
  {
    id: 'emp-4',
    code: 'EMP-004',
    firstName: 'Sofía',
    lastName: 'Martínez López',
    documentId: '06229104-9',
    email: 'sofia.martinez@makersolutions.sv',
    phone: '7588-9922',
    position: 'Ejecutiva de Ventas y Cobros',
    branchId: 'br-1',
    hireDate: '2024-02-01',
    salary: 750,
    isActive: true
  },
  {
    id: 'emp-5',
    code: 'EMP-005',
    firstName: 'Mauricio',
    lastName: 'Pérez Torres',
    documentId: '02881944-3',
    email: 'mauricio.perez@makersolutions.sv',
    phone: '7933-4411',
    position: 'Jefe de Logística y Bodega',
    branchId: 'br-1',
    hireDate: '2022-06-20',
    salary: 950,
    isActive: true
  }
];

export const initialUsers: User[] = [
  {
    id: 'usr-1',
    username: 'admin',
    password: 'admin123',
    name: 'Alejandro Vargas',
    email: 'admin@makersolutions.sv',
    role: 'Administrador',
    employeeId: 'emp-1',
    branchId: 'br-1',
    isActive: true,
    lastLogin: '2026-10-02 18:40',
    createdAt: '2022-01-15'
  },
  {
    id: 'usr-2',
    username: 'carlos.cajero',
    password: 'cajero123',
    name: 'Carlos Hernández',
    email: 'carlos.rivas@makersolutions.sv',
    role: 'Cajero',
    employeeId: 'emp-3',
    branchId: 'br-1',
    isActive: true,
    lastLogin: '2026-10-02 14:15',
    createdAt: '2023-08-10'
  },
  {
    id: 'usr-3',
    username: 'gabriela.gerente',
    password: 'gerente123',
    name: 'Gabriela Carranza',
    email: 'gabriela.carranza@makersolutions.sv',
    role: 'Gerente',
    employeeId: 'emp-2',
    branchId: 'br-2',
    isActive: true,
    lastLogin: '2026-10-01 09:20',
    createdAt: '2023-03-01'
  },
  {
    id: 'usr-4',
    username: 'mauricio.bodega',
    password: 'bodega123',
    name: 'Mauricio Pérez',
    email: 'mauricio.perez@makersolutions.sv',
    role: 'Bodeguero',
    employeeId: 'emp-5',
    branchId: 'br-1',
    isActive: true,
    lastLogin: '2026-10-02 08:30',
    createdAt: '2022-06-20'
  }
];

export const initialCategories: Category[] = [
  {
    id: 'cat-1',
    code: 'CAT-COMP',
    name: 'Cómputo y Portátiles',
    description: 'Laptops, computadoras de escritorio y mini PCs',
    subcategories: [
      { id: 'sub-1', categoryId: 'cat-1', code: 'SUB-LAP', name: 'Laptops Corporativas' },
      { id: 'sub-2', categoryId: 'cat-1', code: 'SUB-GAM', name: 'Laptops Gaming' },
      { id: 'sub-3', categoryId: 'cat-1', code: 'SUB-MINI', name: 'Mini PCs y All-in-One' }
    ]
  },
  {
    id: 'cat-2',
    code: 'CAT-ACC',
    name: 'Accesorios y Periféricos',
    description: 'Teclados, ratones, auriculares y cámaras web',
    subcategories: [
      { id: 'sub-4', categoryId: 'cat-2', code: 'SUB-TECL', name: 'Teclados Mecánicos' },
      { id: 'sub-5', categoryId: 'cat-2', code: 'SUB-MOUS', name: 'Mouse Óptico e Inalámbrico' },
      { id: 'sub-6', categoryId: 'cat-2', code: 'SUB-AUDI', name: 'Auriculares y Diademas' }
    ]
  },
  {
    id: 'cat-3',
    code: 'CAT-MON',
    name: 'Monitores y Proyección',
    description: 'Monitores IPS, pantallas curvas y proyectores',
    subcategories: [
      { id: 'sub-7', categoryId: 'cat-3', code: 'SUB-MON24', name: 'Monitores 24" - 27"' },
      { id: 'sub-8', categoryId: 'cat-3', code: 'SUB-MONULT', name: 'Monitores UltraWide 34"+' }
    ]
  },
  {
    id: 'cat-4',
    code: 'CAT-RED',
    name: 'Redes y Conectividad',
    description: 'Routers Wi-Fi 6, switches gigabit y cableado estructurado',
    subcategories: [
      { id: 'sub-9', categoryId: 'cat-4', code: 'SUB-ROUT', name: 'Routers y Puntos de Acceso' },
      { id: 'sub-10', categoryId: 'cat-4', code: 'SUB-CAB', name: 'Cables de Red y Adaptadores' }
    ]
  },
  {
    id: 'cat-5',
    code: 'CAT-ALM',
    name: 'Almacenamiento y Memorias',
    description: 'Discos SSD NVMe, discos duros externos y memorias RAM',
    subcategories: [
      { id: 'sub-11', categoryId: 'cat-5', code: 'SUB-SSD', name: 'Discos de Estado Sólido SSD' },
      { id: 'sub-12', categoryId: 'cat-5', code: 'SUB-RAM', name: 'Módulos RAM DDR4 / DDR5' }
    ]
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    code: 'PRD-001',
    barcode: '750100293811',
    name: 'Laptop Dell Vostro 3520 15.6" i5 16GB 512GB SSD',
    description: 'Pantalla FHD antirreflejo, Procesador Intel Core i5 12va Gen, Windows 11 Pro.',
    categoryId: 'cat-1',
    subcategoryId: 'sub-1',
    brand: 'Dell',
    unit: 'Unidad',
    costPrice: 520.00,
    sellingPrice: 749.00,
    wholesalePrice: 695.00,
    taxRate: 13,
    minStock: 4,
    maxStock: 25,
    isActive: true,
    warehouseStock: {
      'wh-1': 8,
      'wh-2': 3,
      'wh-3': 4
    }
  },
  {
    id: 'prod-2',
    code: 'PRD-002',
    barcode: '750100293812',
    name: 'Laptop ASUS ROG Strix G16 Ryzen 7 16GB RTX 4060',
    description: 'Pantalla 165Hz QHD, teclado RGB aura sync, refrigeración líquida.',
    categoryId: 'cat-1',
    subcategoryId: 'sub-2',
    brand: 'ASUS',
    unit: 'Unidad',
    costPrice: 1100.00,
    sellingPrice: 1549.00,
    wholesalePrice: 1450.00,
    taxRate: 13,
    minStock: 3,
    maxStock: 15,
    isActive: true,
    warehouseStock: {
      'wh-1': 4,
      'wh-2': 1,
      'wh-3': 2
    }
  },
  {
    id: 'prod-3',
    code: 'PRD-003',
    barcode: '750100293813',
    name: 'Monitor LG UltraGear 27" 144Hz IPS 1ms HDR10',
    description: 'Resolución QHD 2560x1440, FreeSync Premium y G-Sync Compatible.',
    categoryId: 'cat-3',
    subcategoryId: 'sub-7',
    brand: 'LG',
    unit: 'Unidad',
    costPrice: 195.00,
    sellingPrice: 289.00,
    wholesalePrice: 265.00,
    taxRate: 13,
    minStock: 5,
    maxStock: 30,
    isActive: true,
    warehouseStock: {
      'wh-1': 12,
      'wh-2': 4,
      'wh-3': 6
    }
  },
  {
    id: 'prod-4',
    code: 'PRD-004',
    barcode: '750100293814',
    name: 'Teclado Mecánico Logitech MX Mechanical Wireless',
    description: 'Interruptores táctiles silenciosos, retroiluminación inteligente, Bluetooth/Bolt.',
    categoryId: 'cat-2',
    subcategoryId: 'sub-4',
    brand: 'Logitech',
    unit: 'Unidad',
    costPrice: 95.00,
    sellingPrice: 149.00,
    wholesalePrice: 135.00,
    taxRate: 13,
    minStock: 5,
    maxStock: 40,
    isActive: true,
    warehouseStock: {
      'wh-1': 15,
      'wh-2': 6,
      'wh-3': 8
    }
  },
  {
    id: 'prod-5',
    code: 'PRD-005',
    barcode: '750100293815',
    name: 'Mouse Ergonómico Logitech MX Master 3S Dark Grey',
    description: 'Sensor 8000 DPI con seguimiento en cristal, clics silenciosos, rueda MagSpeed.',
    categoryId: 'cat-2',
    subcategoryId: 'sub-5',
    brand: 'Logitech',
    unit: 'Unidad',
    costPrice: 65.00,
    sellingPrice: 109.00,
    wholesalePrice: 99.00,
    taxRate: 13,
    minStock: 6,
    maxStock: 50,
    isActive: true,
    // Bajo stock en total para demostrar RF-036
    warehouseStock: {
      'wh-1': 2,
      'wh-2': 1,
      'wh-3': 1
    }
  },
  {
    id: 'prod-6',
    code: 'PRD-006',
    barcode: '750100293816',
    name: 'Disco SSD Kingston NV2 1TB M.2 PCIe 4.0 NVMe',
    description: 'Velocidad de lectura hasta 3,500 MB/s, factor de forma M.2 2280.',
    categoryId: 'cat-5',
    subcategoryId: 'sub-11',
    brand: 'Kingston',
    unit: 'Unidad',
    costPrice: 42.00,
    sellingPrice: 69.90,
    wholesalePrice: 62.00,
    taxRate: 13,
    minStock: 8,
    maxStock: 60,
    isActive: true,
    warehouseStock: {
      'wh-1': 22,
      'wh-2': 10,
      'wh-3': 14
    }
  },
  {
    id: 'prod-7',
    code: 'PRD-007',
    barcode: '750100293817',
    name: 'Router TP-Link Archer AX73 Wi-Fi 6 AX5400',
    description: '6 antenas de alta ganancia, puerto USB 3.0, OneMesh, HomeShield.',
    categoryId: 'cat-4',
    subcategoryId: 'sub-9',
    brand: 'TP-Link',
    unit: 'Unidad',
    costPrice: 85.00,
    sellingPrice: 135.00,
    wholesalePrice: 120.00,
    taxRate: 13,
    minStock: 5,
    maxStock: 25,
    isActive: true,
    // Bajo stock demostrativo
    warehouseStock: {
      'wh-1': 2,
      'wh-2': 1,
      'wh-3': 0
    }
  },
  {
    id: 'prod-8',
    code: 'PRD-008',
    barcode: '750100293818',
    name: 'Memoria RAM Corsair Vengeance RGB Pro 16GB (2x8GB) 3200MHz',
    description: 'DDR4 overclocking de alto rendimiento con difusor de calor de aluminio.',
    categoryId: 'cat-5',
    subcategoryId: 'sub-12',
    brand: 'Corsair',
    unit: 'Kit',
    costPrice: 38.00,
    sellingPrice: 59.00,
    wholesalePrice: 52.00,
    taxRate: 13,
    minStock: 6,
    maxStock: 40,
    isActive: true,
    warehouseStock: {
      'wh-1': 14,
      'wh-2': 5,
      'wh-3': 7
    }
  },
  {
    id: 'prod-9',
    code: 'PRD-009',
    barcode: '750100293819',
    name: 'Diadema Gamer HyperX Cloud II Red 7.1 Surround',
    description: 'Almohadillas viscoelásticas, micrófono desmontable con cancelación de ruido.',
    categoryId: 'cat-2',
    subcategoryId: 'sub-6',
    brand: 'HyperX',
    unit: 'Unidad',
    costPrice: 55.00,
    sellingPrice: 89.90,
    wholesalePrice: 79.00,
    taxRate: 13,
    minStock: 5,
    maxStock: 35,
    isActive: true,
    warehouseStock: {
      'wh-1': 9,
      'wh-2': 4,
      'wh-3': 5
    }
  },
  {
    id: 'prod-10',
    code: 'PRD-010',
    barcode: '750100293820',
    name: 'Cable Ugreen Patch Cord Cat6 UTP 3 Metros Gris',
    description: 'Conectores RJ45 dorados de cobre puro, velocidad de transferencia 1Gbps.',
    categoryId: 'cat-4',
    subcategoryId: 'sub-10',
    brand: 'Ugreen',
    unit: 'Unidad',
    costPrice: 2.20,
    sellingPrice: 5.50,
    wholesalePrice: 4.50,
    taxRate: 13,
    minStock: 15,
    maxStock: 120,
    isActive: true,
    // Bajo stock demostrativo (11 < minStock 15)
    warehouseStock: {
      'wh-1': 5,
      'wh-2': 4,
      'wh-3': 2
    }
  }
];

export const initialClients: Client[] = [
  {
    id: 'cli-1',
    code: 'CLI-001',
    name: 'Corporación Inmobiliaria del Valle S.A. de C.V.',
    taxId: '0614-110285-103-9',
    nrc: '245678-9',
    codActividad: '68100',
    descActividad: 'Actividades inmobiliarias realizadas con bienes propios o arrendados',
    departamento: '06',
    municipio: '14',
    esGranContribuyente: true,
    email: 'compras@inmobiliariavalle.com',
    phone: '2233-4455',
    address: 'Torre Futura, Piso 14, San Salvador',
    category: 'Corporativo',
    creditLimit: 5000.00,
    currentDebt: 1250.00,
    discountPercentage: 5,
    isActive: true,
    totalPurchases: 14280.00,
    lastPurchaseDate: '2026-09-28',
    createdAt: '2023-01-10'
  },
  {
    id: 'cli-2',
    code: 'CLI-002',
    name: 'Desarrollos Digitales & Asociados S.A.S.',
    taxId: '0614-220490-101-2',
    nrc: '189456-3',
    codActividad: '62010',
    descActividad: 'Actividades de desarrollo y programación de software',
    departamento: '06',
    municipio: '14',
    esGranContribuyente: false,
    email: 'contacto@desarrollosdigitales.io',
    phone: '2288-9900',
    address: 'Calle La Mascota #310, Colonia La Mascota',
    category: 'Corporativo',
    creditLimit: 3000.00,
    currentDebt: 0.00,
    discountPercentage: 3,
    isActive: true,
    totalPurchases: 8940.00,
    lastPurchaseDate: '2026-09-15',
    createdAt: '2023-04-12'
  },
  {
    id: 'cli-3',
    code: 'CLI-003',
    name: 'Mario Ernesto Gutiérrez Flores',
    taxId: '04859301-8',
    nrc: undefined,
    codActividad: '47110',
    descActividad: 'Comercio menor',
    departamento: '05',
    municipio: '11',
    esGranContribuyente: false,
    email: 'mario.gutierrez@gmail.com',
    phone: '7922-4411',
    address: 'Residencial Santa Rosa, Senda 4, Casa #12',
    category: 'Minorista',
    creditLimit: 500.00,
    currentDebt: 180.00,
    discountPercentage: 0,
    isActive: true,
    totalPurchases: 2150.00,
    lastPurchaseDate: '2026-09-22',
    createdAt: '2023-11-05'
  },
  {
    id: 'cli-4',
    code: 'CLI-004',
    name: 'TecnoReparaciones & Servicios El Salvador S.A.',
    taxId: '0614-050688-102-5',
    nrc: '984321-7',
    codActividad: '95110',
    descActividad: 'Reparación de ordenadores y equipos periféricos',
    departamento: '06',
    municipio: '14',
    esGranContribuyente: false,
    email: 'taller@tecnoreparaciones.sv',
    phone: '2299-1234',
    address: 'Av. España #450, Centro Histórico',
    category: 'Mayorista',
    creditLimit: 2500.00,
    currentDebt: 450.00,
    discountPercentage: 8,
    isActive: true,
    totalPurchases: 18600.00,
    lastPurchaseDate: '2026-10-01',
    createdAt: '2022-09-18'
  },
  {
    id: 'cli-5',
    code: 'CLI-005',
    name: 'Consumidor Final (Ventas de Mostrador)',
    taxId: '00000000-0',
    nrc: undefined,
    departamento: '06',
    municipio: '14',
    email: 'mostrador@makersolutions.sv',
    phone: '2244-8899',
    address: 'En tienda',
    category: 'Minorista',
    creditLimit: 0,
    currentDebt: 0,
    discountPercentage: 0,
    isActive: true,
    totalPurchases: 32400.00,
    lastPurchaseDate: '2026-10-02',
    createdAt: '2022-01-01'
  }
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    code: 'PROV-001',
    name: 'Mayoristas Tecnológicos de C.A. S.A.',
    contactName: 'Lic. Fernando Castillo',
    taxId: '0614-150378-101-8',
    email: 'ventas@maytec-ca.com',
    phone: '2211-3322',
    address: 'Zona Franca San Bartolo, Nave #14',
    creditDays: 30,
    currentDebt: 3450.00,
    isActive: true,
    category: 'Cómputo y Portátiles',
    createdAt: '2022-01-10'
  },
  {
    id: 'sup-2',
    code: 'PROV-002',
    name: 'Distribuidora Global de Periféricos & Redes',
    contactName: 'Ing. Patricia Solís',
    taxId: '0614-290984-102-6',
    email: 'ordenes@globalperifericos.com',
    phone: '2255-7766',
    address: 'Boulevard del Ejército Km 4.5',
    creditDays: 45,
    currentDebt: 1200.00,
    isActive: true,
    category: 'Accesorios y Redes',
    createdAt: '2022-05-15'
  },
  {
    id: 'sup-3',
    code: 'PROV-003',
    name: 'Importaciones Electrónicas del Pacífico',
    contactName: 'Sr. Rodrigo Almendares',
    taxId: '0614-040792-104-1',
    email: 'ralmendares@iepacifico.com',
    phone: '2277-8899',
    address: 'Colonia Escalón, Calle El Mirador #120',
    creditDays: 15,
    currentDebt: 0.00,
    isActive: true,
    category: 'Almacenamiento y Memorias',
    createdAt: '2023-02-20'
  }
];

export const initialCashSessions: CashSession[] = [
  {
    id: 'csh-001',
    code: 'CAJA-20261002-01',
    branchId: 'br-1',
    userId: 'usr-2',
    userName: 'Carlos Hernández',
    openedAt: '2026-10-02 08:00',
    initialCash: 150.00,
    expectedCash: 894.50,
    actualCash: undefined,
    cashDifference: undefined,
    totalSalesCash: 644.50,
    totalSalesCard: 450.00,
    totalSalesTransfer: 289.00,
    totalSalesCredit: 0.00,
    totalExpenses: 45.00,
    totalClientPaymentsCash: 145.00,
    status: 'Abierta',
    notes: 'Turno matutino y vespertino abierto con fondo inicial reglamentario'
  },
  {
    id: 'csh-000',
    code: 'CAJA-20261001-01',
    branchId: 'br-1',
    userId: 'usr-2',
    userName: 'Carlos Hernández',
    openedAt: '2026-10-01 08:00',
    closedAt: '2026-10-01 18:30',
    initialCash: 150.00,
    expectedCash: 980.00,
    actualCash: 980.00,
    cashDifference: 0.00,
    totalSalesCash: 850.00,
    totalSalesCard: 620.00,
    totalSalesTransfer: 135.00,
    totalSalesCredit: 250.00,
    totalExpenses: 20.00,
    totalClientPaymentsCash: 0.00,
    status: 'Cerrada',
    notes: 'Arqueo cuadrado sin diferencias reportadas'
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp-1',
    code: 'GST-001',
    branchId: 'br-1',
    category: 'Suministros',
    amount: 25.00,
    concept: 'Compra de rollos de papel térmico para impresoras POS y cinta adhesiva',
    paidTo: 'Librería & Papelería Central',
    receiptNumber: 'FAC-8891',
    userId: 'usr-2',
    userName: 'Carlos Hernández',
    cashSessionId: 'csh-001',
    createdAt: '2026-10-02 10:15'
  },
  {
    id: 'exp-2',
    code: 'GST-002',
    branchId: 'br-1',
    category: 'Transporte',
    amount: 20.00,
    concept: 'Flete de mensajería exprés para entrega de cotización urgente a cliente corporativo',
    paidTo: 'Mensajería Rápida SV',
    receiptNumber: 'ENV-1290',
    userId: 'usr-2',
    userName: 'Carlos Hernández',
    cashSessionId: 'csh-001',
    createdAt: '2026-10-02 12:40'
  },
  {
    id: 'exp-3',
    code: 'GST-000',
    branchId: 'br-1',
    category: 'Mantenimiento',
    amount: 20.00,
    concept: 'Recarga de gas refrigerante para aire acondicionado área de exhibición',
    paidTo: 'Climas & Servicios S.A.',
    receiptNumber: 'CCF-4412',
    userId: 'usr-2',
    userName: 'Carlos Hernández',
    cashSessionId: 'csh-000',
    createdAt: '2026-10-01 14:00'
  }
];

export const initialSales: Sale[] = [
  {
    id: 'sal-contingencia-1',
    ticketNumber: 'TCK-001004',
    invoiceNumber: 'FAC-B01-0001004',
    branchId: 'br-1',
    warehouseId: 'wh-2',
    clientId: 'cli-5',
    clientName: 'Consumidor Final',
    sellerId: 'emp-3',
    sellerName: 'Alejandro Vargas',
    items: [
      {
        productId: 'prod-4',
        productCode: 'PRD-004',
        productName: 'Teclado Mecánico Logitech MX Mechanical Wireless',
        quantity: 1,
        unitCost: 95.00,
        unitPrice: 149.00,
        discountPercentage: 0,
        taxRate: 13,
        subtotal: 131.86,
        tax: 17.14,
        total: 149.00
      }
    ],
    subtotal: 131.86,
    taxAmount: 17.14,
    discountAmount: 0.00,
    total: 149.00,
    costTotal: 95.00,
    profitTotal: 54.00,
    paymentMethod: 'Efectivo',
    paymentDetails: [
      { method: 'Efectivo', amount: 149.00, percentage: 100, amountReceived: 150.00, changeGiven: 1.00 }
    ],
    amountPaid: 150.00,
    changeGiven: 1.00,
    paymentStatus: 'PAGADO',
    status: 'Completada',
    cashSessionId: 'csh-001',
    createdAt: '2026-10-07 15:08:23',
    dteType: '01',
    codigoGeneracion: 'F7F9DFCC-BF4C-405F-B065-1DB9FCAE0711',
    numeroControl: 'DTE-01-M001P001-000000000001004',
    selloRecibido: undefined, // PENDIENTE (CONTINGENCIA)
    fhProcesamiento: undefined,
    estadoDte: 'CONTINGENCIA',
    tipoModelo: 2
  },
  {
    id: 'sal-1',
    ticketNumber: 'TCK-001041',
    invoiceNumber: 'FAC-B01-0001041',
    branchId: 'br-1',
    warehouseId: 'wh-2',
    clientId: 'cli-5',
    clientName: 'Consumidor Final (Ventas de Mostrador)',
    sellerId: 'emp-3',
    sellerName: 'Carlos Hernández Rivas',
    items: [
      {
        productId: 'prod-4',
        productCode: 'PRD-004',
        productName: 'Teclado Mecánico Logitech MX Mechanical Wireless',
        quantity: 1,
        unitCost: 95.00,
        unitPrice: 149.00,
        discountPercentage: 0,
        taxRate: 13,
        subtotal: 131.86,
        tax: 17.14,
        total: 149.00
      },
      {
        productId: 'prod-5',
        productCode: 'PRD-005',
        productName: 'Mouse Ergonómico Logitech MX Master 3S Dark Grey',
        quantity: 1,
        unitCost: 65.00,
        unitPrice: 109.00,
        discountPercentage: 0,
        taxRate: 13,
        subtotal: 96.46,
        tax: 12.54,
        total: 109.00
      }
    ],
    subtotal: 228.32,
    taxAmount: 29.68,
    discountAmount: 0.00,
    total: 258.00,
    costTotal: 160.00,
    profitTotal: 98.00,
    paymentMethod: 'Efectivo',
    amountPaid: 300.00,
    changeGiven: 42.00,
    paymentStatus: 'PAGADO',
    status: 'Completada',
    cashSessionId: 'csh-001',
    createdAt: '2026-10-02 09:12',
    dteType: '01',
    codigoGeneracion: '4A8B9C10-D2E3-4F56-A789-0123456789AB',
    numeroControl: 'DTE-01-M001P001-000000000001041',
    selloRecibido: '202610020912154A8B9C10D2E34F56',
    fhProcesamiento: '2026-10-02 09:12:15',
    estadoDte: 'PROCESADO',
    tipoModelo: 1
  },
  {
    id: 'sal-2',
    ticketNumber: 'TCK-001042',
    invoiceNumber: 'FAC-B01-0001042',
    branchId: 'br-1',
    warehouseId: 'wh-2',
    clientId: 'cli-1',
    clientName: 'Corporación Inmobiliaria del Valle S.A. de C.V.',
    sellerId: 'emp-4',
    sellerName: 'Sofía Martínez López',
    items: [
      {
        productId: 'prod-1',
        productCode: 'PRD-001',
        productName: 'Laptop Dell Vostro 3520 15.6" i5 16GB 512GB SSD',
        quantity: 2,
        unitCost: 520.00,
        unitPrice: 749.00,
        discountPercentage: 5,
        taxRate: 13,
        subtotal: 1259.38,
        tax: 163.72,
        total: 1423.10
      }
    ],
    subtotal: 1259.38,
    taxAmount: 163.72,
    discountAmount: 74.90,
    total: 1423.10,
    costTotal: 1040.00,
    profitTotal: 383.10,
    paymentMethod: 'Crédito',
    amountPaid: 173.10,
    changeGiven: 0.00,
    paymentStatus: 'PENDIENTE',
    dueDate: '2026-10-31',
    status: 'Completada',
    cashSessionId: 'csh-001',
    createdAt: '2026-10-02 11:30',
    dteType: '03',
    codigoGeneracion: '9F8E7D6C-5B4A-4321-9FED-CBA987654321',
    numeroControl: 'DTE-03-M001P001-000000000001042',
    selloRecibido: '202610021130229F8E7D6C5B4A4321',
    fhProcesamiento: '2026-10-02 11:30:22',
    estadoDte: 'PROCESADO',
    tipoModelo: 1
  },
  {
    id: 'sal-3',
    ticketNumber: 'TCK-001043',
    invoiceNumber: 'FAC-B01-0001043',
    branchId: 'br-1',
    warehouseId: 'wh-2',
    clientId: 'cli-3',
    clientName: 'Mario Ernesto Gutiérrez Flores',
    sellerId: 'emp-3',
    sellerName: 'Carlos Hernández Rivas',
    items: [
      {
        productId: 'prod-3',
        productCode: 'PRD-003',
        productName: 'Monitor LG UltraGear 27" 144Hz IPS 1ms HDR10',
        quantity: 1,
        unitCost: 195.00,
        unitPrice: 289.00,
        discountPercentage: 0,
        taxRate: 13,
        subtotal: 255.75,
        tax: 33.25,
        total: 289.00
      }
    ],
    subtotal: 255.75,
    taxAmount: 33.25,
    discountAmount: 0.00,
    total: 289.00,
    costTotal: 195.00,
    profitTotal: 94.00,
    paymentMethod: 'Transferencia',
    amountPaid: 289.00,
    changeGiven: 0.00,
    paymentStatus: 'PAGADO',
    status: 'Completada',
    cashSessionId: 'csh-001',
    createdAt: '2026-10-02 14:45'
  }
];

export const initialQuotes: Quote[] = [
  {
    id: 'qte-1',
    quoteNumber: 'COT-2026-0089',
    clientId: 'cli-2',
    clientName: 'Desarrollos Digitales & Asociados S.A.S.',
    sellerName: 'Sofía Martínez López',
    items: [
      {
        productId: 'prod-1',
        productName: 'Laptop Dell Vostro 3520 15.6" i5 16GB 512GB SSD',
        quantity: 3,
        unitPrice: 749.00,
        discountPercentage: 5,
        total: 2134.65
      },
      {
        productId: 'prod-3',
        productName: 'Monitor LG UltraGear 27" 144Hz IPS 1ms HDR10',
        quantity: 3,
        unitPrice: 289.00,
        discountPercentage: 5,
        total: 823.65
      }
    ],
    subtotal: 2617.96,
    tax: 340.34,
    total: 2958.30,
    validUntil: '2026-10-15',
    notes: 'Cotización con precio corporativo y entrega a domicilio gratuita.',
    status: 'Pendiente',
    createdAt: '2026-10-01 16:20'
  },
  {
    id: 'qte-2',
    quoteNumber: 'COT-2026-0090',
    clientId: 'cli-4',
    clientName: 'TecnoReparaciones & Servicios El Salvador',
    sellerName: 'Carlos Hernández Rivas',
    items: [
      {
        productId: 'prod-6',
        productName: 'Disco SSD Kingston NV2 1TB M.2 PCIe 4.0 NVMe',
        quantity: 10,
        unitPrice: 62.00,
        discountPercentage: 8,
        total: 570.40
      },
      {
        productId: 'prod-8',
        productName: 'Memoria RAM Corsair Vengeance RGB Pro 16GB (2x8GB) 3200MHz',
        quantity: 8,
        unitPrice: 52.00,
        discountPercentage: 8,
        total: 382.72
      }
    ],
    subtotal: 843.47,
    tax: 109.65,
    total: 953.12,
    validUntil: '2026-10-10',
    notes: 'Tarifa mayorista para taller técnico.',
    status: 'Pendiente',
    createdAt: '2026-10-02 11:00'
  }
];

export const initialPurchases: Purchase[] = [
  {
    id: 'pur-1',
    purchaseNumber: 'COM-2026-0042',
    invoiceNumber: 'FAC-MAY-9921',
    supplierId: 'sup-1',
    supplierName: 'Mayoristas Tecnológicos de C.A. S.A.',
    warehouseId: 'wh-1',
    warehouseName: 'Bodega Principal Central',
    items: [
      {
        productId: 'prod-1',
        productName: 'Laptop Dell Vostro 3520 15.6" i5 16GB 512GB SSD',
        quantity: 5,
        unitCost: 520.00,
        total: 2600.00
      },
      {
        productId: 'prod-3',
        productName: 'Monitor LG UltraGear 27" 144Hz IPS 1ms HDR10',
        quantity: 6,
        unitCost: 195.00,
        total: 1170.00
      }
    ],
    subtotal: 3336.28,
    tax: 433.72,
    total: 3770.00,
    paymentType: 'Crédito',
    paymentStatus: 'PENDIENTE',
    dueDate: '2026-10-25',
    amountPaid: 320.00,
    status: 'Completada',
    createdAt: '2026-09-25 10:30'
  },
  {
    id: 'pur-2',
    purchaseNumber: 'COM-2026-0043',
    invoiceNumber: 'FAC-GLO-1430',
    supplierId: 'sup-2',
    supplierName: 'Distribuidora Global de Periféricos & Redes',
    warehouseId: 'wh-1',
    warehouseName: 'Bodega Principal Central',
    items: [
      {
        productId: 'prod-4',
        productName: 'Teclado Mecánico Logitech MX Mechanical Wireless',
        quantity: 10,
        unitCost: 95.00,
        total: 950.00
      },
      {
        productId: 'prod-5',
        productName: 'Mouse Ergonómico Logitech MX Master 3S Dark Grey',
        quantity: 5,
        unitCost: 65.00,
        total: 325.00
      }
    ],
    subtotal: 1128.32,
    tax: 146.68,
    total: 1275.00,
    paymentType: 'Contado',
    paymentStatus: 'PAGADO',
    amountPaid: 1275.00,
    status: 'Completada',
    createdAt: '2026-09-28 14:15'
  }
];

export const initialAccountsReceivable: AccountReceivable[] = [
  {
    id: 'cxc-1',
    saleId: 'sal-2',
    ticketNumber: 'TCK-001042',
    clientId: 'cli-1',
    clientName: 'Corporación Inmobiliaria del Valle S.A.',
    issueDate: '2026-10-02',
    dueDate: '2026-10-31',
    totalAmount: 1423.10,
    paidAmount: 173.10,
    balance: 1250.00,
    status: 'PENDIENTE',
    payments: [
      {
        id: 'pay-r-1',
        date: '2026-10-02',
        amount: 173.10,
        paymentMethod: 'Transferencia',
        reference: 'Anticipo inicial 12% orden de compra'
      }
    ]
  },
  {
    id: 'cxc-2',
    saleId: 'sal-old-1',
    ticketNumber: 'TCK-000985',
    clientId: 'cli-3',
    clientName: 'Mario Ernesto Gutiérrez Flores',
    issueDate: '2026-09-10',
    dueDate: '2026-09-25',
    totalAmount: 380.00,
    paidAmount: 200.00,
    balance: 180.00,
    status: 'VENCIDO',
    payments: [
      {
        id: 'pay-r-2',
        date: '2026-09-10',
        amount: 200.00,
        paymentMethod: 'Efectivo',
        reference: 'Prima de compra'
      }
    ]
  },
  {
    id: 'cxc-3',
    saleId: 'sal-old-2',
    ticketNumber: 'TCK-001012',
    clientId: 'cli-4',
    clientName: 'TecnoReparaciones & Servicios El Salvador',
    issueDate: '2026-09-20',
    dueDate: '2026-10-20',
    totalAmount: 950.00,
    paidAmount: 500.00,
    balance: 450.00,
    status: 'PENDIENTE',
    payments: [
      {
        id: 'pay-r-3',
        date: '2026-09-25',
        amount: 500.00,
        paymentMethod: 'Transferencia',
        reference: 'Abono factura semanal'
      }
    ]
  }
];

export const initialAccountsPayable: AccountPayable[] = [
  {
    id: 'cxp-1',
    purchaseId: 'pur-1',
    invoiceNumber: 'FAC-MAY-9921',
    supplierId: 'sup-1',
    supplierName: 'Mayoristas Tecnológicos de C.A. S.A.',
    issueDate: '2026-09-25',
    dueDate: '2026-10-25',
    totalAmount: 3770.00,
    paidAmount: 320.00,
    balance: 3450.00,
    status: 'PENDIENTE',
    payments: [
      {
        id: 'pay-p-1',
        date: '2026-09-25',
        amount: 320.00,
        paymentMethod: 'Transferencia',
        reference: 'Pago anticipado flete y seguro'
      }
    ]
  },
  {
    id: 'cxp-2',
    purchaseId: 'pur-old-1',
    invoiceNumber: 'FAC-GLO-0899',
    supplierId: 'sup-2',
    supplierName: 'Distribuidora Global de Periféricos & Redes',
    issueDate: '2026-08-30',
    dueDate: '2026-10-15',
    totalAmount: 2400.00,
    paidAmount: 1200.00,
    balance: 1200.00,
    status: 'PENDIENTE',
    payments: [
      {
        id: 'pay-p-2',
        date: '2026-09-15',
        amount: 1200.00,
        paymentMethod: 'Cheque',
        reference: 'Abono 50% según crédito pactado'
      }
    ]
  }
];

export const initialStockMovements: StockMovement[] = [
  {
    id: 'mov-1',
    code: 'MOV-0081',
    productId: 'prod-1',
    productName: 'Laptop Dell Vostro 3520 15.6" i5 16GB 512GB SSD',
    warehouseId: 'wh-1',
    warehouseName: 'Bodega Principal Central',
    type: 'COMPRA',
    quantity: 5,
    previousStock: 3,
    newStock: 8,
    unitCost: 520.00,
    totalCost: 2600.00,
    referenceDocument: 'COM-2026-0042',
    userId: 'usr-4',
    userName: 'Mauricio Pérez',
    createdAt: '2026-09-25 10:30'
  },
  {
    id: 'mov-2',
    code: 'MOV-0082',
    productId: 'prod-4',
    productName: 'Teclado Mecánico Logitech MX Mechanical Wireless',
    warehouseId: 'wh-2',
    warehouseName: 'Almacén Piso de Venta Central',
    type: 'VENTA',
    quantity: 1,
    previousStock: 7,
    newStock: 6,
    unitCost: 95.00,
    totalCost: 95.00,
    referenceDocument: 'TCK-001041',
    userId: 'usr-2',
    userName: 'Carlos Hernández',
    createdAt: '2026-10-02 09:12'
  },
  {
    id: 'mov-3',
    code: 'MOV-0083',
    productId: 'prod-5',
    productName: 'Mouse Ergonómico Logitech MX Master 3S Dark Grey',
    warehouseId: 'wh-2',
    warehouseName: 'Almacén Piso de Venta Central',
    type: 'VENTA',
    quantity: 1,
    previousStock: 2,
    newStock: 1,
    unitCost: 65.00,
    totalCost: 65.00,
    referenceDocument: 'TCK-001041',
    userId: 'usr-2',
    userName: 'Carlos Hernández',
    createdAt: '2026-10-02 09:12'
  },
  {
    id: 'mov-4',
    code: 'MOV-0084',
    productId: 'prod-1',
    productName: 'Laptop Dell Vostro 3520 15.6" i5 16GB 512GB SSD',
    warehouseId: 'wh-2',
    warehouseName: 'Almacén Piso de Venta Central',
    type: 'VENTA',
    quantity: 2,
    previousStock: 5,
    newStock: 3,
    unitCost: 520.00,
    totalCost: 1040.00,
    referenceDocument: 'TCK-001042',
    userId: 'usr-2',
    userName: 'Carlos Hernández',
    createdAt: '2026-10-02 11:30'
  },
  {
    id: 'mov-5',
    code: 'MOV-0085',
    productId: 'prod-3',
    productName: 'Monitor LG UltraGear 27" 144Hz IPS 1ms HDR10',
    warehouseId: 'wh-2',
    warehouseName: 'Almacén Piso de Venta Central',
    type: 'VENTA',
    quantity: 1,
    previousStock: 5,
    newStock: 4,
    unitCost: 195.00,
    totalCost: 195.00,
    referenceDocument: 'TCK-001043',
    userId: 'usr-2',
    userName: 'Carlos Hernández',
    createdAt: '2026-10-02 14:45'
  }
];

export const initialKardex: KardexEntry[] = [
  {
    id: 'kdx-1',
    productId: 'prod-1',
    date: '2026-09-01',
    documentType: 'Inventario Inicial',
    documentNumber: 'INV-INI-2026',
    movementType: 'Entrada',
    inQuantity: 10,
    inUnitCost: 520.00,
    inTotalCost: 5200.00,
    outQuantity: 0,
    outUnitCost: 0,
    outTotalCost: 0,
    balanceQuantity: 10,
    balanceUnitCost: 520.00,
    balanceTotalCost: 5200.00
  },
  {
    id: 'kdx-2',
    productId: 'prod-1',
    date: '2026-09-25',
    documentType: 'Factura Compra',
    documentNumber: 'FAC-MAY-9921',
    movementType: 'Entrada',
    inQuantity: 5,
    inUnitCost: 520.00,
    inTotalCost: 2600.00,
    outQuantity: 0,
    outUnitCost: 0,
    outTotalCost: 0,
    balanceQuantity: 15,
    balanceUnitCost: 520.00,
    balanceTotalCost: 7800.00
  },
  {
    id: 'kdx-3',
    productId: 'prod-1',
    date: '2026-10-02',
    documentType: 'Ticket Venta',
    documentNumber: 'TCK-001042',
    movementType: 'Salida',
    inQuantity: 0,
    inUnitCost: 0,
    inTotalCost: 0,
    outQuantity: 2,
    outUnitCost: 520.00,
    outTotalCost: 1040.00,
    balanceQuantity: 13,
    balanceUnitCost: 520.00,
    balanceTotalCost: 6760.00
  },
  {
    id: 'kdx-4',
    productId: 'prod-4',
    date: '2026-09-01',
    documentType: 'Inventario Inicial',
    documentNumber: 'INV-INI-2026',
    movementType: 'Entrada',
    inQuantity: 20,
    inUnitCost: 95.00,
    inTotalCost: 1900.00,
    outQuantity: 0,
    outUnitCost: 0,
    outTotalCost: 0,
    balanceQuantity: 20,
    balanceUnitCost: 95.00,
    balanceTotalCost: 1900.00
  },
  {
    id: 'kdx-5',
    productId: 'prod-4',
    date: '2026-09-28',
    documentType: 'Factura Compra',
    documentNumber: 'FAC-GLO-1430',
    movementType: 'Entrada',
    inQuantity: 10,
    inUnitCost: 95.00,
    inTotalCost: 950.00,
    outQuantity: 0,
    outUnitCost: 0,
    outTotalCost: 0,
    balanceQuantity: 30,
    balanceUnitCost: 95.00,
    balanceTotalCost: 2850.00
  },
  {
    id: 'kdx-6',
    productId: 'prod-4',
    date: '2026-10-02',
    documentType: 'Ticket Venta',
    documentNumber: 'TCK-001041',
    movementType: 'Salida',
    inQuantity: 0,
    inUnitCost: 0,
    inTotalCost: 0,
    outQuantity: 1,
    outUnitCost: 95.00,
    outTotalCost: 95.00,
    balanceQuantity: 29,
    balanceUnitCost: 95.00,
    balanceTotalCost: 2755.00
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'aud-1',
    timestamp: '2026-10-02 08:00:22',
    userId: 'usr-2',
    userName: 'Carlos Hernández',
    module: 'Caja',
    action: 'APERTURA',
    description: 'Apertura de turno en CAJA-20261002-01 con saldo inicial de $150.00',
    requirementCode: 'RF-055',
    ipAddress: '192.168.1.105'
  },
  {
    id: 'aud-2',
    timestamp: '2026-10-02 09:12:45',
    userId: 'usr-2',
    userName: 'Carlos Hernández',
    module: 'Ventas',
    action: 'CREAR',
    description: 'Emisión de venta TCK-001041 a Consumidor Final por $258.00 (Efectivo)',
    requirementCode: 'RF-048',
    ipAddress: '192.168.1.105'
  },
  {
    id: 'aud-3',
    timestamp: '2026-10-02 10:15:10',
    userId: 'usr-2',
    userName: 'Carlos Hernández',
    module: 'Caja',
    action: 'CREAR',
    description: 'Registro de gasto GST-001 por $25.00 por concepto de suministros de papelería',
    requirementCode: 'RF-058',
    ipAddress: '192.168.1.105'
  },
  {
    id: 'aud-4',
    timestamp: '2026-10-02 11:30:18',
    userId: 'usr-2',
    userName: 'Carlos Hernández',
    module: 'Ventas',
    action: 'CREAR',
    description: 'Emisión de venta a crédito TCK-001042 a Corporación Inmobiliaria del Valle por $1,423.10',
    requirementCode: 'RF-048',
    ipAddress: '192.168.1.105'
  },
  {
    id: 'aud-5',
    timestamp: '2026-10-02 11:30:20',
    userId: 'usr-2',
    userName: 'Carlos Hernández',
    module: 'Cuentas',
    action: 'CREAR',
    description: 'Generación automática de Cuenta por Cobrar CXC-1 por saldo pendiente de $1,250.00',
    requirementCode: 'RF-052',
    ipAddress: '192.168.1.105'
  },
  {
    id: 'aud-6',
    timestamp: '2026-10-02 14:45:03',
    userId: 'usr-2',
    userName: 'Carlos Hernández',
    module: 'Ventas',
    action: 'CREAR',
    description: 'Venta TCK-001043 a Mario Gutiérrez Flores por $289.00 (Transferencia bancaria)',
    requirementCode: 'RF-048',
    ipAddress: '192.168.1.105'
  }
];

export const initialCombos: Combo[] = [
  {
    id: 'cmb-1',
    code: 'CMB-001',
    barcode: '750990100001',
    name: 'Combo Home Office Pro (Teclado + Mouse Logitech)',
    description: 'Pack ergonómico premium para productividad. Incluye Teclado MX Mechanical y Mouse MX Master 3S.',
    category: 'Accesorios y Periféricos',
    price: 219.00,
    originalTotal: 258.00,
    discountAmount: 39.00,
    discountPercentage: 15.1,
    isActive: true,
    createdAt: '2026-10-01',
    items: [
      {
        productId: 'prod-4',
        productCode: 'PRD-004',
        productName: 'Teclado Mecánico Logitech MX Mechanical Wireless',
        quantity: 1,
        regularUnitPrice: 149.00,
        unitCost: 95.00
      },
      {
        productId: 'prod-5',
        productCode: 'PRD-005',
        productName: 'Mouse Ergonómico Logitech MX Master 3S Dark Grey',
        quantity: 1,
        regularUnitPrice: 109.00,
        unitCost: 65.00
      }
    ]
  },
  {
    id: 'cmb-2',
    code: 'CMB-002',
    barcode: '750990100002',
    name: 'Pack Estudiante Ejecutivo (Laptop Dell + Mouse MX)',
    description: 'Laptop Dell Vostro 3520 i5 16GB + Mouse Logitech MX Master 3S con precio especial por paquete.',
    category: 'Cómputo y Portátiles',
    price: 769.00,
    originalTotal: 858.00,
    discountAmount: 89.00,
    discountPercentage: 10.4,
    isActive: true,
    createdAt: '2026-10-01',
    items: [
      {
        productId: 'prod-1',
        productCode: 'PRD-001',
        productName: 'Laptop Dell Vostro 3520 15.6" i5 16GB 512GB SSD',
        quantity: 1,
        regularUnitPrice: 749.00,
        unitCost: 520.00
      },
      {
        productId: 'prod-5',
        productCode: 'PRD-005',
        productName: 'Mouse Ergonómico Logitech MX Master 3S Dark Grey',
        quantity: 1,
        regularUnitPrice: 109.00,
        unitCost: 65.00
      }
    ]
  },
  {
    id: 'cmb-3',
    code: 'CMB-003',
    barcode: '750990100003',
    name: 'Combo Red Veloz Wi-Fi 6 (Router + 2 Cables Cat6)',
    description: 'Router TP-Link Archer AX73 de alto rendimiento más 2 cables de red Ugreen Cat6 de 3m.',
    category: 'Redes y Conectividad',
    price: 125.00,
    originalTotal: 146.00,
    discountAmount: 21.00,
    discountPercentage: 14.4,
    isActive: true,
    createdAt: '2026-10-02',
    items: [
      {
        productId: 'prod-7',
        productCode: 'PRD-007',
        productName: 'Router TP-Link Archer AX73 Wi-Fi 6 AX5400',
        quantity: 1,
        regularUnitPrice: 135.00,
        unitCost: 85.00
      },
      {
        productId: 'prod-10',
        productCode: 'PRD-010',
        productName: 'Cable Ugreen Patch Cord Cat6 UTP 3 Metros Gris',
        quantity: 2,
        regularUnitPrice: 5.50,
        unitCost: 2.20
      }
    ]
  }
];

export const initialPromotions: Promotion[] = [
  {
    id: 'prm-1',
    code: 'PROMO-COMP10',
    name: '10% OFF en Categoría Cómputo',
    description: 'Descuento especial del 10% en todas las laptops y computadoras.',
    type: 'PORCENTAJE',
    target: 'CATEGORIA',
    targetId: 'cat-1',
    discountValue: 10,
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    isActive: true,
    autoApply: true,
    usageCount: 14
  },
  {
    id: 'prm-2',
    code: 'PROMO-FLASH20',
    name: 'Bono $20 en Compras > $150',
    description: 'Descuento directo de $20 en el total de la compra si el subtotal supera $150.',
    type: 'MONTO_FIJO',
    target: 'TODO_CARRITO',
    minPurchaseAmount: 150.00,
    discountValue: 20.00,
    startDate: '2026-10-01',
    endDate: '2026-11-30',
    isActive: true,
    autoApply: true,
    usageCount: 8
  },
  {
    id: 'prm-3',
    code: 'PROMO-2X1-CABLES',
    name: '2x1 en Cables de Red Ugreen',
    description: 'Compra 2 cables Ugreen Patch Cord Cat6 y el segundo es totalmente gratis.',
    type: 'DOS_POR_UNO',
    target: 'PRODUCTO',
    targetId: 'prod-10',
    minQuantity: 2,
    discountValue: 50,
    startDate: '2026-10-01',
    endDate: '2026-10-31',
    isActive: true,
    autoApply: true,
    usageCount: 22
  },
  {
    id: 'prm-4',
    code: 'VIP-CLIENTE15',
    name: 'Cupón VIP 15% Descuento Directo',
    description: 'Cupón promocional del 15% para clientes preferenciales en compras superiores a $100.',
    type: 'PORCENTAJE',
    target: 'TODO_CARRITO',
    minPurchaseAmount: 100.00,
    discountValue: 15,
    startDate: '2026-10-01',
    endDate: '2026-12-31',
    isActive: true,
    autoApply: false,
    usageCount: 5
  }
];
