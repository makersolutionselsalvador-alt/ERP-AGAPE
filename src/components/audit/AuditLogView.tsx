import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { History, Search, Filter, ShieldCheck, Download, FileSpreadsheet } from 'lucide-react';
import { AuditLog } from '../../types';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedAction, setSelectedAction] = useState<string>('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch =
        searchTerm === '' ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.requirementCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModule = selectedModule === 'all' || log.module === selectedModule;
      const matchesAction = selectedAction === 'all' || log.action === selectedAction;

      return matchesSearch && matchesModule && matchesAction;
    });
  }, [auditLogs, searchTerm, selectedModule, selectedAction]);

  const exportCsv = () => {
    const headers = ['ID', 'Fecha y Hora', 'Usuario', 'Módulo', 'Acción', 'Descripción', 'Requisito RF', 'IP Origen'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      `"${l.userName}"`,
      l.module,
      l.action,
      `"${l.description.replace(/"/g, '""')}"`,
      l.requirementCode,
      l.ipAddress || '127.0.0.1'
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `auditoria_operaciones_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
  };

  const getActionColor = (action: AuditLog['action']) => {
    switch (action) {
      case 'CREAR':
      case 'APERTURA':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'EDITAR':
      case 'AJUSTE':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'ANULAR':
      case 'ELIMINAR':
      case 'DESACTIVAR':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'COBRAR':
      case 'CIERRE':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Auditoría de Operaciones & Trazabilidad (RF-072)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Bitácora inmutable de eventos, cambios en registros, transacciones y control de cumplimiento normativo.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
          <span>Exportar Bitácora CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por usuario, descripción o código RF..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>

        <select
          value={selectedModule}
          onChange={e => setSelectedModule(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs"
        >
          <option value="all">Todos los módulos</option>
          <option value="Seguridad">Seguridad</option>
          <option value="Administración">Administración</option>
          <option value="Productos">Productos</option>
          <option value="Inventario">Inventario</option>
          <option value="Ventas">Ventas</option>
          <option value="Cotizaciones">Cotizaciones</option>
          <option value="Compras">Compras</option>
          <option value="Clientes">Clientes</option>
          <option value="Proveedores">Proveedores</option>
          <option value="Caja">Caja</option>
          <option value="Cuentas">Cuentas</option>
          <option value="Configuración">Configuración</option>
        </select>

        <select
          value={selectedAction}
          onChange={e => setSelectedAction(e.target.value)}
          className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs"
        >
          <option value="all">Todas las acciones</option>
          <option value="CREAR">CREAR</option>
          <option value="EDITAR">EDITAR</option>
          <option value="ANULAR">ANULAR</option>
          <option value="DESACTIVAR">DESACTIVAR</option>
          <option value="COBRAR">COBRAR</option>
          <option value="APERTURA">APERTURA</option>
          <option value="CIERRE">CIERRE</option>
          <option value="LOGIN">LOGIN</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold tracking-wider">
                <th className="py-2.5 px-3">Fecha y Hora</th>
                <th className="py-2.5 px-3">Usuario Responsable</th>
                <th className="py-2.5 px-3">Módulo</th>
                <th className="py-2.5 px-3">Acción</th>
                <th className="py-2.5 px-3">Descripción de la Operación</th>
                <th className="py-2.5 px-3 text-center">Requisito RF</th>
                <th className="py-2.5 px-3 font-mono text-[10px]">Terminal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2.5 px-3 text-slate-500 font-mono tabular-nums whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {log.module}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded border ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-800 leading-snug">
                    {log.description}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-mono text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                      {log.requirementCode}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px]">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
