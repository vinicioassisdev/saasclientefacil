
import React from 'react';
import { DashboardStats, Client, ClientStatus, PaymentStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DashboardProps {
  stats: DashboardStats;
  clients: Client[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, clients }) => {
  const chartData = [
    { name: 'Novos', value: clients.filter(c => c.status === ClientStatus.NOVO).length, color: '#3b82f6' },
    { name: 'Negociação', value: clients.filter(c => c.status === ClientStatus.NEGOCIACAO).length, color: '#6366f1' },
    { name: 'Fechados', value: clients.filter(c => c.status === ClientStatus.FECHADO).length, color: '#22c55e' },
    { name: 'Perdidos', value: clients.filter(c => c.status === ClientStatus.PERDIDO).length, color: '#ef4444' },
  ];

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const statCards = [
    { label: 'Clientes Ativos', value: stats.activeClients, icon: 'fa-users', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Faturamento Mensal', value: formatCurrency(stats.monthlyRevenue), icon: 'fa-brazilian-real-sign', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Follow-ups Pendentes', value: stats.pendingFollowUps, icon: 'fa-clock', color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Cobranças Vencidas', value: stats.overduePayments, icon: 'fa-triangle-exclamation', color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-xl flex items-center justify-center text-xl`}>
              <i className={`fa-solid ${card.icon}`}></i>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{card.label}</p>
              <p className="text-xl font-bold text-slate-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-slate-800">Status dos Clientes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold mb-4 text-slate-800">Próximas Ações</h3>
          <div className="space-y-4">
            {clients
              .filter(c => new Date(c.nextFollowUp) < new Date() && c.status !== ClientStatus.FECHADO)
              .slice(0, 4)
              .map(client => (
                <div key={client.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                      <i className="fa-solid fa-user"></i>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{client.name}</p>
                      <p className="text-xs text-slate-500">{client.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-amber-600 uppercase">Atrasado</p>
                    <p className="text-xs text-slate-400">{new Date(client.nextFollowUp).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
              ))}
            {clients.length === 0 && (
              <p className="text-center text-slate-400 py-10">Tudo em dia por aqui!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
