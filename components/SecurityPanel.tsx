
import React, { useState, useEffect, useCallback } from 'react';
import { User, PermitRequest, PermitStatus, ReturnType } from '../types';
import { STATUS_CONFIG } from '../constants';
import ConfirmModal from './ConfirmModal';

interface SecurityPanelProps {
  requests: PermitRequest[];
  onSecurityAction: (id: string, action: 'exit' | 'return') => void;
}

const SecurityPanel: React.FC<SecurityPanelProps> = ({ requests, onSecurityAction }) => {
  const [filters, setFilters] = useState({
    employeeId: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  
  const [filteredData, setFilteredData] = useState<PermitRequest[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'danger' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
  });

  const applyFilters = useCallback((forceAll: boolean = false) => {
    const results = requests.filter(req => {
      if (forceAll) return true;

      const matchId = !filters.employeeId || req.employeeId.includes(filters.employeeId);
      const matchStatus = !filters.status || req.status === filters.status;
      const matchDateFrom = !filters.dateFrom || req.date >= filters.dateFrom;
      const matchDateTo = !filters.dateTo || req.date <= filters.dateTo;
      
      return matchId && matchStatus && matchDateFrom && matchDateTo;
    });
    setFilteredData(results);
    setHasSearched(true);
  }, [requests, filters]);

  useEffect(() => {
    if (hasSearched) {
      applyFilters();
    }
  }, [requests, hasSearched, applyFilters]);

  const handleFilterClick = () => {
    const isFilterEmpty = !filters.employeeId && !filters.status && !filters.dateFrom && !filters.dateTo;
    
    if (isFilterEmpty) {
      confirmAction(
        'Cargar todo el historial',
        'No has aplicado filtros. ¿Deseas visualizar todas las solicitudes históricas registradas en portería?',
        'info',
        () => applyFilters(true)
      );
    } else {
      applyFilters();
    }
  };

  const clearFilters = () => {
    setFilters({ employeeId: '', status: '', dateFrom: '', dateTo: '' });
    setFilteredData([]);
    setHasSearched(false);
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  const confirmAction = (title: string, message: string, type: 'success' | 'danger' | 'info', action: () => void) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      onConfirm: () => {
        action();
        closeModal();
      }
    });
  };

  const showHistoryDetails = (req: PermitRequest) => {
    const history = [
      { label: 'Solicitud', value: `${req.date} ${req.time}hs` },
      { label: 'Validado por RRHH', value: req.hrApprovalDate ? new Date(req.hrApprovalDate).toLocaleString() : 'Pendiente' },
      { label: 'Salida Portería', value: req.securityExitDate ? new Date(req.securityExitDate).toLocaleString() : 'No Registrada' },
      { label: 'Regreso Portería', value: req.securityReturnDate ? new Date(req.securityReturnDate).toLocaleString() : 'No Registrada' },
    ];

    const message = history.map(h => `${h.label}: ${h.value}`).join('\n');
    alert(`Detalle del Tránsito - ID ${req.id}\n\n${message}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <ConfirmModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Control de Portería</h2>
          <p className="text-slate-500 font-medium">Registro de ingresos/egresos y consulta de movimientos</p>
        </div>
      </div>

      {/* Panel de Filtros */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Legajo / ID</label>
            <input 
              type="text" 
              placeholder="Escanear o buscar ID..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
              value={filters.employeeId}
              onChange={(e) => setFilters({...filters, employeeId: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Estado</label>
            <select 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">Todos los tránsitos</option>
              {Object.values(PermitStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Desde</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Hasta</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
            />
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={handleFilterClick}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <i className="fas fa-search"></i> BUSCAR REGISTROS
          </button>
          <button 
            onClick={clearFilters}
            className="bg-white text-slate-400 hover:text-slate-600 px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all border border-slate-100"
          >
            <i className="fas fa-eraser"></i> LIMPIAR
          </button>
        </div>
      </div>

      {/* Grilla de Resultados */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-100 overflow-hidden">
        {!hasSearched ? (
          <div className="py-24 text-center px-6">
            <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-door-open text-indigo-300 text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Monitor de Accesos</h3>
            <p className="text-slate-400 font-medium max-w-xs mx-auto">Realice una búsqueda para validar permisos de salida o registrar re-ingresos de personal.</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-24 text-center px-6">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
              <i className="fas fa-id-badge text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No se hallaron solicitudes</h3>
            <p className="text-slate-400 font-medium">Verifique los filtros o el número de legajo ingresado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sector</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado de Permiso</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acciones de Portería</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredData.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 group-hover:text-indigo-600">{req.employeeName}</span>
                        <span className="text-[10px] text-slate-400 font-black">LEGAJO: {req.employeeId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-500 uppercase">{req.sector}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${STATUS_CONFIG[req.status]?.color}`}>
                        {STATUS_CONFIG[req.status]?.icon}
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-3">
                        {req.status === PermitStatus.APPROVED && (
                          <button 
                            onClick={() => confirmAction(
                              'Confirmar Salida', 
                              `¿Registrar salida oficial de ${req.employeeName}?`, 
                              'info', 
                              () => onSecurityAction(req.id, 'exit')
                            )}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                          >
                            <i className="fas fa-sign-out-alt"></i> REGISTRAR SALIDA
                          </button>
                        )}
                        
                        {req.status === PermitStatus.EXITED && req.returnType === ReturnType.RETURNS && (
                          <button 
                            onClick={() => confirmAction(
                              'Confirmar Regreso', 
                              `¿Registrar re-ingreso de ${req.employeeName} a planta?`, 
                              'success', 
                              () => onSecurityAction(req.id, 'return')
                            )}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                          >
                            <i className="fas fa-sign-in-alt"></i> REGISTRAR REGRESO
                          </button>
                        )}

                        <button 
                          onClick={() => showHistoryDetails(req)}
                          className="bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 p-2.5 rounded-xl transition-all"
                          title="Info Tránsito"
                        >
                          <i className="fas fa-clock-rotate-left"></i>
                        </button>
                      </div>
                    </td>
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

export default SecurityPanel;
