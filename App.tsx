
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, PermitRequest, PermitStatus, ExitType, ReturnType } from './types';
import Layout from './components/Layout';
import PermitForm from './components/PermitForm';
import Dashboard from './components/Dashboard';
import HRPanel from './components/HRPanel';
import { analyzeMotive } from './services/geminiService';

// Mock DB Initial Data
const INITIAL_USERS: User[] = [
  { id: '1', name: 'Juan Perez', email: 'juan@empresa.com', role: UserRole.EMPLOYEE, sector: 'Producción' },
  { id: '2', name: 'Marta Gomez', email: 'marta@empresa.com', role: UserRole.MANAGER, sector: 'Producción' },
  { id: '3', name: 'Admin RRHH', email: 'rrhh@empresa.com', role: UserRole.HR, sector: 'RRHH' },
  { id: '4', name: 'Pedro Vigilante', email: 'porteria@empresa.com', role: UserRole.SECURITY, sector: 'Portería' },
];

const INITIAL_REQUESTS: PermitRequest[] = [
  {
    id: 'req_1',
    employeeId: '1',
    employeeName: 'Juan Perez',
    date: '2024-05-20',
    time: '14:30',
    type: ExitType.PLANNED,
    returnType: ReturnType.RETURNS,
    motive: 'Turno médico oftalmología en clínica céntrica.',
    willPresentProof: true,
    status: PermitStatus.PENDING_BOSS,
    sector: 'Producción'
  },
  {
    id: 'req_2',
    employeeId: '105',
    employeeName: 'Carlos Ruiz',
    date: '2024-05-18',
    time: '10:00',
    type: ExitType.UNPLANNED,
    returnType: ReturnType.NO_RETURN,
    motive: 'Urgencia familiar personal.',
    willPresentProof: false,
    status: PermitStatus.RETURNED,
    sector: 'Mantenimiento'
  }
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<PermitRequest[]>(INITIAL_REQUESTS);
  const [view, setView] = useState<'dashboard' | 'form' | 'login'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Handle Login Simulation (Mock API / SQL Server Logic)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulating API Latency
    setTimeout(() => {
      const user = INITIAL_USERS.find(u => u.email === loginForm.email);
      if (user) {
        setCurrentUser(user);
        setView('dashboard');
      } else {
        alert('Credenciales inválidas. Intente con: juan@empresa.com, marta@empresa.com, rrhh@empresa.com o porteria@empresa.com');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleCreateRequest = async (formData: any) => {
    if (!currentUser) return;
    setIsLoading(true);

    // Call AI to analyze motive as a value-add
    const aiAnalysis = await analyzeMotive(formData.motive);

    const newRequest: PermitRequest = {
      id: `req_${Date.now()}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      sector: currentUser.sector || 'N/A',
      status: PermitStatus.PENDING_BOSS,
      aiMotiveAnalysis: aiAnalysis ? JSON.stringify(aiAnalysis) : undefined,
      ...formData
    };

    setRequests(prev => [newRequest, ...prev]);
    setIsLoading(false);
    setView('dashboard');
  };

  const handleApprove = (id: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        if (req.status === PermitStatus.PENDING_BOSS) {
          return { ...req, status: PermitStatus.PENDING_HR, bossApprovalDate: new Date().toISOString() };
        }
        if (req.status === PermitStatus.PENDING_HR) {
          return { ...req, status: PermitStatus.APPROVED, hrApprovalDate: new Date().toISOString() };
        }
      }
      return req;
    }));
  };

  const handleReject = (id: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        if (req.status === PermitStatus.PENDING_BOSS) return { ...req, status: PermitStatus.REJECTED_BOSS };
        if (req.status === PermitStatus.PENDING_HR) return { ...req, status: PermitStatus.REJECTED_HR };
      }
      return req;
    }));
  };

  const handleSecurity = (id: string, action: 'exit' | 'return') => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        if (action === 'exit') return { ...req, status: PermitStatus.EXITED, securityExitDate: new Date().toISOString() };
        if (action === 'return') return { ...req, status: PermitStatus.RETURNED, securityReturnDate: new Date().toISOString() };
      }
      return req;
    }));
  };

  const handleUploadProof = (id: string, proofData: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, proofData };
      }
      return req;
    }));
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="inline-block bg-indigo-600 p-4 rounded-3xl shadow-2xl shadow-indigo-500/20 mb-6">
              <i className="fas fa-building-user text-white text-5xl"></i>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Acceso Corporativo</h1>
            <p className="text-slate-400">Ingrese sus credenciales de SQL Server</p>
          </div>

          <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Correo Electrónico</label>
                <div className="relative">
                  <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="usuario@empresa.com"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Contraseña</label>
                <div className="relative">
                  <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? <i className="fas fa-spinner fa-spin mr-2"></i> : 'ENTRAR AL SISTEMA'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
             <p className="text-xs text-slate-400 font-medium mb-2">Usuarios de prueba (simulando DB):</p>
             <div className="flex flex-wrap justify-center gap-2">
                {INITIAL_USERS.map(u => (
                  <button 
                    key={u.id}
                    onClick={() => setLoginForm({ email: u.email, password: '123' })}
                    className="text-[10px] bg-slate-700 hover:bg-slate-600 text-slate-300 px-2 py-1 rounded-md transition-colors"
                  >
                    {u.role}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={currentUser} onLogout={() => { setCurrentUser(null); setView('login'); }}>
      {view === 'dashboard' && currentUser && (
        currentUser.role === UserRole.HR ? (
          <HRPanel 
            requests={requests} 
            onApprove={handleApprove} 
            onReject={handleReject} 
          />
        ) : (
          <Dashboard 
            user={currentUser} 
            requests={requests} 
            onApprove={handleApprove}
            onReject={handleReject}
            onSecurityAction={handleSecurity}
            onUploadProof={handleUploadProof}
            onCreateRequest={() => setView('form')}
          />
        )
      )}
      {view === 'form' && (
        <div className="space-y-6">
           <button 
              onClick={() => setView('dashboard')}
              className="group flex items-center gap-2 text-indigo-500 hover:text-indigo-700 transition-all font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-indigo-50 w-fit"
            >
              <i className="fas fa-arrow-left transition-transform group-hover:-translate-x-1"></i> 
              Volver al panel
            </button>
           <PermitForm onSubmit={handleCreateRequest} isLoading={isLoading} />
        </div>
      )}
    </Layout>
  );
};

export default App;
