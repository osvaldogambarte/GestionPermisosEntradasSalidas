
export enum UserRole {
  EMPLOYEE = 'Empleado',
  MANAGER = 'Jefe de Sector',
  HR = 'RRHH',
  SECURITY = 'Portería',
  ADMIN = 'Administrador'
}

export enum PermitStatus {
  PENDING_BOSS = 'Pendiente Jefe',
  REJECTED_BOSS = 'Rechazado por Jefe',
  PENDING_HR = 'Pendiente RRHH',
  REJECTED_HR = 'Rechazado por RRHH',
  APPROVED = 'Aprobado',
  EXITED = 'Salida Registrada',
  RETURNED = 'Regreso Registrado'
}

export enum ExitType {
  PLANNED = 'Previsto',
  UNPLANNED = 'Imprevisto'
}

export enum ReturnType {
  RETURNS = 'Regresa',
  NO_RETURN = 'No Regresa'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sector?: string;
}

export interface PermitRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  time: string;
  type: ExitType;
  returnType: ReturnType;
  motive: string;
  willPresentProof: boolean;
  status: PermitStatus;
  bossApprovalDate?: string;
  hrApprovalDate?: string;
  securityExitDate?: string;
  securityReturnDate?: string;
  sector: string;
  aiMotiveAnalysis?: string;
  proofData?: string; // New field for storing base64 image/file
}
