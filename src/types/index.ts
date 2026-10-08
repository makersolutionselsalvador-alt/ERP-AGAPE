import { TipoDte, EstadoDte, DteConfig } from './dte';
export * from './dte';

export type UserRole = 'Administrador' | 'Gerente' | 'Cajero' | 'Bodeguero' | 'Vendedor';

export interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Permission IDs or codes
  userCount: number;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  branchId: string;
  isActive: boolean;
  avatarUrl?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  documentId: string;
  email: string;
  phone: string;
  position: string;
  branchId: string;
  hireDate: string;
  salary: number;
  isActive: boolean;
}

export interface Branch {
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

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  branchId: string;
  type: 'Principal' | 'Secundaria' | 'Merma' | 'Tránsito';
  capacityNotes?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  color?: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  categoryId: string;
  code: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  code: string;
  barcode: string;
  name: string;
  description?: string;
  categoryId: string;
  subcategoryId?: string;
  brand?: string;
  unit: string; // 'Unidad', 'Caja', 'Kg', 'Metro', etc.
  costPrice: number; // Precio de compra / costo
  sellingPrice: number; // Precio de venta regular
  wholesalePrice?: number; // Precio mayorista
  taxRate: number; // Ej. 13% o 16% IVA
  minStock: number; // Stock mínimo para alerta de bajo stock
  maxStock?: number;
  isActive: boolean;
  imageUrl?: string;
  // Warehouse breakdown: warehouseId -> quantity
  warehouseStock: Record<string, number>;
}

export type MovementType = 
  | 'VENTA' 
  | 'COMPRA' 
  | 'AJUSTE_ENTRADA' 
  | 'AJUSTE_SALIDA' 
  | 'TRANSFERENCIA_ENTRADA' 
  | 'TRANSFERENCIA_SALIDA' 
  | 'DEVOLUCION_CLIENTE' 
  | 'DEVOLUCION_PROVEEDOR';

export interface StockMovement {
  id: string;
  code: string;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost: number;
  totalCost: number;
  referenceDocument?: string; // e.g. "FAC-0012", "AJU-0004"
  reason?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface KardexEntry {
  id: string;
  productId: string;
  date: string;
  documentType: string;
  documentNumber: string;
  movementType: 'Entrada' | 'Salida';
  // Input
  inQuantity: number;
  inUnitCost: number;
  inTotalCost: number;
  // Output
  outQuantity: number;
  outUnitCost: number;
  outTotalCost: number;
  // Balance
  balanceQuantity: number;
  balanceUnitCost: number;
  balanceTotalCost: number;
}

export interface StockAdjustment {
  id: string;
  code: string;
  warehouseId: string;
  productId: string;
  type: 'Entrada' | 'Salida';
  quantity: number;
  reason: 'Conteo físico' | 'Merma / Daño' | 'Vencimiento' | 'Error de registro' | 'Otro';
  notes?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface StockTransfer {
  id: string;
  code: string;
  originWarehouseId: string;
  destinationWarehouseId: string;
  status: 'Completado' | 'En Tránsito' | 'Cancelado';
  notes?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
  }[];
  transferredBy: string;
  createdAt: string;
}

export interface Client {
  id: string;
  code: string;
  name: string;
  taxId: string; // DUI, NIT, DNI, RUC
  nrc?: string; // Número de Registro de Contribuyente (requerido para CCF - 03)
  codActividad?: string; // Actividad Económica CAT-019 (ej. 47110)
  descActividad?: string;
  departamento?: string; // CAT-014 (ej. 06 San Salvador)
  municipio?: string; // CAT-015 (ej. 14 San Salvador Centro)
  esGranContribuyente?: boolean; // Aplica retención 1% IVA en CCF
  email: string;
  phone: string;
  address: string;
  category: 'Minorista' | 'Mayorista' | 'Corporativo';
  creditLimit: number;
  currentDebt: number;
  discountPercentage: number; // Descuento asignado
  isActive: boolean;
  totalPurchases: number;
  lastPurchaseDate?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactName: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  creditDays: number;
  currentDebt: number; // Saldo que le debemos
  isActive: boolean;
  category: string;
  createdAt: string;
}

export interface ComboItemComponent {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  regularUnitPrice: number;
  unitCost: number;
}

export interface Combo {
  id: string;
  code: string;
  name: string;
  description: string;
  barcode: string;
  price: number; // Precio final del combo
  originalTotal: number; // Suma de precios regulares individuales
  discountAmount: number; // Ahorro = originalTotal - price
  discountPercentage: number;
  items: ComboItemComponent[];
  isActive: boolean;
  category?: string;
  createdAt: string;
}

export type PromotionType = 
  | 'PORCENTAJE'       // X% de descuento en ítem, categoría o todo el carrito
  | 'MONTO_FIJO'        // $X de descuento directo
  | 'DOS_POR_UNO'       // 2x1 (compras 2, pagas 1) o 3x2
  | 'DESCUENTO_ESCALONADO'; // Descuento por superar monto mínimo

export type PromotionTarget = 'PRODUCTO' | 'CATEGORIA' | 'TODO_CARRITO' | 'COMBO';

export interface Promotion {
  id: string;
  code: string; // Ej: "PROMO-BLACKFRIDAY", "OFF15-COMPUTO"
  name: string;
  description: string;
  type: PromotionType;
  target: PromotionTarget;
  targetId?: string; // productId, categoryId o comboId
  discountValue: number; // porcentaje (ej 15 para 15%) o monto en $ (ej 20 para $20)
  minPurchaseAmount?: number; // Monto mínimo en carrito para activar la promo
  minQuantity?: number; // Cantidad mínima requerida del producto (para 2x1 o volumen)
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isActive: boolean;
  autoApply: boolean; // Si se aplica automáticamente si se cumplen las condiciones
  usageLimit?: number;
  usageCount: number;
}

export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Crédito' | 'Mixto';

export interface PaymentDetail {
  method: PaymentMethod;
  amount: number;
  percentage?: number;
  amountReceived?: number; // Para efectivo entregado por el cliente
  changeGiven?: number;    // Vuelto correspondiente a esta porción de efectivo
  reference?: string;      // Nº de autorización de POS/tarjeta o comprobante de transferencia
}

export interface SaleItem {
  productId: string;
  productCode: string;
  productName: string;
  isCombo?: boolean;
  comboId?: string;
  comboComponents?: {
    productId: string;
    productName: string;
    quantity: number;
    unitCost: number;
  }[];
  quantity: number;
  unitCost: number;
  unitPrice: number;
  discountPercentage: number;
  promotionDiscount?: number;
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface AppliedPromotion {
  promotionId: string;
  code: string;
  name: string;
  discountAmount: number;
}

export interface Sale {
  id: string;
  ticketNumber: string;
  invoiceNumber?: string;
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
  appliedPromotions?: AppliedPromotion[];
  promotionDiscountTotal?: number;
  total: number;
  costTotal: number;
  profitTotal: number;
  paymentMethod: PaymentMethod;
  paymentDetails?: PaymentDetail[];
  amountPaid: number;
  changeGiven: number;
  paymentStatus: 'PAGADO' | 'PENDIENTE' | 'ANULADO';
  dueDate?: string; // Para ventas al crédito
  status: 'Completada' | 'Anulada' | 'Devuelta';
  voidReason?: string;
  cashSessionId?: string;
  createdAt: string;

