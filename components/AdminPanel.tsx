
import React, { useState } from 'react';
import { User, Client } from '../types';

interface AdminPanelProps {
  allUsers: User[];
  allClients: Client[];
  onUpdateUser: (userId: string, data: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ allUsers, allClients, onUpdateUser, onDeleteUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const PRO_PRICE = 39.90;
  
  const stats = {
    totalUsers: allUsers.length,
    proUsers: allUsers.filter(u => u.plan === 'pro').length,
    freeUsers: allUsers.filter(u => u.plan === 'free').length,
    totalClients: allClients.length,
    mrr: allUsers.filter(u => u.plan === 'pro').length * PRO_PRICE,
    blocked: allUsers.filter(u => u.status === 'bloqueado').length
  };

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Admin */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Controle do Proprietário</h2>
          <p className="text-slate-500 font-medium">Gerencie o crescimento e as assinaturas do ClienteSimples.</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg shadow-emerald-100 flex items-center gap-3">
              <i className="fa-solid fa-money-bill-trend-up"></i>
              <div>
                <p className="text-[10px] font-black uppercase opacity-80">MRR Estimado</p>
                <p className="text-lg font-bold leading-none">{formatCurrency(stats.mrr)}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total de Contas', value: stats.totalUsers, icon: 'fa-users', color: 'text-blue-600' },
          { label: 'Assinantes PRO', value: stats.proUsers, icon: 'fa-crown', color: 'text-amber-500' },
          { label: 'Usuários FREE', value: stats.freeUsers, icon: 'fa-user', color: 'text-slate-400' },
          { label: 'Cadastros Totais', value: stats.totalClients, icon: 'fa-address-book', color: 'text-indigo-500' },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
            <div className={`${card.color} mb-3 text-xl`}><i className={`fa-solid ${card.icon}`}></i></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.label}</p>
            <p className="text-2xl font-black text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Tabela de Gestão de Usuários */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h3 className="text-lg font-black text-slate-800">Lista de Clientes do Sistema</h3>
          <div className="relative w-full md:w-80">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
            <input 
              type="text"
              placeholder="Buscar por ID, nome ou e-mail..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-8 py-5">Identificação (ID)</th>
                <th className="px-8 py-5">Status do Plano</th>
                <th className="px-8 py-5">Uso da Cota</th>
                <th className="px-8 py-5 text-right">Ações de Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map(user => {
                const userClientsCount = allClients.filter(c => c.userId === user.id).length;
                const isPro = user.plan === 'pro';
                const isRoot = user.id === 'owner-root';
                
                return (
                  <tr key={user.id} className={`hover:bg-slate-50/80 transition-colors ${isPro ? 'bg-amber-50/10' : ''}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${isPro ? 'bg-amber-100 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                          {user.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <div className="font-bold text-slate-900 truncate max-w-[200px]">{user.name}</div>
                          <div className="text-xs text-slate-500 truncate">{user.email}</div>
                          <div className="text-[10px] font-mono font-bold text-blue-600 mt-1 bg-blue-50 px-2 py-0.5 rounded-md w-fit border border-blue-100">
                            ID: {user.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${isPro ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                          {isPro ? '★ ASSINANTE PRO' : 'USUÁRIO FREE'}
                        </span>
                        <span className={`text-[10px] font-bold ${user.status === 'ativo' ? 'text-green-500' : 'text-red-500'}`}>
                          {user.status === 'ativo' ? 'CONTA ATIVA' : 'CONTA BLOQUEADA'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2 w-32">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400">{userClientsCount} / {isPro ? '∞' : '10'}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ${isPro ? 'bg-amber-400' : userClientsCount >= 10 ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: isPro ? '100%' : `${Math.min((userClientsCount/10)*100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!isPro ? (
                          <button 
                            onClick={() => onUpdateUser(user.id, { plan: 'pro' })}
                            className="bg-green-500 hover:bg-green-600 text-white text-[10px] font-black px-4 py-2.5 rounded-xl transition-all"
                          >
                            ATIVAR PRO
                          </button>
                        ) : (
                          <button 
                            onClick={() => onUpdateUser(user.id, { plan: 'free' })}
                            className="bg-white border border-slate-200 text-slate-400 hover:text-red-500 text-[10px] font-black px-4 py-2.5 rounded-xl transition-all"
                          >
                            REBAIXAR
                          </button>
                        )}
                        
                        <button 
                          onClick={() => onUpdateUser(user.id, { status: user.status === 'ativo' ? 'bloqueado' : 'ativo' })}
                          className="p-2.5 rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-100 transition-all"
                          title={user.status === 'ativo' ? 'Bloquear' : 'Desbloquear'}
                        >
                          <i className={`fa-solid ${user.status === 'ativo' ? 'fa-ban' : 'fa-unlock'}`}></i>
                        </button>

                        {!isRoot && (
                          <button 
                            onClick={() => onDeleteUser(user.id)}
                            className="p-2.5 rounded-xl border border-red-100 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                            title="Excluir Usuário Permanentemente"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
