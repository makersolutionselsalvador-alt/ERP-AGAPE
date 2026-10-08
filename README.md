# 🏢 Maker Solutions El Salvador ERP

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)](https://github.com/makersolutions/erp-elsalvador)

**Sistema ERP moderno de gestión empresarial para operaciones comerciales** — Venta, inventario, clientes, facturación, proveedores (CXP y CXC) y reportes integrados en una plataforma SPA escalable.

---

## 📋 Tabla de contenidos

- [Descripción general](#-descripción-general)
- [Stack tecnológico](#-stack-tecnológico)
- [Características principales](#-características-principales)
- [Instalación y configuración](#-instalación-y-configuración)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Módulos funcionales](#-módulos-funcionales)
- [Arquitectura](#-arquitectura)
- [Modelo de negocio](#-modelo-de-negocio)
- [Gestión de estado](#-gestión-de-estado)
- [Ejemplo de flujo de usuario](#-ejemplo-de-flujo-de-usuario)
- [Consideraciones técnicas](#-consideraciones-técnicas)
- [Contribuciones](#-contribuciones)

---

## 🎯 Descripción general

**Maker Solutions El Salvador ERP** es una solución integral de gestión empresarial diseñada para **pequeñas y medianas empresas** que operan en comercio, distribución y retail.

### Casos de uso

- ✅ Negocio de venta de productos tecnológicos
- ✅ Distribuidoras de insumos
- ✅ Tiendas con múltiples sucursales
- ✅ Empresas con operación de caja y punto de venta
- ✅ Negocios que requieren control de inventario multialmacén

### Beneficios clave

| Beneficio | Detalle |
|-----------|---------|
| **Operación integrada** | Venta, compra, inventario, caja en una sola plataforma |
| **Control multialmacén** | Gestión centralizada de stock en múltiples bodegas |
| **Auditoría completa** | Rastreo de cada transacción con usuario y timestamp |
| **Reportes gerenciales** | Visión completa de ventas, utilidades y estado operativo |
| **Gestión de crédito** | Control de cuentas por cobrar y por pagar |
| **Interfaz intuitiva** | Diseño moderno y responsive |

---

## 🛠️ Stack tecnológico

El proyecto utiliza tecnologías modernas y de alto rendimiento:

```json
{
  "frontend": {
    "framework": "React 19",
    "language": "TypeScript 5.6+",
    "bundler": "Vite 5.x",
    "styling": "Tailwind CSS 3.x",
    "icons": "Lucide React",
    "animations": "Motion"
  },
  "backend": {
    "server": "Express",
    "runtime": "Node.js"
  },
  "integrations": {
    "ai": "Google GenAI",
    "environment": "dotenv"
  }
}
```

### Dependencias principales

```
✓ React 19 + React DOM
✓ TypeScript (strict mode)
✓ Vite (dev server + bundler)
✓ Tailwind CSS + @tailwindcss/vite
✓ Lucide React (iconografía)
✓ Motion (animaciones)
✓ Express (backend)
✓ Google GenAI SDK
```

---

## ⭐ Características principales

### 1. **Punto de Venta (POS)**
- Venta rápida en piso de venta
- Aplicación de descuentos por producto
- Cálculo automático de impuestos
- Múltiples métodos de pago (Efectivo, Tarjeta, Transferencia, Crédito)
- Generación de ticket con número de serie
- Emisión de factura

### 2. **Gestión de Inventario**
- Stock por almacén
- Ajustes de inventario (entrada/salida)
- Transferencias entre bodegas
- Kardex integral (registro histórico)
- Alertas de bajo stock
- Reporte por almacén

### 3. **Administración de Productos**
- Catálogo centralizado
- Categorías y subcategorías
- Códigos de barras
- Precios (costo, venta, mayorista)
- Stock mínimo y máximo por almacén
- Tasas impositivas por producto

### 4. **Gestión de Clientes**
- Registro de clientes (corporativos, minoristas, mayoristas)
- Límites de crédito
- Historial de compras
- Cuentas por cobrar
- Descuentos por cliente

### 5. **Gestión de Proveedores**
- Registro de proveedores
- Categorización por tipo de producto
- Cuentas por pagar
- Seguimiento de pagos
- Condiciones de crédito

### 6. **Compras**
- Registro de compras
- Recepción en almacén
- Actualización automática de stock
- Pago (contado/crédito)
- Génesis de cuentas por pagar

### 7. **Operación de Caja**
- Apertura de turno con fondo inicial
- Registro de ventas por método de pago
- Gastos operativos
- Cierre de caja con arqueo
- Cálculo de diferencias

### 8. **Reportes y Analytics**
- Dashboard operativo
- Resumen de ventas
- Margen de utilidad
- Movimiento de inventario
- Estado de cuentas

### 9. **Administración del Sistema**
- Gestión de usuarios
- Roles y permisos
- Sucursales y almacenes
- Empleados
- Configuración general

### 10. **Auditoría**
- Registro inmutable de acciones
- Trazabilidad por usuario
- Marca de tiempo en cada operación
- Motivos de anulación

---

## 📦 Instalación y configuración

### Requisitos previos

```bash
node >= 18.0.0
npm >= 9.0.0
```

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/makersolutions/erp-elsalvador.git
cd erp-elsalvador
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus valores
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

### Scripts disponibles

```bash
npm run dev          # Servidor de desarrollo con HMR
npm run build        # Compilación para producción
npm run preview      # Previsualizar build de producción
npm run lint         # Validar tipos con TypeScript
npm run clean        # Limpiar dist/ y archivos generados
```

---

## 📁 Estructura del proyecto

```
maker-solutions-sv-erp/
├── 📄 README.md                          # Este archivo
├── 📄 package.json                       # Dependencias del proyecto
├── 📄 tsconfig.json                      # Configuración de TypeScript
├── 📄 vite.config.ts                     # Configuración de Vite
├── 📄 .env.example                       # Variables de entorno ejemplo
├── 📄 index.html                         # Punto de entrada HTML
│
├── src/
│   ├── 📄 main.tsx                       # Bootstrap de React
│   ├── 📄 App.tsx                        # Componente raíz
│   ├── 📄 index.css                      # Estilos globales
│   │
│   ├── context/
│   │   └── 📄 AppContext.tsx             # Estado global del ERP
│   │
│   ├── components/
│   │   ├── admin/                        # Administración
│   │   │   ├── BranchesView.tsx
│   │   │   ├── EmployeesView.tsx
│   │   │   ├── RolesPermissionsView.tsx
│   │   │   └── UsersView.tsx
│   │   │
│   │   ├── audit/                        # Auditoría
│   │   │   └── AuditLogView.tsx
│   │   │
│   │   ├── auth/                         # Autenticación
│   │   │   └── AuthModal.tsx
│   │   │
│   │   ├── cash/                         # Caja y gastos
│   │   │   └── CashRegisterView.tsx
│   │   │
│   │   ├── common/                       # Componentes compartidos
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TicketModal.tsx
│   │   │
│   │   ├── contacts/                     # Clientes y proveedores
│   │   │   ├── AccountsPayableView.tsx
│   │   │   ├── AccountsReceivableView.tsx
│   │   │   ├── ClientsView.tsx
│   │   │   └── SuppliersView.tsx
│   │   │
│   │   ├── dashboard/                    # Dashboard gerencial
│   │   │   └── DashboardView.tsx
│   │   │
│   │   ├── inventory/                    # Inventario y stock
│   │   │   ├── InventoryView.tsx
│   │   │   ├── KardexView.tsx
│   │   │   ├── StockAdjustmentsView.tsx
│   │   │   ├── StockMovementsView.tsx
│   │   │   ├── StockTransfersView.tsx
│   │   │   └── WarehouseReportView.tsx
│   │   │
│   │   ├── pos/                          # Punto de venta
│   │   │   └── PosView.tsx
│   │   │
│   │   ├── products/                     # Productos y catálogos
│   │   │   ├── CategoriesView.tsx
│   │   │   └── ProductsView.tsx
│   │   │
│   │   ├── purchases/                    # Compras
│   │   │   └── PurchasesView.tsx
│   │   │
│   │   ├── reports/                      # Reportes
│   │   │   └── ReportsHubView.tsx
│   │   │
│   │   ├── sales/                        # Ventas
│   │   │   ├── QuotesView.tsx
│   │   │   └── SalesListView.tsx
│   │   │
│   │   └── settings/                     # Configuración
│   │       └── SettingsView.tsx
│   │
│   ├── data/
│   │   └── 📄 initialData.ts             # Datos iniciales de demo
│   │
│   └── types/
│       └── 📄 index.ts                   # Tipos de negocio TypeScript
│
└── dist/                                 # Build de producción (generado)
```

---

## 🎓 Módulos funcionales

### 1️⃣ Dashboard
**Módulo:** `dashboard/DashboardView.tsx`

Proporciona una vista gerencial integrada del estado del negocio:
- Métricas operativas en tiempo real
- Indicadores clave de desempeño (KPIs)
- Resumen de ventas del día
- Estado de inventario
- Alertas de bajo stock
- Posición financiera

### 2️⃣ Administración
**Módulo:** `admin/`

Gestión interna del sistema:
- **Usuarios** — Registro, roles y permisos
- **Empleados** — Nómina y asignación a sucursales
- **Sucursales** — Múltiples puntos de venta
- **Bodegas/Almacenes** — Control de ubicaciones de stock
- **Roles y Permisos** — Control de acceso granular

### 3️⃣ Productos
**Módulo:** `products/`

Administración del catálogo comercial:
- **Productos** — Código, descripción, precios, stock
- **Categorías** — Clasificación jerárquica
- **Subcategorías** — Organización detallada
- Precios diferenciados (costo, venta, mayorista)
- Stock por almacén
- Códigos de barras

### 4️⃣ Inventario (Core)
**Módulo:** `inventory/`

Núcleo del control logístico:
- **Stock general** — Visión consolidada
- **Bajo stock** — Alertas automáticas
- **Ajustes de inventario** — Entrada/salida con motivos
- **Movimientos** — Historial detallado de cambios
- **Transferencias** — Entre almacenes con seguimiento
- **Kardex** — Registro histórico valuado FIFO/PEPS
- **Reporte por bodega** — Análisis por ubicación

### 5️⃣ Clientes y Proveedores
**Módulo:** `contacts/`

Gestión de relaciones comerciales:
- **Clientes** — Corporativos, minoristas, mayoristas
- **Proveedores** — Categorización y condiciones
- **Cuentas por Cobrar** — Seguimiento de deuda de clientes
- **Cuentas por Pagar** — Obligaciones con proveedores
- Límites de crédito
- Historial de transacciones

### 6️⃣ Compras
**Módulo:** `purchases/`

Adquisiciones y operación de entrada:
- Nueva compra
- Recepción en almacén
- Pago (contado/crédito)
- Actualización automática de stock
- Creación de cuentas por pagar
- Consulta de historial

### 7️⃣ Ventas
**Módulo:** `sales/` + `pos/`

Operación comercial:
- **POS** — Venta rápida en mostrador
- **Cotizaciones** — Presupuestos
- **Ventas** — Consulta de historial
- Descuentos y promociones
- Cálculo automático de impuestos
- Generación de tickets y facturas
- Cobranza (contado/crédito)

### 8️⃣ Caja y Gastos
**Módulo:** `cash/`

Operación financiera diaria:
- Apertura de turno con fondo inicial
- Registro de ventas por método
- Gastos operativos
- Cierre de caja con arqueo
- Cálculo de diferencias
- Historial de cierres

### 9️⃣ Reportes
**Módulo:** `reports/`

Inteligencia de negocio:
- Reportes de ventas
- Análisis de utilidad
- Movimiento de inventario
- Estado de cuentas
- Exportación de datos

### 🔟 Auditoría
**Módulo:** `audit/`

Trazabilidad y compliance:
- Bitácora inmutable de acciones
- Rastreo por usuario
- Marcas de tiempo
- Motivos de anulación
- Cumplimiento normativo

---

## 🏗️ Arquitectura

### Flujo de arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                         index.html                          │
│                   (Punto de entrada)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                    src/main.tsx
                (Bootstrap de React)
                         │
                         ▼
                    src/App.tsx
            (Layout principal y enrutamiento)
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
     Navbar          Sidebar            Router
   (Navegación)   (Menú lateral)   (Módulos dinámicos)
        │                │                │
        └────────────────┼────────────────┘
                         │
                         ▼
            AppContext / useApp()
          (Estado global centralizado)
                         │
        ┌────────────────┼────────────────────────┐
        │                │                        │
        ▼                ▼                        ▼
   Componentes      Data Layer              Business Logic
   (UI por módulo)  (initialData.ts)    (Lógica de negocio)
```

### Flujo de datos

```typescript
// 1. Usuario navega a módulo
setCurrentModule('pos-new-sale');

// 2. App renderiza componente correspondiente
{currentModule === 'pos-new-sale' && <PosView />}

// 3. Componente se suscribe al contexto
const { products, clients, createSale } = useApp();

// 4. Interacción del usuario
const newSale = createSale({
  clientId,
  items,
  paymentMethod,
  amountPaid
});

// 5. Estado se actualiza y sincroniza
// - Productos (stock deducido)
// - Ventas (nueva venta registrada)
// - Cuentas por cobrar (si crédito)
// - Caja (si efectivo)
// - Kardex (movimiento registrado)
// - Auditoría (acción logueada)
```

---

## 💼 Modelo de negocio

### Entidades principales

```typescript
// Usuarios y acceso
interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  employeeId: string;
  branchId: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

// Organización
interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  managerName: string;
  isMain: boolean;
  isActive: boolean;
}

interface Warehouse {
  id: string;
  code: string;
  name: string;
  branchId: string;
  type: 'Principal' | 'Secundaria';
  capacityNotes?: string;
  isActive: boolean;
}

// Productos e inventario
interface Product {
  id: string;
  code: string;
  barcode: string;
  name: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  brand: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice: number;
  taxRate: number;
  minStock: number;
  maxStock: number;
  isActive: boolean;
  warehouseStock: Record<string, number>;
}

// Operaciones comerciales
interface Sale {
  id: string;
  ticketNumber: string;
  invoiceNumber: string;
  branchId: string;
  warehouseId: string;
  clientId: string;
  clientName: string;
  sellerId: string;
  sellerName: string;
  items: SaleItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  costTotal: number;
  profitTotal: number;
  paymentMethod: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Crédito';
  amountPaid: number;
  changeGiven: number;
  paymentStatus: 'PAGADO' | 'PENDIENTE' | 'ANULADO';
  dueDate?: string;
  status: 'Completada' | 'Anulada';
  cashSessionId?: string;
  createdAt: string;
}

interface Purchase {
  id: string;
  purchaseNumber: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentType: 'Contado' | 'Crédito';
  paymentStatus: 'PAGADO' | 'PENDIENTE';
  dueDate?: string;
  amountPaid: number;
  status: 'Completada' | 'Anulada';
  createdAt: string;
}

// Caja y finanzas
interface CashSession {
  id: string;
  code: string;
  branchId: string;
  userId: string;
  userName: string;
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  expectedCash: number;
  actualCash?: number;
  cashDifference?: number;
  totalSalesCash: number;
  totalSalesCard: number;
  totalSalesTransfer: number;
  totalSalesCredit: number;
  totalExpenses: number;
  totalClientPaymentsCash: number;
  status: 'Abierta' | 'Cerrada';
  notes?: string;
}

// Auditoría
interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  module: string;
  action: string;
  description: string;
  requirementCode: string;
  ipAddress: string;
}
```

---

## 🧠 Gestión de estado

La aplicación utiliza **React Context API** para un estado global centralizado:

### AppContext

```typescript
interface AppContextType {
  // Navegación y UI
  currentModule: ActiveModule;
  setCurrentModule: (mod: ActiveModule) => void;
  selectedBranchId: string;
  setSelectedBranchId: (id: string) => void;
  toasts: ToastNotification[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;

  // Datos y operaciones
  currentUser: User | null;
  users: User[];
  roles: Role[];
  products: Product[];
  clients: Client[];
  suppliers: Supplier[];
  sales: Sale[];
  purchases: Purchase[];
  
  // Funciones de negocio
  createSale: (saleData: ...) => Sale;
  createPurchase: (purData: ...) => void;
  recordStockAdjustment: (adj: ...) => void;
  transferStock: (transfer: ...) => void;
  registerClientPayment: (accountReceivableId: string, ...) => void;
  
  // Utilidades
  logAuditAction: (module, action, description, reqCode) => void;
  restoreDemoData: () => void;
}
```

### Persistencia

El estado se sincroniza automáticamente con **localStorage** para persistencia entre sesiones:

```typescript
const STORAGE_PREFIX = 'nexuserp_data_';

useEffect(() => {
  localStorage.setItem(STORAGE_PREFIX + 'products', JSON.stringify(products));
}, [products]);

// Al cargar
const [products] = useState<Product[]>(() => 
  loadFromStorage('products', initialProducts)
);
```

---

## 👤 Ejemplo de flujo de usuario

### Escenario: Venta de producto en POS

#### Paso 1: Autenticación
```
1. Usuario accede a la aplicación
2. Ve modal de login
3. Ingresa usuario: "carlos.cajero"
4. Sistema valida y autentica
5. Se cargan permisos del rol "Cajero"
```

#### Paso 2: Seleccionar módulo POS
```
1. Usuario hace click en "Punto de Venta" en sidebar
2. setCurrentModule('pos-new-sale')
3. Se renderiza PosView
```

#### Paso 3: Crear venta
```
1. Sistema valida que existe caja abierta
   (Si no, redirige a apertura de caja)

2. Usuario selecciona cliente "Consumidor Final"

3. Usuario agrega producto:
   - PRD-004: Teclado Logitech
   - Cantidad: 1
   - Precio: $149.00
   - Stock: ✓ Disponible

4. Sistema calcula:
   - Subtotal: $131.86
   - Impuesto (13%): $17.14
   - Total: $149.00

5. Usuario selecciona pago: "Efectivo"

6. Usuario ingresa monto: $300.00

7. Sistema calcula cambio: $151.00
```

#### Paso 4: Procesar venta
```
1. createSale() ejecuta:
   
   a) Deducir stock:
      - wh-2 stock PRD-004: 6 → 5
   
   b) Registrar venta:
      - Sale ID: sal-[timestamp]
      - Ticket: TCK-001041
      - Invoice: FAC-B01-0001041
   
   c) Registrar movimiento:
      - StockMovement de tipo VENTA
      - Código: MOV-V[timestamp]
   
   d) Actualizar Kardex:
      - KardexEntry para PRD-004
      - Balance: 6 unidades
   
   e) Actualizar cliente:
      - totalPurchases += $149.00
   
   f) Actualizar caja:
      - expectedCash += $149.00
      - totalSalesCash += $149.00
   
   g) Registrar auditoría:
      - Module: "Ventas"
      - Action: "CREAR"
      - User: "Carlos Hernández"
      - Timestamp: ahora
```

#### Paso 5: Generar ticket
```
1. Sistema abre modal TicketModal
2. Muestra ticket con:
   - Encabezado: Logo y datos de empresa
   - Número de ticket
   - Fecha y hora
   - Cliente
   - Vendedor
   - Líneas de producto
   - Total, impuestos
   - Método de pago
   - Pie de página con políticas

3. Usuario puede:
   - Imprimir (Print dialog)
   - Descargar PDF
   - Enviar por email (si se integra)
   - Cerrar modal
```

#### Paso 6: Toast de confirmación
```
showToast("Venta TCK-001041 registrada exitosamente", "success")
→ Notificación verde en la esquina superior
→ Se auto-elimina después de 4.5 segundos
```

#### Resultado final
```
✓ Stock actualizado en tiempo real
✓ Venta registrada en base de datos
✓ Movimiento contabilizado
✓ Cliente con histórico actualizado
✓ Caja con venta registrada
✓ Auditoría completamente trazable
✓ Ticket emitido
```

---

## 🔧 Consideraciones técnicas

### Seguridad

- ✅ Tipado fuerte con TypeScript
- ✅ Validación de roles y permisos
- ✅ Auditoría completa de acciones
- ✅ Cambio de contraseña
- ✅ Control de acceso por módulo
- ⚠️ Nota: La autenticación actual es de demostración; en producción se requiere JWT + sesiones seguras

### Escalabilidad

- ✅ Arquitectura modular por dominios
- ✅ State management centralizado
- ✅ Tipado de datos consistente
- ✅ Separación de responsabilidades
- ✅ Fácil de extender con nuevos módulos

### Extensión recomendada

Para llevar a producción se sugiere:

1. **Backend real**
   - API REST con Express/NestJS
   - Autenticación JWT
   - Base de datos (PostgreSQL, MySQL)

2. **Base de datos**
   - Schema relacional para todas las entidades
   - Índices en campos de búsqueda
   - Transacciones para operaciones críticas

3. **Persistencia**
   - Migración de localStorage a API
   - Sincronización con servidor
   - Backup y recuperación

4. **Reporting**
   - Exportación a Excel/PDF
   - Gráficos y dashboards avanzados
   - BI integrado

5. **Integraciones**
   - APIs de bancos
   - Sistemas contables
   - E-commerce
   - Marketplace

6. **DevOps**
   - Docker containerización
   - CI/CD pipeline
   - Monitoreo y logging
   - Backup automático

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para cambios significativos:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Lineamientos

- Mantener TypeScript strict mode
- Documentar cambios en tipos
- Validar que el build compile (`npm run lint`)
- Seguir la estructura modular existente

---

## 📝 Licencia

Este proyecto está bajo licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

## 📞 Contacto

**Organización:** Maker Solutions El Salvador  
**Repository:** [github.com/makersolutions/erp-elsalvador](https://github.com/makersolutions/erp-elsalvador)  
**Issues:** [GitHub Issues](https://github.com/makersolutions/erp-elsalvador/issues)

---

## 📊 Estadísticas del proyecto

| Métrica | Valor |
|---------|-------|
| **Lenguaje** | TypeScript (99.6%) |
| **Framework** | React 19 |
| **Bundler** | Vite 5.x |
| **Estilos** | Tailwind CSS 3.x |
| **Módulos funcionales** | 10+ |
| **Tipos de negocio** | 25+ |
| **Componentes** | 30+ |

---

## 🚀 Roadmap

- [ ] Backend API con Express
- [ ] Base de datos PostgreSQL
- [ ] Autenticación JWT
- [ ] Módulo de reportes avanzados
- [ ] Exportación a Excel/PDF
- [ ] Integración con pasarelas de pago
- [ ] App móvil con React Native
- [ ] Sincronización offline/online
- [ ] Soporte multiidioma
- [ ] Dark mode

---

## 💡 Tips de uso

### Para desarrollo rápido
```bash
npm run dev
# Servidor en http://localhost:3000 con HMR activo
```

### Para testing
```bash
npm run lint
# Valida tipos TypeScript sin compilar
```

### Para producción
```bash
npm run build
npm run preview
# Visualiza el build antes de deployer
```

---

**Hecho con ❤️ para empresas que buscan eficiencia operativa**

Última actualización: 2026-10-03
