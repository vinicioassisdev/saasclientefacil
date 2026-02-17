
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

export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro';
}

export interface Client {
  id: string;
  userId: string; // Vínculo de segurança
  name: string;
  phone: string;
  email: string;
  service: string;
  budget: number;
  status: ClientStatus;
  paymentStatus: PaymentStatus;
  nextFollowUp: string; // ISO date string
  lastInteraction: string; // ISO date string
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

export type AppView = 'dashboard' | 'clients' | 'followups' | 'reports' | 'subscription';
