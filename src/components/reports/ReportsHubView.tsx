import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Users,
  Building2,
  Package,
  Boxes,
  DollarSign,
  PieChart
} from 'lucide-react';

type ReportTab = 
  | 'ventas' 
  | 'mas-vendidos' 
  | 'por-cliente' 
  | 'por-empleado' 
  | 'por-sucursal' 
  | 'utilidades' 
  | 'inventario-valorado' 
  | 'gastos';

export const ReportsHubView: React.FC = () => {
  const { sales, products, clients, employees, branches, expenses, companySettings } = useApp();

  const [activeTab, setActiveTab] = useState<ReportTab>('ventas');
  const [dateFilter, setDateFilter] = useState<'todo' | 'hoy' | 'mes'>('todo');

  const validSales = useMemo(() => sales.filter(s => s.status !== 'Anulada'), [sales]);

  // RF-061: Ventas Generales
  const totalSales = validSales.reduce((sum, s) => sum + s.total, 0);
  const totalCost = validSales.reduce((sum, s) => sum + s.costTotal, 0);
  const totalProfit = totalSales - totalCost;

  // RF-062: Más Vendidos
  const productPerformance = useMemo(() => {
    const map: Record<string, { name: string; code: string; quantity: number; revenue: number; cost: number; profit: number }> = {};
    validSales.forEach(s => {
      s.items.forEach(i => {
        if (!map[i.productId]) {
          map[i.productId] = {
            name: i.productName,
            code: i.productCode,
            quantity: 0,
            revenue: 0,
            cost: 0,
            profit: 0
          };
        }
        map[i.productId].quantity += i.quantity;
        map[i.productId].revenue += i.total;
        map[i.productId].cost += i.unitCost * i.quantity;
        map[i.productId].profit += i.total - (i.unitCost * i.quantity);
      });
    });
    return Object.values(map).sort((a, b) => b.quantity - a.quantity);
  }, [validSales]);

  // RF-063: Ventas por Cliente
  const salesByClient = useMemo(() => {
    const map: Record<string, { name: string; count: number; total: number }> = {};
    validSales.forEach(s => {
      if (!map[s.clientId]) {
        map[s.clientId] = { name: s.clientName, count: 0, total: 0 };
      }
      map[s.clientId].count += 1;
      map[s.clientId].total += s.total;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [validSales]);

  // RF-064: Ventas por Empleado
  const salesByEmployee = useMemo(() => {
    const map: Record<string, { name: string; count: number; total: number }> = {};
    validSales.forEach(s => {
      const seller = s.sellerName || 'Cajero';
      if (!map[seller]) {
        map[seller] = { name: seller, count: 0, total: 0 };
      }
      map[seller].count += 1;
      map[seller].total += s.total;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [validSales]);

  // RF-065: Ventas por Sucursal
  const salesByBranch = useMemo(() => {
    const map: Record<string, { name: string; count: number; total: number }> = {};
    validSales.forEach(s => {
      const br = branches.find(b => b.id === s.branchId);
      const name = br?.name || 'Sucursal Principal';
      if (!map[name]) {
        map[name] = { name, count: 0, total: 0 };
      }
      map[name].count += 1;
      map[name].total += s.total;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [validSales, branches]);

  // Export generic CSV
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = `reporte_${activeTab}_${new Date().toISOString().substring(0, 10)}.csv`;

    if (activeTab === 'ventas') {
      headers = ['Ticket', 'Fecha', 'Cliente', 'Método', 'Subtotal', 'IVA', 'Total', 'Utilidad'];
      rows = validSales.map(s => [
        s.ticketNumber,
        s.createdAt,
        `"${s.clientName}"`,
        s.paymentMethod,
        s.subtotal.toFixed(2),
        s.taxAmount.toFixed(2),
        s.total.toFixed(2),
        s.profitTotal.toFixed(2)
      ]);
    } else if (activeTab === 'mas-vendidos') {
      headers = ['Código', 'Producto', 'Unidades Vendidas', 'Ingresos Totales', 'Costo Total', 'Utilidad'];
      rows = productPerformance.map(p => [
        p.code,
        `"${p.name}"`,
        p.quantity,
        p.revenue.toFixed(2),
        p.cost.toFixed(2),
        p.profit.toFixed(2)
      ]);
    } else if (activeTab === 'utilidades') {
      headers = ['Producto', 'Unidades', 'Ingreso Venta', 'Costo Mercadería', 'Utilidad Neta', 'Margen %'];
      rows = productPerformance.map(p => {
        const margin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
        return [
          `"${p.name}"`,
          p.quantity,
          p.revenue.toFixed(2),
          p.cost.toFixed(2),
          p.profit.toFixed(2),
          margin.toFixed(1) + '%'
        ];
      });
    } else if (activeTab === 'por-cliente') {
      headers = ['Cliente', 'Transacciones', 'Monto Total Facturado'];
      rows = salesByClient.map(c => [`"${c.name}"`, c.count, c.total.toFixed(2)]);
    } else if (activeTab === 'por-empleado') {
      headers = ['Empleado / Cajero', 'Tickets Emitidos', 'Total Facturado'];
      rows = salesByEmployee.map(e => [`"${e.name}"`, e.count, e.total.toFixed(2)]);
    } else if (activeTab === 'por-sucursal') {
      headers = ['Sucursal', 'Transacciones', 'Ventas Totales'];
      rows = salesByBranch.map(b => [`"${b.name}"`, b.count, b.total.toFixed(2)]);
    } else if (activeTab === 'gastos') {
      headers = ['Código', 'Fecha', 'Categoría', 'Concepto', 'Beneficiario', 'Monto'];
      rows = expenses.map(e => [e.code, e.createdAt, e.category, `"${e.concept}"`, `"${e.paidTo}"`, e.amount.toFixed(2)]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = filename;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Centro de Reportes & Business Intelligence (RF-060 - RF-068)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Analítica de rendimiento comercial, márgenes de utilidad, rotación y ventas por canal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Imprimir Reporte</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Exportar CSV (RF-066)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('ventas')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'ventas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ventas (RF-061)
        </button>
        <button
          onClick={() => setActiveTab('utilidades')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'utilidades' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Utilidades (RF-068)
        </button>
        <button
          onClick={() => setActiveTab('mas-vendidos')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'mas-vendidos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Productos Más Vendidos (RF-062)
        </button>
        <button
          onClick={() => setActiveTab('por-cliente')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'por-cliente' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ventas por Cliente (RF-063)
        </button>
        <button
          onClick={() => setActiveTab('por-empleado')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'por-empleado' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ventas por Empleado (RF-064)
        </button>
        <button
          onClick={() => setActiveTab('por-sucursal')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'por-sucursal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Ventas por Sucursal (RF-065)
        </button>
        <button
          onClick={() => setActiveTab('gastos')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeTab === 'gastos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Gastos (RF-059)
        </button>
      </div>

      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] text-slate-500 block">Ingresos Brutos Facturados</span>
          <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            ${totalSales.toFixed(2)}
          </span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] text-slate-500 block">Costo de Ventas (COGS)</span>
          <span className="text-xl font-bold font-mono text-slate-700 tabular-nums">
            ${totalCost.toFixed(2)}
          </span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] text-slate-500 block">Utilidad Bruta (RF-068)</span>
          <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
            +${totalProfit.toFixed(2)}
          </span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] text-slate-500 block">Margen Comercial Neto</span>
          <span className="text-xl font-bold font-mono text-indigo-700 tabular-nums">
            {totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>

      {/* ACTIVE REPORT TABLE VIEW */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* REPORTE DE VENTAS (RF-061) */}
        {activeTab === 'ventas' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Ticket</th>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Cliente</th>
                  <th className="py-2.5 px-3">Vendedor</th>
                  <th className="py-2.5 px-3">Método</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-right">IVA</th>
                  <th className="py-2.5 px-3 text-right">Total Facturado</th>
                  <th className="py-2.5 px-3 text-right">Utilidad Neta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {validSales.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.ticketNumber}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono tabular-nums">{s.createdAt}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{s.clientName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.sellerName}</td>
                    <td className="py-2.5 px-3">{s.paymentMethod}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">${s.subtotal.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">${s.taxAmount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">${s.total.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">+${s.profitTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORTE DE UTILIDADES (RF-068) */}
        {activeTab === 'utilidades' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3 text-right">Unidades Vendidas</th>
                  <th className="py-2.5 px-3 text-right">Costo Total Compra</th>
                  <th className="py-2.5 px-3 text-right">Ingreso Total Venta</th>
                  <th className="py-2.5 px-3 text-right">Utilidad Neta (RF-068)</th>
                  <th className="py-2.5 px-3 text-right">Margen Bruto %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productPerformance.map(p => {
                  const margin = p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0;
                  return (
                    <tr key={p.code} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.code}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{p.name}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{p.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">${p.cost.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900 tabular-nums">${p.revenue.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">+${p.profit.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700 tabular-nums">{margin.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* MAS VENDIDOS (RF-062) */}
        {activeTab === 'mas-vendidos' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Ranking</th>
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Descripción Producto</th>
                  <th className="py-2.5 px-3 text-right">Cantidad Desplazada</th>
                  <th className="py-2.5 px-3 text-right">Ingresos Generados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {productPerformance.map((p, idx) => (
                  <tr key={p.code} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-400">#0{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-900">{p.code}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{p.name}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">{p.quantity} unds</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 tabular-nums">${p.revenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VENTAS POR CLIENTE (RF-063) */}
        {activeTab === 'por-cliente' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Cliente / Empresa</th>
                  <th className="py-2.5 px-3 text-center">Frecuencia de Compra</th>
                  <th className="py-2.5 px-3 text-right">Total Facturado Acumulado</th>
                  <th className="py-2.5 px-3 text-right">Ticket Promedio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesByClient.map(c => (
                  <tr key={c.name} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums">{c.count} compras</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">${c.total.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">${(c.total / c.count).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VENTAS POR EMPLEADO (RF-064) */}
        {activeTab === 'por-empleado' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Ejecutivo / Cajero</th>
                  <th className="py-2.5 px-3 text-center">Tickets Procesados</th>
                  <th className="py-2.5 px-3 text-right">Venta Total Facturada</th>
                  <th className="py-2.5 px-3 text-right">Promedio por Ticket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesByEmployee.map(e => (
                  <tr key={e.name} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{e.name}</td>
                    <td className="py-2.5 px-3 text-center font-mono tabular-nums">{e.count}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700 tabular-nums">${e.total.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">${(e.total / e.count).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VENTAS POR SUCURSAL (RF-065) */}
        {activeTab === 'por-sucursal' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Sucursal / Establecimiento</th>
                  <th className="py-2.5 px-3 text-center">Órdenes Atendidas</th>
                  <th className="py-2.5 px-3 text-right">Ventas Totales</th>
                  <th className="py-2.5 px-3 text-right">Participación %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salesByBranch.map(b => {
                  const share = totalSales > 0 ? (b.total / totalSales) * 100 : 0;
                  return (
                    <tr key={b.name} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{b.name}</td>
                      <td className="py-2.5 px-3 text-center font-mono tabular-nums">{b.count}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">${b.total.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700 tabular-nums">{share.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* GASTOS (RF-059) */}
        {activeTab === 'gastos' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Fecha</th>
                  <th className="py-2.5 px-3">Rubro</th>
                  <th className="py-2.5 px-3">Concepto</th>
                  <th className="py-2.5 px-3">Beneficiario</th>
                  <th className="py-2.5 px-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{e.code}</td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono tabular-nums">{e.createdAt}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-700">{e.category}</td>
                    <td className="py-2.5 px-3 text-slate-800">{e.concept}</td>
                    <td className="py-2.5 px-3 text-slate-600">{e.paidTo}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600 tabular-nums">-${e.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
