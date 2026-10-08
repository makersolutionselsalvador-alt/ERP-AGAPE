import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Boxes,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Printer,
  ChevronRight,
  Users,
  Coins,
  Package,
  Layers
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    sales,
    products,
    combos,
    promotions,
    clients,
    activeCashSession,
    lowStockProducts,
    accountsReceivable,
    setCurrentModule,
    setSelectedSaleForTicket
  } = useApp();

  // Metrics calculation
  const totalSalesAmount = sales
    .filter(s => s.status !== 'Anulada')
    .reduce((sum, s) => sum + s.total, 0);

  const totalCostAmount = sales
    .filter(s => s.status !== 'Anulada')
    .reduce((sum, s) => sum + s.costTotal, 0);

  const totalProfit = totalSalesAmount - totalCostAmount;
  const profitMargin = totalSalesAmount > 0 ? (totalProfit / totalSalesAmount) * 100 : 0;

  const totalInventoryValue = products.reduce((acc, p) => {
    const totalQty = Object.values(p.warehouseStock || {}).reduce((a, b) => a + b, 0);
    return acc + totalQty * p.costPrice;
  }, 0);

  const totalPendingReceivable = accountsReceivable
    .filter(a => a.status === 'PENDIENTE' || a.status === 'VENCIDO')
    .reduce((sum, a) => sum + a.balance, 0);

  // Top products by sold quantity
  const productSalesMap: Record<string, { name: string; quantity: number; revenue: number }> = {};
  sales
    .filter(s => s.status !== 'Anulada')
    .forEach(sale => {
      sale.items.forEach(item => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        productSalesMap[item.productId].quantity += item.quantity;
        productSalesMap[item.productId].revenue += item.total;
      });
    });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Recent 5 sales
  const recentSales = sales.slice(0, 5);

  // Mock days for weekly chart
  const weeklyData = [
    { day: 'Lun', amount: 840 },
    { day: 'Mar', amount: 1220 },
    { day: 'Mié', amount: 950 },
    { day: 'Jue', amount: 1680 },
    { day: 'Vie', amount: 2150 },
    { day: 'Sáb', amount: 2480 },
    { day: 'Hoy', amount: sales.slice(0, 3).reduce((acc, s) => acc + s.total, 0) || 1970 }
  ];
  const maxWeekly = Math.max(...weeklyData.map(d => d.amount), 2500);

  return (
    <div className="space-y-6">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Panel Principal & Operaciones (RF-071)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas comerciales en tiempo real, control de caja y salud del inventario.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentModule('pos-new-sale')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs transition-colors"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Punto de Venta</span>
          </button>
          <button
            onClick={() => setCurrentModule('purchases-new')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Package className="h-3.5 w-3.5 text-slate-500" />
            <span>Nueva Compra</span>
          </button>
          <button
            onClick={() => setCurrentModule('inventory-adjustments')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Boxes className="h-3.5 w-3.5 text-slate-500" />
            <span>Ajuste Stock</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ventas Totales */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Ventas Acumuladas</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ${totalSalesAmount.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-700 font-medium">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>{sales.length} transacciones registradas</span>
          </div>
        </div>

        {/* KPI 2: Utilidad Estimada */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Utilidad Bruta (RF-068)</span>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ${totalProfit.toFixed(2)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500">
            <span>Margen promedio:</span>
            <span className="font-semibold text-indigo-700 font-mono tabular-nums">
              {profitMargin.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* KPI 3: Cuentas por Cobrar */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Cuentas por Cobrar (RF-052)</span>
            <Users className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ${totalPendingReceivable.toFixed(2)}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="text-slate-500">Saldo pendiente</span>
            <button
              onClick={() => setCurrentModule('contacts-receivable')}
              className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
            >
              Ver cartera <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* KPI 4: Valorización de Inventario */}
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Valor de Inventario (RF-038)</span>
            <Boxes className="h-4 w-4 text-slate-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            ${totalInventoryValue.toFixed(2)}
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px]">
            <span className="text-slate-500">{products.length} productos activos</span>
            {lowStockProducts.length > 0 && (
              <span className="text-amber-700 font-semibold font-mono tabular-nums">
                {lowStockProducts.length} en bajo stock
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Chart & Side Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Bar Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Tendencia de Ventas Semanal (RF-064)
              </h2>
              <p className="text-xs text-slate-500">
                Comparativa de ingresos por día de facturación
              </p>
            </div>
            <button
              onClick={() => setCurrentModule('reports-hub')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
            >
              <span>Ver reporte completo</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-56 w-full pt-4 flex items-end justify-between gap-2 border-b border-slate-100 pb-2">
            {weeklyData.map((d, index) => {
              const heightPercent = Math.max(12, Math.round((d.amount / maxWeekly) * 100));
              const isToday = index === weeklyData.length - 1;

              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                  {/* Tooltip value */}
                  <span className="text-[10px] font-mono tabular-nums text-slate-500 group-hover:text-indigo-600 group-hover:font-bold transition-colors">
                    ${d.amount}
                  </span>
                  {/* Bar */}
                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t-md h-40 flex items-end overflow-hidden">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        isToday
                          ? 'bg-indigo-600 group-hover:bg-indigo-700'
                          : 'bg-slate-300 group-hover:bg-indigo-400'
                      }`}
                    />
                  </div>
                  {/* Label */}
                  <span className={`text-xs ${isToday ? 'font-bold text-indigo-700' : 'text-slate-500'}`}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Periodo: Semana en curso</span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-slate-300 inline-block" />
                Días anteriores
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-indigo-600 inline-block" />
                Ventas de hoy
              </span>
            </div>
          </div>
        </div>

        {/* Operational Highlights / Alerts */}
        <div className="space-y-4">
          {/* Cash Register State Card */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Control de Caja (RF-055 / RF-056)
              </span>
              <Coins className="h-4 w-4 text-emerald-600" />
            </div>

            {activeCashSession ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Estado de turno:</span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Abierta ({activeCashSession.code})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Cajero asignado:</span>
                  <span className="text-xs font-medium text-slate-900">{activeCashSession.userName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Efectivo en caja:</span>
                  <span className="text-base font-bold text-slate-900 font-mono tabular-nums">
                    ${activeCashSession.expectedCash.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setCurrentModule('cash-new-expense')}
                    className="py-1.5 px-2 text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-center"
                  >
                    + Registrar Gasto
                  </button>
                  <button
                    onClick={() => setCurrentModule('cash-close')}
                    className="py-1.5 px-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors text-center"
                  >
                    Arqueo y Cierre
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 py-2 text-center">
                <p className="text-xs text-slate-500">
                  No hay una sesión de caja activa en esta terminal.
                </p>
                <button
                  onClick={() => setCurrentModule('cash-open')}
                  className="w-full py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Abrir Turno de Caja (RF-055)
                </button>
              </div>
            )}
          </div>

          {/* Low Stock Warning Card (RF-036) */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Alerta de Reabastecimiento
              </span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>

            {lowStockProducts.length > 0 ? (
              <div className="space-y-2.5">
                <p className="text-xs text-slate-600">
                  <strong className="text-amber-700 font-bold">{lowStockProducts.length} productos</strong> han
                  alcanzado o superado su nivel mínimo de stock de seguridad.
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {lowStockProducts.slice(0, 3).map(p => {
                    const currentStock = Object.values(p.warehouseStock || {}).reduce((a, b) => a + b, 0);
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-xs"
                      >
                        <span className="font-medium text-slate-800 truncate max-w-[150px]">{p.name}</span>
                        <span className="font-mono tabular-nums text-amber-800 font-bold">
                          {currentStock} / {p.minStock} min
                        </span>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentModule('inventory-low-stock')}
                  className="w-full py-1.5 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors text-center"
                >
                  Ver todos los productos críticos
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3 text-center">
                Inventario óptimo. Ningún producto en bajo stock.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Section: Top Products & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Products (RF-062) */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Productos Más Vendidos (RF-062)
              </h2>
              <p className="text-xs text-slate-500">Ranking por unidades desplazadas</p>
            </div>
            <button
              onClick={() => setCurrentModule('reports-hub')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Ver reporte
            </button>
          </div>

          <div className="space-y-3">
            {topProducts.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-400 w-4 text-center">
                    0{idx + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                    <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                      {item.quantity} unidades vendidas
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-slate-900 block tabular-nums">
                    ${item.revenue.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">volumen</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions Table (RF-048 / RF-049) */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Últimas Ventas Emitidas (RF-048)
              </h2>
              <p className="text-xs text-slate-500">Tickets y facturación reciente</p>
            </div>
            <button
              onClick={() => setCurrentModule('sales-list')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Consultar todas
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="pb-2">Ticket</th>
                  <th className="pb-2">Cliente</th>
                  <th className="pb-2">Método</th>
                  <th className="pb-2 text-right">Total</th>
                  <th className="pb-2 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSales.map(sale => (
                  <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 font-mono font-semibold text-slate-900">
                      {sale.ticketNumber}
                    </td>
                    <td className="py-2.5 text-slate-700 truncate max-w-[130px]">
                      {sale.clientName}
                    </td>
                    <td className="py-2.5">
                      <span className="text-[11px] text-slate-600">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${sale.total.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-center">
                      <button
                        onClick={() => setSelectedSaleForTicket(sale)}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                        title="Ver / Reimprimir ticket"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
