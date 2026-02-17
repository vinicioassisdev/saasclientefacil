
import { ClientStatus, PaymentStatus, Client } from './types';

export const COLORS = {
  primary: '#2563eb', // blue-600
  secondary: '#64748b', // slate-500
  success: '#16a34a', // green-600
  danger: '#dc2626', // red-600
  warning: '#ca8a04', // yellow-600
};

export const INITIAL_CLIENTS: Client[] = [
  {
    id: '1',
    // Added missing userId to satisfy Client type
    userId: 'demo-user',
    name: 'Ana Souza',
    phone: '11999999999',
    email: 'ana@email.com',
    service: 'Identidade Visual',
    budget: 2500,
    status: ClientStatus.NEGOCIACAO,
    paymentStatus: PaymentStatus.PENDENTE,
    nextFollowUp: new Date(Date.now() - 86400000).toISOString(), // Ontem
    lastInteraction: new Date(Date.now() - 172800000 * 3).toISOString(), // 6 dias atrás
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    // Added missing userId to satisfy Client type
    userId: 'demo-user',
    name: 'Carlos Lima',
    phone: '21988888888',
    email: 'carlos@contabil.com',
    service: 'Consultoria Mensal',
    budget: 1200,
    status: ClientStatus.FECHADO,
    paymentStatus: PaymentStatus.PAGO,
    nextFollowUp: new Date(Date.now() + 86400000 * 5).toISOString(),
    lastInteraction: new Date().toISOString(),
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    // Added missing userId to satisfy Client type
    userId: 'demo-user',
    name: 'Mariana Oliveira',
    phone: '31977777777',
    email: 'mari@arq.com',
    service: 'Projeto Arquitetônico',
    budget: 8000,
    status: ClientStatus.PROPOSTA_ENVIADA,
    paymentStatus: PaymentStatus.VENCIDO,
    nextFollowUp: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastInteraction: new Date(Date.now() - 86400000 * 5).toISOString(),
    createdAt: new Date().toISOString()
  }
];
