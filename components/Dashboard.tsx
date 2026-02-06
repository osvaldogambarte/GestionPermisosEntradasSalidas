
import React, { useRef, useState } from 'react';
import { User, UserRole, PermitRequest, PermitStatus } from '../types';
import { STATUS_CONFIG } from '../constants';
import ConfirmModal from './ConfirmModal';

interface DashboardProps {
  user: User;
  requests: PermitRequest[];
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
  onSecurityAction: (requestId: string, action: 'exit' | 'return') => void;
  onUploadProof: (requestId: string, proofData: string) => void;
  onCreateRequest: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  requests, 
  onApprove, 
  onReject, 
  onSecurityAction,
  onUploadProof,
  onCreateRequest 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentActionRequestId = useRef<string | null>(null);

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

  const filteredRequests = requests.filter(req => {
    if (user.role === UserRole.EMPLOYEE) return req.employeeId === user.id;
    if (user.role === UserRole.MANAGER) return req.sector === user.sector && req.status === PermitStatus.PENDING_BOSS;
    if (user.role === UserRole.HR) return req.status === PermitStatus.PENDING_HR || req.status === PermitStatus.APPROVED || req.status === PermitStatus.EXITED || req.status === PermitStatus.RETURNED;
    if (user.role === UserRole.SECURITY) return req.status === PermitStatus.APPROVED || req.status === PermitStatus.EXITED;
    return true;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && currentActionRequestId.current) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUploadProof(currentActionRequestId.current!, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = (id: string) => {
    currentActionRequestId.current = id;
    fileInputRef.current?.click();
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

  const getActionButtons = (req: PermitRequest) => {
    // Manager Actions
    if (user.role === UserRole.MANAGER && req.status === PermitStatus.PENDING_BOSS) {
      return (
        <div className="flex gap-2">
          <button 
            onClick={() => confirmAction('Aprobar Solicitud', `¿Confirmas la aprobación del permiso para ${req.employeeName}?`, 'success', () => onApprove(req.id))} 
            className="bg-green-500 hover:bg-green-600 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-90" 
            title="Aprobar"
          >
            <i className="fas fa-check"></i>
          </button>
          <button 
            onClick={() => confirmAction('Rechazar Solicitud', `¿Estás seguro de rechazar el permiso de ${req.employeeName}?`, 'danger', () => onReject(req.id))} 
            className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-90" 
            title="Rechazar"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      );
    }
    // HR Actions
    if (user.role === UserRole.HR && req.status === PermitStatus.PENDING_HR) {
      return (
        <div className="flex gap-2">
          <button 
            onClick={() => confirmAction('Validación RRHH', `¿Confirmas la validación final para ${req.employeeName}?`, 'success', () => onApprove(req.id))} 
            className="bg-indigo-500 hover:bg-indigo-600 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-90" 
            title="Aprobar RRHH"
          >
            <i className="fas fa-check-double"></i>
          </button>
          <button 
            onClick={() => confirmAction('Rechazo RRHH', `¿Deseas rechazar definitivamente la solicitud de ${req.employeeName}?`, 'danger', () => onReject(req.id))} 
            className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-xl transition-all shadow-md active:scale-90" 
            title="Rechazar RRHH"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      );
    }
    // Security Actions
    if (user.role === UserRole.SECURITY) {
      if (req.status === PermitStatus.APPROVED) {
        return (
          <button 
            onClick={() => confirmAction('Registrar Salida', `Confirmar salida física de ${req.employeeName} ahora.`, 'info', () => onSecurityAction(req.id, 'exit'))} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <i className="fas fa-door-open"></i> REGISTRAR SALIDA
          </button>
        );
      }
      if (req.status === PermitStatus.EXITED && req.returnType === 'Regresa') {
        return (
          <button 
            onClick={() => confirmAction('Registrar Regreso', `Confirmar re-ingreso de ${req.employeeName} a las instalaciones.`, 'success', () => onSecurityAction(req.id, 'return'))} 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-100 active:scale-95"
          >
            <i className="fas fa-house-user"></i> REGISTRAR REGRESO
          </button>
        );
      }
    }
    // Employee Proof Upload Action
    if (user.role === UserRole.EMPLOYEE && req.willPresentProof && !req.proofData) {
      if (req.status === PermitStatus.EXITED || req.status === PermitStatus.RETURNED) {
        return (
          <button 
            onClick={() => triggerUpload(req.id)}
            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-pulse transition-all shadow-md active:scale-95"
          >
            <i className="fas fa-file-upload"></i> SUBIR COMPROBANTE
          </button>
        );
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
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

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,.pdf" 
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Panel de Control</h2>
          <p className="text-slate-500 font-medium">Gestionando solicitudes de {user.role === UserRole.EMPLOYEE ? 'tus permisos' : 'personal'}</p>
        </div>
        {user.role === UserRole.EMPLOYEE && (
          <button 
            onClick={onCreateRequest}
            className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-200 transition-all active:scale-95"
          >
            <i className="fas fa-plus"></i> NUEVA SOLICITUD
          </button>
        )}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-indigo-100 py-20 flex flex-col items-center justify-center text-center px-6">
          <div className="bg-indigo-50 p-8 rounded-full mb-6">
            <i className="fas fa-inbox text-indigo-200 text-5xl"></i>
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Bandeja de entrada vacía</h3>
          <p className="text-slate-400 max-w-sm mx-auto font-medium">No hay trámites que requieran tu atención inmediata en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map(req => (
            <div key={req.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 overflow-hidden group flex flex-col">
              <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-5">
                  <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${STATUS_CONFIG[req.status]?.color || 'bg-gray-100'}`}>
                    {STATUS_CONFIG[req.status]?.icon}
                    {req.status}
                  </span>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">Fecha</p>
                    <p className="text-xs font-bold text-slate-600">{req.date}</p>
                  </div>
                </div>

                <div className="mb-5">
                  <h4 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">{req.employeeName}</h4>
                  <p className="text-xs text-indigo-400 font-bold uppercase tracking-tight">{req.sector}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-5 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                  <div>
                    <p className="text-[9px] font-black text-indigo-300 uppercase mb-1">Motivo</p>
                    <p className="text-xs font-bold text-indigo-900">{req.type}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-indigo-300 uppercase mb-1">Regreso</p>
                    <p className="text-xs font-bold text-indigo-900">{req.returnType}</p>
                  </div>
                </div>

                <div className="mb-5">
                  <p className="text-[9px] font-black text-slate-300 uppercase mb-1.5">Descripción</p>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium italic">"{req.motive}"</p>
                </div>

                {req.aiMotiveAnalysis && (
                   <div className="mb-5 p-3 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 shadow-sm">
                     <div className="flex items-center gap-2 text-[9px] font-black text-indigo-600 uppercase mb-2">
                       <i className="fas fa-wand-sparkles"></i> Asistente AI
                     </div>
                     <p className="text-xs text-indigo-900 font-bold leading-relaxed">
                       {JSON.parse(req.aiMotiveAnalysis).summary}
                     </p>
                   </div>
                )}

                {req.proofData && (
                  <div className="mt-4 p-3 border border-green-100 bg-green-50/50 rounded-2xl flex items-center justify-between group/proof">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-xl text-green-600">
                        <i className="fas fa-file-shield"></i>
                      </div>
                      <span className="text-[10px] font-black text-green-700 uppercase">Documento Listo</span>
                    </div>
                    <button 
                      onClick={() => {
                        const win = window.open();
                        win?.document.write(`<iframe src="${req.proofData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                      }}
                      className="bg-white text-green-600 hover:bg-green-600 hover:text-white p-2.5 rounded-xl shadow-sm transition-all active:scale-90"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                  </div>
                )}
              </div>

              <div className="px-6 py-5 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
                <div className="flex gap-2">
                  {req.willPresentProof && !req.proofData && (
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide border border-amber-200">Pendiente Doc</span>
                  )}
                  {req.willPresentProof && req.proofData && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wide border border-green-200">Verificado</span>
                  )}
                </div>
                {getActionButtons(req)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
