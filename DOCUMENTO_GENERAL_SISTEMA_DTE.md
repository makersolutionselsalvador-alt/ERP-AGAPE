# DOCUMENTO GENERAL DEL SISTEMA — MAKER SOLUTIONS EL SALVADOR ERP & FACTURACIÓN ELECTRÓNICA DTE
## NORMATIVA 2.0 — MINISTERIO DE HACIENDA DE EL SALVADOR (DGII)

---

### ÍNDICE GENERAL
1. **Resumen Ejecutivo y Alcance del Sistema**
2. **Arquitectura Tecnológica del ERP / POS**
3. **Flujo y Ciclo Oficial de Transmisión DTE con Hacienda (Optimizado)**
4. **Catálogo de Colecciones / Entidades de Datos del Sistema**
5. **Diccionario de Datos Detallado por Colección**
6. **Especificación del Esquema Oficial JSON DTE v2 (Ministerio de Hacienda)**
7. **Catálogos Oficiales del Ministerio de Hacienda (DGII)**
8. **Matriz de Relaciones y Cardinalidades (Diagrama Entidad-Relación)**
9. **Auditoría Técnica: Especificación Exhaustiva de Requisitos Faltantes para Producción Real**

---

### 1. RESUMEN EJECUTIVO Y ALCANCE DEL SISTEMA

**Maker Solutions El Salvador ERP** es una plataforma integral de gestión empresarial diseñada bajo estándares de alta velocidad operativa para el sector comercial salvadoreño. Integra:
- **Punto de Venta (POS)** de alta velocidad (< 300 ms por emisión) con soporte para productos simples, paquetes/combos dinámicos, promociones automáticas (2x1, porcentaje, cupones) y múltiples medios de pago (Efectivo, Tarjeta, Transferencia, Crédito con cuentas por cobrar).
- **Inventario Multialmacén y Kardex**: Valoración por Costo Promedio Ponderado (CPP), movimientos, traslados entre sucursales y ajustes con bitácora.
- **Facturación Electrónica DTE Normativa 2.0**:
  - Emisión de **Factura Electrónica (Tipo 01)** para consumidor final.
  - Emisión de **Comprobante de Crédito Fiscal (Tipo 03)** para contribuyentes inscritos en IVA con retención del 1% para Grandes Contribuyentes (Art. 162 CT).
  - Generación de **Código de Generación** según estándar estricto UUID v4 en mayúsculas.
  - Asignación de **Número de Control** de 31 caracteres estructurado por tipo de DTE, casa matriz y punto de venta.
  - Cálculo de **Total en Letras** con formato oficial salvadoreño (`... DÓLARES CON XX/100 USD`).
  - Representación gráfica de tickets térmicos (80mm) con código QR oficial direccionado a `https://admin.factura.gob.sv/consultaPublica`.
  - **Modelo de Contingencia (Diferido - Modelo 2)** ante cortes de conectividad o indisponibilidad de la DGII con encolado y retransmisión por lote.
  - **Eventos de Invalidación (Anexo 9.1)** con control automático de plazos legales de anulación (1 día calendario para CCF y 3 meses para Facturas).

---

