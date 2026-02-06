
import React from 'react';

export const COLORS = {
  primary: 'blue-600',
  secondary: 'gray-600',
  success: 'green-600',
  danger: 'red-600',
  warning: 'yellow-500',
};

export const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  'Pendiente Jefe': { label: 'Pendiente Jefe', color: 'bg-yellow-100 text-yellow-800', icon: <i className="fas fa-user-tie"></i> },
  'Rechazado por Jefe': { label: 'Rechazado por Jefe', color: 'bg-red-100 text-red-800', icon: <i className="fas fa-times-circle"></i> },
  'Pendiente RRHH': { label: 'Pendiente RRHH', color: 'bg-blue-100 text-blue-800', icon: <i className="fas fa-users-cog"></i> },
  'Rechazado por RRHH': { label: 'Rechazado por RRHH', color: 'bg-red-100 text-red-800', icon: <i className="fas fa-times-circle"></i> },
  'Aprobado': { label: 'Aprobado', color: 'bg-green-100 text-green-800', icon: <i className="fas fa-check-circle"></i> },
  'Salida Registrada': { label: 'Salida Registrada', color: 'bg-indigo-100 text-indigo-800', icon: <i className="fas fa-door-open"></i> },
  'Regreso Registrado': { label: 'Regreso Registrado', color: 'bg-gray-100 text-gray-800', icon: <i className="fas fa-house-user"></i> },
};
