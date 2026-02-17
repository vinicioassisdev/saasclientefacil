
export enum ClientStatus {
  NOVO = 'Novo',
  PROPOSTA_ENVIADA = 'Proposta Enviada',
  NEGOCIACAO = 'Negociação',
  FECHADO = 'Fechado',
  PERDIDO = 'Perdido'
}

export enum PaymentStatus {
  PENDENTE = 'Pendente',
  PAGO = 'Pago',
  VENCIDO = 'Vencido'
}

export type UserRole = 'user' | 'admin';
export type UserPlan = 'free' | 'pro';
export type UserStatus = 'ativo' | 'bloqueado';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
  status: UserStatus;
  createdAt: string;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  budget: number;
  status: ClientStatus;
  paymentStatus: PaymentStatus;
  nextFollowUp: string;
  lastInteraction: string;
  createdAt: string;
}

export interface DashboardStats {
  activeClients: number;
  proposalsSent: number;
  closedDeals: number;
  monthlyRevenue: number;
  conversionRate: number;
  pendingFollowUps: number;
  overduePayments: number;
}

export type AppView = 'dashboard' | 'clients' | 'followups' | 'reports' | 'subscription' | 'upgrade' | 'admin';
