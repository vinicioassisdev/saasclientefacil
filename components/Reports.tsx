
import React from 'react';
import { Client, ClientStatus, PaymentStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';

interface ReportsProps {
  clients: Client[];
}

const Reports: React.FC<ReportsProps> = ({ clients }) => {
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const totalRevenue = clients
    .filter(c => c.status === ClientStatus.FECHADO)
    .reduce((acc, curr) => acc + curr.budget, 0);

  const pendingRevenue = clients
    .filter(c => c.status === ClientStatus.PROPOSTA_ENVIADA || c.status === ClientStatus.NEGOCIACAO)
    .reduce((acc, curr) => acc + curr.budget, 0);

  const conversionRate = clients.length > 0 
    ? ((clients.filter(c => c.status === ClientStatus.FECHADO).length / clients.length) * 100).toFixed(1)
    : 0;

  const averageTicket = clients.filter(c => c.status === ClientStatus.FECHADO).length > 0
    ? totalRevenue / clients.filter(c => c.status === ClientStatus.FECHADO).length
    : 0;

  // Mock data for monthly evolution
  const monthlyData = [
    { month: 'Jan', revenue: totalRevenue * 0.7 },
    { month: 'Fev', revenue: totalRevenue * 0.85 },
    { month: 'Mar', revenue: totalRevenue * 0.6 },
    { month: 'Abr', revenue: totalRevenue },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Relatórios Financeiros</h2>
        <p className="text-slate-500">Entenda de onde vem seu dinheiro e como seu negócio está crescendo.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Faturamento Total</p>
          <p className="text-3xl font-black text-slate-900">{formatCurrency(totalRevenue)}</p>
          <div className="mt-4 flex items-center text-xs text-green-600 font-bold">
            <i className="fa-solid fa-arrow-up mr-1"></i>
            12% em relação ao mês anterior
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Taxa de Conversão</p>
          <p className="text-3xl font-black text-slate-900">{conversionRate}%</p>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full" style={{ width: `${conversionRate}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ticket Médio</p>
          <p className="text-3xl font-black text-slate-900">{formatCurrency(averageTicket)}</p>
          <p className="mt-4 text-xs text-slate-500 italic">Baseado em contratos fechados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Evolução do Faturamento</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} dy={10} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} tickFormatter={(val) => `R$ ${val/1000}k`} />
                <Tooltip 
                  formatter={(val: number) => formatCurrency(val)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 mb-2">Potencial de Receita</h3>
            <p className="text-sm text-slate-500 mb-6">Valores em propostas enviadas e negociações abertas.</p>
            <div className="text-4xl font-black text-blue-600 mb-2">{formatCurrency(pendingRevenue)}</div>
            <p className="text-xs text-slate-400">Total aguardando decisão dos clientes</p>
          </div>
          
          <div className="space-y-4 pt-8">
             <div className="flex items-center justify-between">
               <span className="text-sm font-medium text-slate-600">Tempo médio de fechamento</span>
               <span className="text-sm font-bold text-slate-900">8 dias</span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-sm font-medium text-slate-600">Motivo principal de perda</span>
               <span className="text-sm font-bold text-red-600">Preço alto</span>
             </div>
             <div className="flex items-center justify-between">
               <span className="text-sm font-medium text-slate-600">Serviço mais buscado</span>
               <span className="text-sm font-bold text-blue-600">Social Media</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
