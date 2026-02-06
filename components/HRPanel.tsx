
import React, { useState, useEffect, useCallback } from 'react';
import { PermitRequest, PermitStatus, UserRole } from '../types';
import { STATUS_CONFIG } from '../constants';
import ConfirmModal from './ConfirmModal';

interface HRPanelProps {
  requests: PermitRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const HRPanel: React.FC<HRPanelProps> = ({ requests, onApprove, onReject }) => {
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

  // Función de filtrado extraída para ser reutilizable
  const applyFilters = useCallback(() => {
    const results = requests.filter(req => {
      const matchId = !filters.employeeId || req.employeeId.includes(filters.employeeId);
      const matchStatus = !filters.status || req.status === filters.status;
      const matchDateFrom = !filters.dateFrom || req.date >= filters.dateFrom;
      const matchDateTo = !filters.dateTo || req.date <= filters.dateTo;
      
      return matchId && matchStatus && matchDateFrom && matchDateTo;
    });
    setFilteredData(results);
  }, [requests, filters]);

  // Efecto para refrescar la grilla automáticamente cuando cambian los requests globales
  useEffect(() => {
    if (hasSearched) {
      applyFilters();
    }
  }, [requests, hasSearched, applyFilters]);

  const handleFilterClick = () => {
    applyFilters();
    setHasSearched(true);
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
          <h2 className="text-3xl font-black text-indigo-950 tracking-tight">Panel de Auditoría RRHH</h2>
          <p className="text-indigo-400 font-medium">Consulta histórica y gestión global de permisos</p>
        </div>
      </div>

      {/* Panel de Filtros */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-indigo-50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-[10px] font-black text-indigo-300 uppercase mb-2 ml-1 tracking-widest">Legajo / ID</label>
            <input 
              type="text" 
              placeholder="Buscar por ID..."
              className="w-full px-4 py-3 bg-indigo-50/30 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-900"
              value={filters.employeeId}
              onChange={(e) => setFilters({...filters, employeeId: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-indigo-300 uppercase mb-2 ml-1 tracking-widest">Estado</label>
            <select 
              className="w-full px-4 py-3 bg-indigo-50/30 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-900"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value as PermitStatus})}
            >
              <option value="">Todos los estados</option>
              {Object.values(PermitStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-indigo-300 uppercase mb-2 ml-1 tracking-widest">Desde</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 bg-indigo-50/30 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-900"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-indigo-300 uppercase mb-2 ml-1 tracking-widest">Hasta</label>
            <input 
              type="date" 
              className="w-full px-4 py-3 bg-indigo-50/30 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-indigo-900"
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
            <i className="fas fa-filter"></i> APLICAR FILTROS
          </button>
          <button 
            onClick={clearFilters}
            className="bg-white text-indigo-400 hover:text-indigo-600 px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all border border-indigo-50"
          >
            <i className="fas fa-eraser"></i> QUITAR FILTROS
          </button>
        </div>
      </div>

      {/* Grilla de Resultados */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-indigo-50 overflow-hidden">
        {!hasSearched ? (
          <div className="py-24 text-center px-6">
            <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-search text-indigo-200 text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-indigo-900 mb-2">Inicie una búsqueda</h3>
            <p className="text-indigo-400 font-medium max-w-xs mx-auto">Utilice los filtros superiores para visualizar la información del personal.</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="py-24 text-center px-6">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-200">
              <i className="fas fa-times-circle text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-red-900 mb-2">Sin resultados</h3>
            <p className="text-red-400 font-medium">No se encontraron permisos que coincidan con los criterios aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-indigo-50/50 border-b border-indigo-100">
                  <th className="px-6 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Empleado</th>
                  <th className="px-6 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Fecha / Hora</th>
                  <th className="px-6 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Sector</th>
                  <th className="px-6 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-widest">Doc</th>
                  <th className="px-6 py-5 text-[10px] font-black text-indigo-400 uppercase tracking-widest text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-50">
                {filteredData.map(req => (
                  <tr key={req.id} className="hover:bg-indigo-50/20 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-indigo-900 group-hover:text-indigo-600">{req.employeeName}</span>
                        <span className="text-[10px] text-indigo-300 font-black tracking-tighter">LEGAJO: {req.employeeId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-indigo-800">{req.date}</span>
                        <span className="text-[10px] text-indigo-400 font-medium">{req.time} hs</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-indigo-700 uppercase">{req.sector}</td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${STATUS_CONFIG[req.status]?.color}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      {req.proofData ? (
                        <button 
                          onClick={() => {
                            const win = window.open();
                            win?.document.write(`<iframe src="${req.proofData}" frameborder="0" style="border:0; width:100%; height:100%;" allowfullscreen></iframe>`);
                          }}
                          className="text-green-500 hover:text-green-700 transition-colors"
                        >
                          <i className="fas fa-file-alt text-xl"></i>
                        </button>
                      ) : (
                        <i className="fas fa-minus text-indigo-100"></i>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center gap-2">
                        {req.status === PermitStatus.PENDING_HR && (
                          <>
                            <button 
                              onClick={() => confirmAction(
                                'Aprobar Validación', 
                                `¿Confirmas la validación definitiva del permiso para ${req.employeeName}?`, 
                                'success', 
                                () => onApprove(req.id)
                              )}
                              className="bg-green-100 text-green-600 hover:bg-green-600 hover:text-white p-2 rounded-xl transition-all"
                              title="Validar"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button 
                              onClick={() => confirmAction(
                                'Rechazar Solicitud', 
                                `¿Estás seguro de rechazar formalmente la solicitud de ${req.employeeName}?`, 
                                'danger', 
                                () => onReject(req.id)
                              )}
                              className="bg-red-100 text-red-600 hover:bg-red-600 hover:text-white p-2 rounded-xl transition-all"
                              title="Rechazar"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => alert(`Historial del permiso ${req.id}:\n- Solicitado: ${req.date}\n- Jefe Approval: ${req.bossApprovalDate || 'N/A'}\n- HR Approval: ${req.hrApprovalDate || 'N/A'}`)}
                          className="bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white p-2 rounded-xl transition-all"
                        >
                          <i className="fas fa-history"></i>
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

export default HRPanel;