  // DTE 2.0 (Ministerio de Hacienda de El Salvador)
  dteType?: TipoDte; // '01' = FE, '03' = CCFE
  codigoGeneracion?: string; // UUID v4 en mayúsculas
  numeroControl?: string; // DTE-XX-M000P000-000000000000001
  selloRecibido?: string; // Sello oficial devuelto por Hacienda
  fhProcesamiento?: string; // Fecha y hora de procesamiento de Hacienda
  estadoDte?: EstadoDte; // 'PROCESADO' | 'CONTINGENCIA' | 'RECHAZADO' | 'INVALIDADO'
  tipoModelo?: number; // 1 = Previo, 2 = Contingencia (Diferido)
  dteJsonRaw?: string; // Estructura JSON completa del DTE v2
  signedJws?: string; // Token JWS firmado
  dteObservaciones?: string[]; // Observaciones de Hacienda si hubo rechazo
  invalidationReason?: string;
  invalidationDate?: string;
  codigoGeneracionR?: string; // DTE sustituto en caso de reemplazo
  retencionIva1?: number; // Retención 1% si aplica
}

export interface QuoteItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  total: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  clientId: string;
  clientName: string;
  sellerName: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  notes?: string;
  status: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Convertida a Venta';
  convertedSaleId?: string;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  invoiceNumber: string; // Factura del proveedor
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentType: 'Contado' | 'Crédito';
  paymentStatus: 'PAGADO' | 'PENDIENTE' | 'ANULADO';
  dueDate?: string;
  amountPaid: number;
  status: 'Completada' | 'Anulada';
  voidReason?: string;
  createdAt: string;
}

export interface AccountReceivable {
  id: string;
  saleId: string;
  ticketNumber: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'PENDIENTE' | 'PAGADO' | 'VENCIDO';
  payments: {
    id: string;
    date: string;
    amount: number;
    paymentMethod: string;
    reference: string;
    cashSessionId?: string;
  }[];
}

export interface AccountPayable {
  id: string;
  purchaseId: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'PENDIENTE' | 'PAGADO' | 'VENCIDO';
  payments: {
    id: string;
    date: string;
    amount: number;
    paymentMethod: string;
    reference: string;
  }[];
}

export interface CashSession {
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

export interface Expense {
  id: string;
  code: string;
  branchId: string;
  category: 'Servicios' | 'Alquiler' | 'Transporte' | 'Suministros' | 'Mantenimiento' | 'Planilla' | 'Otros';
  amount: number;
  concept: string;
  paidTo: string;
  receiptNumber?: string;
  userId: string;
  userName: string;
  cashSessionId?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  module: 
    | 'Seguridad' 
    | 'Administración' 
    | 'Productos' 
    | 'Inventario' 
    | 'Ventas' 
    | 'Cotizaciones' 
    | 'Compras' 
    | 'Clientes' 
    | 'Proveedores' 
    | 'Caja' 
    | 'Cuentas' 
    | 'Configuración'
    | 'DTE';
  action: 'CREAR' | 'EDITAR' | 'ELIMINAR' | 'DESACTIVAR' | 'ANULAR' | 'COBRAR' | 'APERTURA' | 'CIERRE' | 'LOGIN' | 'AJUSTE' | 'EXPORTAR';
  description: string;
  requirementCode: string; // e.g. "RF-048", "RF-035"
  ipAddress?: string;
}

export interface CompanySettings {
  name: string;
  tradeName: string;
  taxId: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  currencySymbol: string;
  currencyCode: string;
  defaultTaxRate: number; // e.g. 13% or 16%
  taxName: string; // e.g. "IVA"
  ticketHeader: string;
  ticketFooter: string;
  printLogo: boolean;
  lowStockAlertThreshold: number;
  enableCreditSales: boolean;
  dteConfig: DteConfig;
}
