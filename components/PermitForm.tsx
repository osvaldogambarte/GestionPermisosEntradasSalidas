
import React, { useState } from 'react';
import { ExitType, ReturnType } from '../types';

interface PermitFormProps {
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const PermitForm: React.FC<PermitFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: ExitType.PLANNED,
    returnType: ReturnType.RETURNS,
    motive: '',
    willPresentProof: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de fecha para salidas imprevistas
    if (formData.type === ExitType.UNPLANNED) {
      const today = new Date().toISOString().split('T')[0];
      if (formData.date < today) {
        alert('❌ Error de validación: Para salidas imprevistas, la fecha no puede ser anterior al día de hoy.');
        return;
      }
    }

    onSubmit(formData);
  };

  return (
    <div className="bg-white shadow-2xl shadow-indigo-100 rounded-3xl border border-indigo-50 overflow-hidden max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3 backdrop-blur-sm">
          <i className="fas fa-feather-alt text-xl"></i>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Nueva Solicitud</h2>
        <p className="text-indigo-100 text-sm mt-1 font-medium">Completa los detalles para tu permiso de salida</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-indigo-900/70 mb-2 ml-1">Tipo de Salida</label>
            <div className="flex bg-indigo-50/50 p-1.5 rounded-2xl border border-indigo-100">
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${formData.type === ExitType.PLANNED ? 'bg-white shadow-md text-indigo-600' : 'text-indigo-400 hover:text-indigo-600'}`}
                onClick={() => setFormData({...formData, type: ExitType.PLANNED})}
              >
                Previsto
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${formData.type === ExitType.UNPLANNED ? 'bg-white shadow-md text-indigo-600' : 'text-indigo-400 hover:text-indigo-600'}`}
                onClick={() => setFormData({...formData, type: ExitType.UNPLANNED})}
              >
                Imprevisto
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-indigo-900/70 mb-2 ml-1">Condición de Regreso</label>
            <div className="flex bg-indigo-50/50 p-1.5 rounded-2xl border border-indigo-100">
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${formData.returnType === ReturnType.RETURNS ? 'bg-white shadow-md text-indigo-600' : 'text-indigo-400 hover:text-indigo-600'}`}
                onClick={() => setFormData({...formData, returnType: ReturnType.RETURNS})}
              >
                Regresa
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${formData.returnType === ReturnType.NO_RETURN ? 'bg-white shadow-md text-indigo-600' : 'text-indigo-400 hover:text-indigo-600'}`}
                onClick={() => setFormData({...formData, returnType: ReturnType.NO_RETURN})}
              >
                No Regresa
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-indigo-900/70 mb-2 ml-1">Fecha</label>
            <div className="relative">
              <i className="fas fa-calendar absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300"></i>
              <input
                type="date"
                className="w-full pl-11 pr-4 py-3.5 bg-indigo-50/30 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-indigo-900 font-medium"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-indigo-900/70 mb-2 ml-1">Hora de salida</label>
            <div className="relative">
              <i className="fas fa-clock absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300"></i>
              <input
                type="time"
                className="w-full pl-11 pr-4 py-3.5 bg-indigo-50/30 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none text-indigo-900 font-medium"
                value={formData.time}
                onChange={(e) => setFormData({...formData, time: e.target.value})}
                required
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-indigo-900/70 mb-2 ml-1">¿Por qué necesitas salir?</label>
          <textarea
            className="w-full px-5 py-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none min-h-[120px] text-indigo-900 font-medium placeholder:text-indigo-200"
            placeholder="Ej: Tengo una cita médica programada..."
            value={formData.motive}
            onChange={(e) => setFormData({...formData, motive: e.target.value})}
            required
          />
        </div>

        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
          <label className="block text-sm font-bold text-indigo-900 mb-4">¿Adjuntarás un justificante?</label>
          <div className="flex gap-8">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="proof"
                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-indigo-300"
                checked={formData.willPresentProof}
                onChange={() => setFormData({...formData, willPresentProof: true})}
              />
              <span className="text-sm font-bold text-indigo-700 group-hover:text-indigo-900 transition-colors">Sí, presentaré comprobante</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="radio"
                name="proof"
                className="w-5 h-5 text-indigo-600 focus:ring-indigo-500 border-indigo-300"
                checked={!formData.willPresentProof}
                onChange={() => setFormData({...formData, willPresentProof: false})}
              />
              <span className="text-sm font-bold text-indigo-700 group-hover:text-indigo-900 transition-colors">No es necesario</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-200 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isLoading ? (
            <i className="fas fa-circle-notch fa-spin text-xl"></i>
          ) : (
            <>
              <i className="fas fa-check-circle text-xl"></i>
              SOLICITAR PERMISO
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default PermitForm;