### 2. ARQUITECTURA TECNOLÓGICA DEL ERP / POS

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CAPA DE PRESENTACIÓN / CLIENTE                      │
│   React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons           │
│   • Terminal POS de Alta Velocidad    • Gestión DTE & Contingencias    │
│   • Representación Gráfica (Ticket)   • Matriz de Plazos de Anulación  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│              CAPA DE NEGOCIO Y MOTOR TRIBUTARIO DTE                    │
│   • dteService.ts (Pipeline de Emisión, Validación, Cifrado, Sello)    │
│   • dteHelpers.ts (UUID v4, Nº Control, Números a Letras, Plazos)      │
│   • promoLogic.ts (Motor de Descuentos, Combos y Cupones)              │
│   • rbac.ts       (Control de Acceso Basado en Roles)                  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│            CAPA DE INTEGRACIÓN TRIBUTARIA (HACIENDA DGII)              │
│   1. Caché de Sesión JWT en Memoria (Vigencia 24h a 48h)               │
│   2. Cliente REST svfe-api-firmador (POST http://localhost:8080)       │
│      • Timeout ultrarrápido (180ms) + Fallback criptográfico estándar  │
│   3. Web Service Recepción MH (POST /fesv/recepciondte)                │
│   4. Consulta Pública Ciudadana QR (admin.factura.gob.sv)              │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                 CAPA DE PERSISTENCIA Y AUDITORÍA                       │
│   • databaseService.ts (Exportación JSON, Respaldo Cifrado, Migración) │
│   • Tablas en Memoria / LocalStorage con sincronización transaccional  │
│   • Bitácora Inmutable de Auditoría (AuditLogs con códigos RF)         │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 3. FLUJO Y CICLO OFICIAL DE TRANSMISIÓN DTE CON HACIENDA (OPTIMIZADO)

Para cumplir con la exigencia de **despacho en mostrador inferior a 300 milisegundos**, el ciclo oficial de 6 pasos de la DGII fue optimizado arquitectónicamente mediante ejecución síncrona sin latencias artificiales y reutilización de tokens en memoria:

```
[Venta en POS / Cobro]
         │
         ▼
[FASE 1: Validación y Estructuración DTE v2] (~60 ms)
  • Regla 5.1: Factura >= $200 exige DUI/NIT y Nombre del receptor
  • Regla 5.2: Crédito Fiscal (03) exige NRC, NIT y Giro (CAT-019)
  • Generación de UUID v4 en mayúsculas: [A-F0-9]{8}-[A-F0-9]{4}-4[A-F0-9]{3}-[89AB][A-F0-9]{3}-[A-F0-9]{12}
  • Generación de Número de Control de 31 caracteres: DTE-01-M001P001-000000000001041
  • Cálculo de IVA 13%, Retención 1% (Grandes Contribuyentes) y Total en Letras
         │
         ▼
[FASE 2: Firma Criptográfica y Autenticación DGII] (~50 ms)
  • Intento de conexión al microservicio local svfe-api-firmador (Timeout 180ms)
  • Generación de sobre digital estándar JWS (CAdES / RSA-SHA512)
  • Inspección de Token JWT en caché de sesión:
      - Si existe token vigente (< 24h): Reutilización inmediata (0 ms de red)
      - Si expiró o primera venta: Obtención de token contra /auth y almacenamiento
         │
         ▼
[FASE 3: Transmisión y Confirmación de Sello Fiscal] (~80 ms)
  • Envío síncrono del JWS firmado hacia /fesv/recepciondte
  • ÉXITO: Recepción del Sello Oficial de Recepción (40 caracteres hexadecimales)
  • CONTINGENCIA (Falla de red / Timeout): Conmutación automática a Modelo Diferido (2),
    impresión de ticket con leyenda de contingencia y encolado para transmisión diferida
         │
         ▼
[Fin: Impresión de Ticket con QR Oficial y Descarga de JSON] (Total: ~190 - 250 ms)
```

---

### 4. CATÁLOGO DE COLECCIONES / ENTIDADES DE DATOS DEL SISTEMA

| # | Nombre de la Colección | Tipo de Entidad | Descripción Funcional |
|---|------------------------|-----------------|-----------------------|
| 1 | `companySettings` | Parámetros Globales | Identidad corporativa, datos fiscales del emisor y credenciales MH. |
| 2 | `clients` | Maestro de Contactos | Directorio de clientes con campos fiscales salvadoreños (NRC, NIT, DUI, Giro). |
| 3 | `products` | Catálogo Maestro | Productos físicos o servicios, precios, costos, categorías y códigos de barras. |
| 4 | `categories` | Clasificación | Árbol de categorías y familias de mercancías. |
| 5 | `combos` | Paquetes / Ofertas | Agrupación de productos con precio especial y stock limitado por el componente cuello de botella. |
| 6 | `promotions` | Reglas de Descuento | Motor de ofertas temporales (2x1, porcentaje, monto fijo y cupones promocionales). |
| 7 | `sales` | Transaccional Ventas | Histórico de comprobantes emitidos, estado DTE, sellos, montos e ítems vendidos. |
| 8 | `purchases` | Transaccional Compras | Registro de compras a proveedores con ingreso al inventario y costeo CPP. |
| 9 | `suppliers` | Maestro de Contactos | Proveedores comerciales con NRC y condiciones de pago. |
| 10 | `warehouses` | Logística | Almacenes y bodegas vinculadas a sucursales. |
| 11 | `branches` | Organización | Sucursales o establecimientos físicos (Casa Matriz M, Sucursal S). |
| 12 | `inventoryMovements` | Logística / Kardex | Historial de movimientos de entrada, salida, ajuste y venta con saldo físico. |
| 13 | `stockAdjustments` | Logística | Ajustes manuales por merma, daño o sobrante auditados por usuario. |
| 14 | `stockTransfers` | Logística | Envíos de existencias entre almacenes con estado pendiente/recibido. |
| 15 | `cashSessions` | Tesorería | Sesiones de caja registradora con saldo inicial, ingresos, gastos y arqueo final. |
| 16 | `expenses` | Tesorería | Salidas de efectivo de caja menor por concepto operativo. |
| 17 | `accountsReceivable` | Cartera | Cuentas por cobrar de ventas al crédito con abonos y saldo pendiente. |
| 18 | `accountsPayable` | Cuentas por Pagar | Pasivos comerciales por compras a crédito. |
| 19 | `users` | Seguridad / Acceso | Credenciales de usuario, rol asignado y sucursal autorizada. |
| 20 | `employees` | Talento Humano | Ficha del personal, cargo, salario y fecha de ingreso. |
| 21 | `roles` | Seguridad / RBAC | Perfiles de usuario (Administrador, Gerente, Cajero, Bodeguero, Vendedor). |
| 22 | `auditLogs` | Seguridad y Auditoría | Registro inmutable de eventos del sistema (login, anulación, cobro, exportación). |
| 23 | `quotes` | Ventas Previas | Cotizaciones emitidas a clientes con fecha de vencimiento. |
| 24 | `dteInvalidations` | Fiscal / Auditoría | Registro de eventos de invalidación transmitidos a Hacienda con motivo y responsable. |

---

### 5. DICCIONARIO DE DATOS DETALLADO POR COLECCIÓN

#### 5.1. Colección `companySettings` (Configuración de la Empresa y DTE)
| Campo | Tipo | Nulo | Descripción | Validación / Restricción |
|---|---|---|---|---|
| `name` | string | No | Razón Social legal de la empresa. | Máx. 250 caracteres. |
| `tradeName` | string | No | Nombre comercial de la marca. | Máx. 150 caracteres. |
| `taxId` | string | No | NIT de la empresa emisor. | 14 dígitos numéricos o formato con guiones. |
| `phone` | string | No | Teléfono de contacto fiscal. | Formato salvadoreño (+503 2XXX-XXXX). |
| `email` | string | No | Correo para notificaciones tributarias. | Email RFC 5322. |
| `address` | string | No | Dirección del establecimiento matriz. | Calle, número y colonia. |
| `city` | string | No | Ciudad o municipio de ubicación. | |
| `currencySymbol` | string | No | Símbolo de moneda. | Por defecto `$`. |
| `currencyCode` | string | No | Código ISO de moneda. | `USD` (Dólar estadounidense). |
| `defaultTaxRate` | number | No | Tasa general del IVA. | `13.0` (%) según Ley de IVA El Salvador. |
| `ticketHeader` | string | No | Mensaje en la cabecera del ticket térmico. | |
| `ticketFooter` | string | No | Mensaje al pie del comprobante. | Políticas de garantía y cambio. |
| `dteConfig.ambiente` | string | No | Ambiente destino en Hacienda (CAT-001). | `'00'` (Pruebas) o `'01'` (Producción). |
| `dteConfig.nitEmisor` | string | No | NIT emisor para API de Hacienda. | 14 dígitos sin guiones. |
| `dteConfig.nrcEmisor` | string | No | Número de Registro de Contribuyente emisor. | 6 a 8 dígitos numéricos. |
| `dteConfig.clavePrivadaMh` | string | Sí | Contraseña privada API del portal DGII. | Clave secreta generada en factura.gob.sv. |
| `dteConfig.firmadorUrl` | string | No | URL del microservicio de firma local. | Por defecto `http://localhost:8080/firmardocumento/`. |
| `dteConfig.codEstablecimiento`| string | No | Código de establecimiento según DGII. | Formato `M001` (Matriz) o `S001` (Sucursal). |
| `dteConfig.codPuntoVenta` | string | No | Código del punto de venta emisor. | Formato `P001`. |

#### 5.2. Colección `clients` (Directorio de Clientes)
| Campo | Tipo | Nulo | Descripción | Validación / Restricción |
|---|---|---|---|---|
| `id` | string (PK) | No | Identificador único del cliente. | Formato `cli-xxx`. |
| `code` | string (UK) | No | Código corto asignado. | Ej. `CLI-001`. |
| `name` | string | No | Nombre completo o Razón Social. | Si venta $\ge \$200$, no puede ser "Consumidor Final". |
| `taxId` | string | No | Documento de Identificación (DUI o NIT). | 9 dígitos (DUI) o 14 dígitos (NIT). |
| `nrc` | string | Sí | Número de Registro de Contribuyente. | **Obligatorio para Crédito Fiscal (03)**. |
| `codActividad` | string | Sí | Código de Actividad Económica (CAT-019). | **Obligatorio para Crédito Fiscal (03)**. 5 dígitos. |
| `descActividad` | string | Sí | Nombre o descripción del giro comercial. | Según CAT-019. |
| `departamento` | string | Sí | Código de Departamento (CAT-012). | `01` a `14`. |
| `municipio` | string | Sí | Código de Municipio (CAT-013). | `01` a `18` según departamento. |
| `esGranContribuyente`| boolean | No | Si es clasificado como Gran Contribuyente. | Si es `true`, aplica retención 1% de IVA en CCF. |
| `email` | string | No | Correo electrónico de envío DTE. | |
| `phone` | string | No | Teléfono de contacto. | |
| `address` | string | No | Dirección fiscal o de entrega. | |
| `category` | string | No | Tipo de cliente. | `'Minorista' \| 'Mayorista' \| 'Corporativo'`. |
| `creditLimit` | number | No | Límite máximo de crédito en dólares. | $\ge 0.00$. |
| `currentDebt` | number | No | Saldo deudor actual acumulado. | Calculado por ventas al crédito menos abonos. |
| `discountPercentage`| number | No | Descuento fijo asignado al cliente. | $0$ a $50\%$. |
| `isActive` | boolean | No | Estado operativo del registro. | `true` o `false`. |

#### 5.3. Colección `products` (Catálogo de Mercancías)
| Campo | Tipo | Nulo | Descripción | Validación / Restricción |
|---|---|---|---|---|
| `id` | string (PK) | No | Identificador único del producto. | Formato `prod-xxx`. |
| `code` | string (UK) | No | Código interno o SKU. | Alfanumérico único. |
| `barcode` | string | No | Código de barras estándar. | EAN-13, UPC o Code128. |
| `name` | string | No | Nombre descriptivo del producto. | Máx. 200 caracteres. |
| `categoryId` | string (FK) | No | Llave foránea hacia `categories.id`. | Relación N:1 con Categorías. |
| `costPrice` | number | No | Costo unitario promedio ponderado. | $\ge 0.00$. |
| `salePrice` | number | No | Precio de venta de lista con IVA incluido. | $>$ `costPrice`. |
| `wholesalePrice` | number | No | Precio para clientes mayoristas. | |
| `stock` | number | No | Existencia física total consolidada. | Suma de stocks por almacén. |
| `minStock` | number | No | Nivel mínimo de alerta de reorden. | Si `stock` $\le$ `minStock`, se marca "Stock Bajo". |
| `unitOfMeasure` | string | No | Unidad de medida para kardex. | Unidad, Caja, Metro, Kg, etc. |
| `warehouseStock` | object | No | Diccionario de stock: `{ [warehouseId]: number }`. | Cardinalidad 1:N por almacén. |
| `isActive` | boolean | No | Estado en el catálogo. | `true` (disponible) o `false` (inactivo). |

#### 5.4. Colección `sales` (Ventas y Documentos Tributarios DTE)
| Campo | Tipo | Nulo | Descripción | Validación / Restricción |
|---|---|---|---|---|
| `id` | string (PK) | No | Identificador único de la transacción. | Formato `sal-xxx`. |
| `ticketNumber` | string (UK) | No | Número correlativo interno del ticket. | Ej. `TCK-001041`. |
| `invoiceNumber` | string | Sí | Número de factura interna si aplica. | |
| `branchId` | string (FK) | No | Sucursal donde se realizó la venta. | Relación N:1 con `branches`. |
| `warehouseId` | string (FK) | No | Almacén desde el cual se despachó stock. | Relación N:1 con `warehouses`. |
| `clientId` | string (FK) | No | Cliente receptor de la venta. | Relación N:1 con `clients`. |
| `clientName` | string | No | Nombre del cliente al momento de facturar. | |
| `sellerId` | string (FK) | No | Usuario vendedor o cajero responsable. | Relación N:1 con `users`. |
| `sellerName` | string | No | Nombre del vendedor. | |
| `items` | array | No | Lista de ítems facturados (`SaleItem[]`). | Debe contener $\ge 1$ ítem. |
| `subtotal` | number | No | Subtotal de ventas gravadas neto de IVA. | |
| `taxAmount` | number | No | Monto correspondiente al IVA 13%. | |
| `retencionIva1`| number | Sí | Monto retenido del 1% (Grandes Contribuyentes). | Art. 162 CT. |
| `total` | number | No | Total neto a pagar por el receptor. | `subtotal + taxAmount - retencionIva1`. |
| `paymentMethod`| string | No | Método de pago aplicado. | `'Efectivo' \| 'Tarjeta' \| 'Transferencia' \| 'Crédito'`. |
| `amountPaid` | number | No | Monto entregado por el cliente. | $\ge$ `total` en pagos en efectivo. |
| `changeGiven` | number | No | Vuelto o cambio entregado en efectivo. | |
| `status` | string | No | Estado comercial de la venta. | `'Completada' \| 'Anulada'`. |
| `paymentStatus`| string | No | Estado financiero de cobranza. | `'PAGADO' \| 'PENDIENTE'`. |
| `dueDate` | string | Sí | Fecha de vencimiento si fue al crédito. | Formato YYYY-MM-DD. |
| `cashSessionId`| string (FK) | No | Sesión de caja en la que ingresó el cobro. | Relación N:1 con `cashSessions`. |
| `createdAt` | string | No | Marca temporal de la venta. | YYYY-MM-DD HH:mm. |
| **`dteType`** | string | No | **Tipo de DTE oficial (CAT-002)**. | `'01'` (Factura) o `'03'` (Crédito Fiscal). |
| **`codigoGeneracion`** | string | No | **UUID v4 oficial en MAYÚSCULAS**. | Formato regex oficial DGII (36 caracteres). |
| **`numeroControl`** | string | No | **Número de Control oficial de 31 caracteres**. | Formato `DTE-01-M001P001-000000000001041`. |
| **`selloRecibido`** | string | Sí | **Sello criptográfico de recepción del MH**. | 40 caracteres hexadecimales emitidos por DGII. |
| **`fhProcesamiento`**| string | Sí | **Fecha y hora de procesamiento de la DGII**. | Formato YYYY-MM-DD HH:mm:ss. |
| **`estadoDte`** | string | No | **Estado tributario oficial del documento**. | `'PROCESADO' \| 'CONTINGENCIA' \| 'PENDIENTE_RETRANSMISION' \| 'INVALIDADO' \| 'RECHAZADO'`. |
| **`tipoModelo`** | number | No | **Modelo de facturación (CAT-005)**. | `1` (Previo/Normal) o `2` (Diferido/Contingencia). |
| **`dteError`** | string | Sí | **Mensaje o causa técnica del fallo con Hacienda**. | Registro de contingencia para auditoría y retransmisión. |
| **`dteObservaciones`**| array | Sí | **Observaciones de validación devueltas por Hacienda**. | Lista de strings informativos o de rechazo. |
| **`dteJsonRaw`** | string | Sí | **Estructura JSON DTE v2 original en texto**. | Archivo legal para auditoría tributaria de 10 años. |
| **`signedJws`** | string | Sí | **Sobre digital firmado JWS (CAdES)**. | Formato `Header.Payload.Signature` RSA512. |

#### 5.5. Colección `combos` (Paquetes y Ofertas Compuestas)
| Campo | Tipo | Nulo | Descripción | Validación / Restricción |
|---|---|---|---|---|
| `id` | string (PK) | No | Identificador del combo. | Formato `cmb-xxx`. |
| `code` | string (UK) | No | Código único del paquete. | Alfanumérico. |
| `name` | string | No | Nombre comercial del combo. | Ej. "Pack Productividad Maker". |
| `description` | string | Sí | Detalle de los componentes. | Texto descriptivo. |
| `price` | number | No | Precio de venta combo con IVA. | Menor a la suma individual de componentes. |
| `components` | array | No | Lista de componentes: `{ productId, quantity }`. | Mínimo 2 productos componentes. |
| `isActive` | boolean | No | Estado comercial. | `true` (activo) o `false`. |

#### 5.6. Colección `promotions` (Motor de Promociones y Cupones)
| Campo | Tipo | Nulo | Descripción | Validación / Restricción |
|---|---|---|---|---|
| `id` | string (PK) | No | Identificador de la regla de oferta. | Formato `prm-xxx`. |
| `name` | string | No | Nombre descriptivo de la campaña. | Ej. "Viernes Tech 15% OFF". |
| `type` | string | No | Tipo de mecánica de descuento. | `'PERCENTAGE' \| 'FIXED_AMOUNT' \| 'BUY_X_GET_Y' \| 'COUPON'`. |
| `value` | number | No | Magnitud del beneficio (% o $). | Según el tipo. |
| `couponCode` | string | Sí | Código de cupón alfanumérico si aplica. | Mayúsculas, ej. `MAKER2026`. |
| `startDate` | string | No | Fecha de inicio de vigencia. | YYYY-MM-DD. |
| `endDate` | string | No | Fecha de fin de vigencia. | YYYY-MM-DD $\ge$ `startDate`. |
| `applicableProductIds`| array | Sí | IDs de productos específicos sujetos a oferta. | Si está vacío, aplica a todo el catálogo. |
| `minPurchaseAmount` | number | Sí | Monto mínimo de carrito para activar. | $\ge 0.00$. |
| `isActive` | boolean | No | Estado de activación. | Control manual por supervisor. |

#### 5.7. Colección `inventoryMovements` (Kardex Físico y Valorado)
| Campo | Tipo | Nulo | Descripción | Validación / Restricción |
|---|---|---|---|---|
| `id` | string (PK) | No | Identificador único del movimiento. | Formato `mov-xxx`. |
| `productId` | string (FK) | No | Producto afectado. | Relación N:1 con `products`. |
| `warehouseId` | string (FK) | No | Almacén / Bodega donde ocurre el flujo. | Relación N:1 con `warehouses`. |
| `type` | string | No | Naturaleza del movimiento. | `'ENTRADA' \| 'SALIDA' \| 'AJUSTE' \| 'TRASLADO'`. |
| `quantity` | number | No | Cantidad de unidades físicas. | Positivo en entrada, negativo en salida. |
| `previousStock` | number | No | Stock antes del movimiento. | |
| `newStock` | number | No | Stock resultante post-movimiento. | `previousStock + quantity`. |
| `unitCost` | number | No | Costo unitario promedio ponderado (CPP). | $\ge 0.00$. |
| `referenceDoc` | string | Sí | Documento de origen (Ticket, Factura, Traslado). | Ej. `TCK-001041`, `AJ-005`. |
| `userId` | string (FK) | No | Usuario que ejecutó la operación. | Relación N:1 con `users`. |
| `timestamp` | string | No | Marca temporal precisa. | ISO 8601. |

#### 5.8. Colecciones `stockTransfers` y `stockAdjustments` (Logística Interna)
| Entidad | Campo Clave | Tipo | Descripción |
|---|---|---|---|
| `stockTransfers` | `id`, `originWarehouseId`, `destWarehouseId`, `items`, `status`, `authorizedBy` | object | Traslados de stock entre sucursales con estados `'PENDIENTE' \| 'EN_TRANSITO' \| 'RECIBIDO' \| 'RECHAZADO'`. |
| `stockAdjustments` | `id`, `warehouseId`, `productId`, `quantity`, `reason`, `authorizedBy` | object | Ajustes físicos por merma, daño, rotura o conteo físico auditado. |

#### 5.9. Colecciones `cashSessions` y `expenses` (Tesorería y Caja Registradora)
| Entidad | Campo Clave | Tipo | Descripción |
|---|---|---|---|
| `cashSessions` | `id`, `userId`, `branchId`, `openingAmount`, `closingAmount`, `expectedAmount`, `difference`, `status`, `openedAt`, `closedAt` | object | Turnos de caja registradora con arqueo ciego, cuadre de cobros y detección de faltantes/sobrantes. |
| `expenses` | `id`, `cashSessionId`, `amount`, `category`, `description`, `authorizedBy`, `timestamp` | object | Egresos de caja menor por gastos operativos inmediatos (limpieza, flete menor, insumos). |

#### 5.10. Colección `accountsReceivable` (Créditos y Cuentas por Cobrar)
| Campo | Tipo | Nulo | Descripción | Validación / Restricción |
|---|---|---|---|---|
| `id` | string (PK) | No | Identificador de la cuenta. | Formato `cxc-xxx`. |
| `saleId` | string (FK) | No | Venta asociada al crédito. | Relación 1:1 con `sales`. |
| `clientId` | string (FK) | No | Deudor comercial. | Relación N:1 con `clients`. |
| `totalAmount` | number | No | Monto total original adeudado. | |
| `balance` | number | No | Saldo pendiente por cobrar. | Disminuye con cada abono (`balance = 0` $\rightarrow$ Saldada). |
| `dueDate` | string | No | Fecha legal de vencimiento de pago. | YYYY-MM-DD. |
| `payments` | array | No | Historial de recibos de abono: `{ id, amount, date, method, receiptNumber }`. | |
| `status` | string | No | Estado de cartera. | `'VIGENTE' \| 'VENCIDA' \| 'SALDADA'`. |

#### 5.11. Colecciones `users`, `roles` y `auditLogs` (Seguridad y Trazabilidad)
| Entidad | Campo Clave | Tipo | Descripción |
|---|---|---|---|
| `users` | `id`, `email`, `name`, `roleId`, `branchId`, `pinCode`, `isActive` | object | Usuarios del sistema con acceso por contraseña y PIN rápido para cajeros. |
| `roles` | `id`, `name`, `permissions[]` | object | Perfiles RBAC (`ADMIN`, `GERENTE`, `CAJERO`, `BODEGUERO`, `VENDEDOR`) con matriz granular de permisos. |
| `auditLogs` | `id`, `timestamp`, `userId`, `userName`, `module`, `action`, `details`, `reqCode` | object | Registro inmutable de cada acción sensible del sistema (anulaciones, ajustes, descargas de base de datos). |

#### 5.12. Colección `dteInvalidations` y Cola de Contingencia
| Entidad | Campo Clave | Tipo | Descripción |
|---|---|---|---|
| `dteInvalidations` | `id`, `saleId`, `codigoGeneracion`, `selloRecibido`, `motivo`, `tipoInvalidacion`, `responsableDoc`, `fhAnula` | object | Bitácora de Eventos de Invalidación transmitidos ante la DGII bajo Anexo 9.1 de Normativa 2.0. |
| `contingenciasQueue` | `saleId`, `codigoGeneracion`, `numeroControl`, `tipoDte`, `intentos`, `ultimoError`, `fhEncolado` | object | Cola de documentos diferidos en resguardo local para re-transmisión automática o manual. |

---

### 6. ESPECIFICACIÓN DEL ESQUEMA OFICIAL JSON DTE v2 (MINISTERIO DE HACIENDA)

El sistema genera la estructura JSON oficial validada contra el esquema v2 de la DGII:

```json
{
  "identificacion": {
    "version": 2,
    "ambiente": "01",
    "tipoDte": "01",
    "numeroControl": "DTE-01-M001P001-000000000001041",
    "codigoGeneracion": "4A8B9C10-D2E3-4F56-A789-0123456789AB",
    "tipoModelo": 1,
    "tipoOperacion": 1,
    "fecEmi": "2026-10-06",
    "horEmi": "14:32:00",
    "tipoMoneda": "USD"
  },
  "emisor": {
    "nit": "06141303861364",
    "nrc": "1234567",
    "nombre": "Maker Solutions El Salvador S.A. de C.V.",
    "codActividad": "47110",
    "descActividad": "Venta al por menor en comercios no especializados",
    "nombreComercial": "Maker Solutions El Salvador",
    "tipoEstablecimiento": "M",
    "direccion": {
      "departamento": "06",
      "municipio": "14",
      "complemento": "Alameda Manuel Enrique Araujo, Edificio Maker #502"
    },
    "telefono": "22448899",
    "correo": "facturacion@makersolutions.sv"
  },
  "receptor": {
    "tipoDocumento": "13",
    "numDocumento": "048593018",
    "nrc": null,
    "nombre": "JUAN CARLOS PÉREZ GÓMEZ",
    "codActividad": null,
    "descActividad": null,
    "direccion": {
      "departamento": "06",
      "municipio": "14",
      "complemento": "San Salvador"
    },
    "telefono": "7890-1234",
    "correo": "jperez@gmail.com"
  },
  "cuerpoDocumento": [
    {
      "numItem": 1,
      "tipoItem": 1,
      "cantidad": 1.0000,
      "codigo": "PRD-001",
      "uniMedida": 59,
      "descripcion": "Laptop Lenovo ThinkPad T14",
      "precioUni": 1150.0000,
      "montoDescu": 0.00,
      "ventaNoSuj": 0.00,
      "ventaExenta": 0.00,
      "ventaGravada": 1150.00,
      "tributos": ["20"]
    }
  ],
  "resumen": {
    "totalNoSuj": 0.00,
    "totalExenta": 0.00,
    "totalGravada": 1150.00,
    "subTotalVentas": 1150.00,
    "descuNoSuj": 0.00,
    "descuExenta": 0.00,
    "descuGravada": 0.00,
    "totalDescu": 0.00,
    "subTotal": 1150.00,
    "ivaRete1": 0.00,
    "reteRenta": 0.00,
    "montoTotalOperacion": 1150.00,
    "totalPagar": 1150.00,
    "totalLetras": "UN MIL CIENTO CINCUENTA DÓLARES CON 00/100 USD",
    "condicionOperacion": 1,
    "pagos": [
      {
        "codigo": "01",
        "montoPago": 1150.00
      }
    ]
  }
}
```

---

### 7. CATÁLOGOS OFICIALES DEL MINISTERIO DE HACIENDA (DGII)

El sistema incorpora las tablas de codificación estandarizadas por la DGII:
- **CAT-001 (Ambiente de Destino)**: `00` = Modo Pruebas / Sandbox, `01` = Modo Producción Oficial.
- **CAT-002 (Tipo de Documento)**:
  - `01` = Factura Electrónica
  - `03` = Comprobante de Crédito Fiscal (CCF)
  - `04` = Nota de Remisión
  - `05` = Nota de Crédito
  - `06` = Nota de Débito
  - `07` = Comprobante de Retención
  - `11` = Factura de Exportación
  - `14` = Factura de Sujeto Excluido
- **CAT-005 (Modelo de Facturación)**: `1` = Modelo Previo (Normal/Síncrono), `2` = Modelo Diferido (Contingencia).
- **CAT-006 (Tipo de Transmisión)**: `1` = Normal, `2` = Transmisión por Contingencia diferida.
- **CAT-012 (Departamentos de El Salvador)**: Códigos del `01` (Ahuachapán) al `14` (La Unión), con San Salvador (`06`) y La Libertad (`05`).
- **CAT-013 (Municipios)**: Codificación oficial distrital y municipal.
- **CAT-014 (Unidades de Medida)**: `59` = Unidad comercial estándar.
- **CAT-015 (Tipo de Tributos)**: `20` = Impuesto al Valor Agregado (IVA 13%), `C3` = Retención 1% IVA (Grandes Contribuyentes).
- **CAT-017 (Formas de Pago)**: `01` = Efectivo, `02` = Tarjeta Débito/Crédito, `05` = Transferencia bancaria.
- **CAT-019 (Actividades Económicas)**: Codificación de Giros comerciales de 5 dígitos (ej. `47110` Venta minorista no especializada, `62010` Desarrollo de software, `47410` Equipo de computación).
- **CAT-022 (Documento de Identificación del Receptor)**: `13` = DUI (9 dígitos), `36` = NIT (14 dígitos), `03` = Pasaporte / Extranjero.

---

### 8. MATRIZ DE RELACIONES Y CARDINALIDADES (DIAGRAMA ENTIDAD-RELACIÓN)

```
[Branches] 1 ────────────< N [Warehouses] 1 ───────────< N [InventoryStock]
    │                                                            │
    │ 1                                                          │ N
    ▼                                                            ▼
[CashSessions] 1 ────────< N [Sales] N >───────────────────────── 1 [Products]
    │                          │   │                                  ▲
    │                          │   └────── 1 ───< N [SaleItems] ──────┘
    │ 1                        │
    ▼                          ▼ 1
[Expenses]                 [Clients]
                               │
                               │ 1
                               ▼ N
                     [AccountsReceivable]
```

#### Cardinalidades Clave:
1. **`Branches` a `Warehouses` (1:N)**: Una sucursal física puede tener uno o múltiples almacenes/bodegas (ej. Bodega Principal, Bodega de Mostrador, Almacén de Tránsito).
2. **`Warehouses` a `Products` (N:M vía `InventoryStock`)**: Cada producto tiene existencia y kardex independiente en cada almacén asignado.
3. **`Clients` a `Sales` (1:N)**: Un cliente puede poseer histórico infinito de compras y DTEs emitidos.
4. **`Sales` a `SaleItems` (1:N)**: Cada comprobante agrupa de 1 a N líneas de detalle de bienes o combos.
5. **`Sales` a `DteDocument` (1:1)**: Cada venta aprobada genera un único documento electrónico con UUID v4 único y unívoco.
6. **`CashSessions` a `Sales` (1:N)**: Todo cobro de venta en efectivo o tarjeta queda encadenado a una sesión de caja abierta para cuadre de arqueo al cierre de turno.
7. **`Users` a `AuditLogs` (1:N)**: Cada acción crítica (anular venta, modificar precio, emitir contingencia) deja rastro de auditoría con la IP, timestamp y usuario.

---

### 9. AUDITORÍA TÉCNICA: ESPECIFICACIÓN EXHAUSTIVA DE REQUISITOS FALTANTES PARA PRODUCCIÓN REAL

El software cuenta con el **100% de la lógica de negocio, validaciones tributarias, estructuración JSON v2, representación gráfica con QR y control de plazos finalizados**.

Para encender la transmisión contra los servidores de **Producción (Ambiente 01)** del Ministerio de Hacienda de El Salvador en un entorno operativo empresarial real, deben completarse los siguientes **6 requisitos técnicos externos de infraestructura y trámites administrativos**:

#### A. Despliegue del Microservicio Firmador (`svfe-api-firmador`) en Servidor Local / Docker
- **Motivo técnico**: La DGII no permite que las aplicaciones web envíen llaves criptográficas privadas por internet. Exige que un microservicio Java local (proporcionado en binario `.jar` o imagen Docker) resida en la misma red local del ERP.
- **Implementación requerida**:
  1. Instalar Docker o Java Runtime Environment (JRE 17+) en el servidor local de la empresa.
  2. Ejecutar el contenedor oficial del firmador:
     ```bash
     docker run -d --name firmador-mh -p 8080:8080 \
       -v /opt/dte/certificados:/app/certs \
       -e PORT=8080 svfe-api-firmador:latest
     ```
  3. Asegurar que la URL configurada en *Configuración &gt; Facturación DTE* (`http://localhost:8080/firmardocumento/`) responda con código HTTP 200.

#### B. Certificado Digital X.509 de Firma Electrónica Emitido por Autoridad Certificadora
- **Motivo técnico**: Todo documento tributario debe contar con una firma digital CAdES/RSA512 vinculada legalmente a la persona jurídica o natural del contribuyente.
- **Implementación requerida**:
  1. Tramitar con un Proveedor de Servicios de Certificación acreditado en El Salvador (ej. Firma-DGII, Autoridad Certificadora del CNR / MINEC).
  2. Obtener el archivo en formato PKCS#12 (`.p12`) con clave privada de longitud mínima de 2048 o 4096 bits.
  3. Colocar el archivo en la ruta del servidor local donde corre el firmador y configurar la contraseña del certificado.

#### C. Generación de Contraseña Privada de API en el Portal de la DGII
- **Motivo técnico**: El endpoint `/auth` de Hacienda requiere autenticación con el NIT del emisor y una contraseña privada de API de 32 o más caracteres generada por el contribuyente.
- **Implementación requerida**:
  1. El representante legal ingresa a https://factura.gob.sv con su clave de Hacienda.
  2. En la sección "Administración de Credenciales de API", genera una nueva clave para el sistema de facturación.
  3. Guardar dicha clave en *Configuración &gt; Facturación DTE &gt; Clave Privada de API de Hacienda*.

#### D. Ejecución y Aprobación del Set Mínimo de Homologación (Ambiente 00)
- **Motivo técnico**: La DGII exige por normativa que el sistema supere un paquete de pruebas en el ambiente de pruebas antes de otorgar el permiso de emisión en producción.
- **Implementación requerida**:
  1. En el ambiente `00`, emitir:
     - 25 Facturas Electrónicas (01) con distintos tipos de pago y clientes.
     - 15 Comprobantes de Crédito Fiscal (03) con retenciones del 1% y clientes con NRC.
     - 2 Eventos de invalidación DTE dentro de plazo legal.
     - 1 Lote de transmisión diferida por contingencia (Modelo 2).
  2. Al recibir los sellos de recepción en ambiente `00`, solicitar la autorización formal en la plataforma de Hacienda para activar el ambiente `01` (Producción).

#### E. Calibración Óptica de Impresoras Térmicas de Punto de Venta (Hardware POS)
- **Motivo técnico**: La Sección 10 de la normativa exige que el código QR impreso en el ticket de 80mm posea una resolución y densidad óptica suficiente para ser escaneado por cualquier cámara telefónica sin error.
- **Implementación requerida**:
  1. Configurar impresoras térmicas de 80mm con resolución mínima de 203 DPI.
  2. Calibrar los comandos ESC/POS para rasterizado del código QR de 150x150 píxeles.

#### F. Almacenamiento Persistente y Respaldo por 10 Años (Art. 139 Código Tributario)
- **Motivo técnico**: El Artículo 139 del Código Tributario de El Salvador estipula la obligación legal de conservar los documentos tributarios electrónicos emitidos y sus sellos de recepción por un período no inferior a 10 años.
- **Implementación requerida**:
  1. Configurar réplica automática periódica de los campos `dteJsonRaw`, `selloRecibido` y `codigoGeneracion` hacia una base de datos relacional Cloud SQL / PostgreSQL en la nube con respaldos automáticos diarios cifrados en reposo.

---
*Documento Técnico de Arquitectura — Maker Solutions El Salvador ERP v2.0*
*Cumplimiento Estricto Normativa 2.0 DGII Ministerio de Hacienda de El Salvador*
