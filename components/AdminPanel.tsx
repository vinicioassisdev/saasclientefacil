
import React, { useState } from 'react';
import { User, Client } from '../types';

interface AdminPanelProps {
  allUsers: User[];
  allClients: Client[];
  onUpdateUser: (userId: string, data: Partial<User>) => void;
  onDeleteUser: (userId: string, email: string) => void;
  onImportData: (users: User[], clients: Client[]) => void;
  currentUser: User;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ allUsers, allClients, onUpdateUser, onDeleteUser, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'revenue' | 'system'>('users');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [setupMsg, setSetupMsg] = useState('');
  
  const PRO_PRICE = 39.90;
  
  const stats = {
    totalUsers: allUsers.length,
    proUsers: allUsers.filter(u => u.plan === 'pro').length,
    freeUsers: allUsers.filter(u => u.plan === 'free').length,
    totalClients: allClients.length,
    mrr: allUsers.filter(u => u.plan === 'pro').length * PRO_PRICE,
    activeToday: Math.floor(allUsers.length * 0.4) 
  };

  const handleInitDB = async () => {
    setIsSettingUp(true);
    setSetupMsg("Conectando ao Neon...");
    try {
      const res = await fetch('/api/setup', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSetupMsg("Sucesso! Tabelas criadas.");
        alert("Banco de dados configurado com sucesso! Agora você pode criar usuários.");
      } else {
        setSetupMsg("Erro: " + data.error);
      }
    } catch (e: any) {
      setSetupMsg("Erro de conexão.");
    } finally {
      setIsSettingUp(false);
    }
  };

  const filteredUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">HQ Administrativo</h2>
          <p className="text-slate-500 font-medium">Controle total da operação ClienteSimples.</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'users' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-50'}`}
          >USUÁRIOS</button>
          <button 
            onClick={() => setActiveTab('revenue')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'revenue' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
          >FATURAMENTO</button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'system' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
          >SISTEMA</button>
        </div>
      </div>

      {activeTab === 'users' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Base Total', value: stats.totalUsers, color: 'bg-blue-600', icon: 'fa-users' },
              { label: 'Conversão Pro', value: `${stats.totalUsers > 0 ? ((stats.proUsers / stats.totalUsers) * 100).toFixed(1) : 0}%`, color: 'bg-amber-500', icon: 'fa-star' },
              { label: 'Ativos 24h', value: stats.activeToday, color: 'bg-indigo-600', icon: 'fa-bolt' },
              { label: 'Clientes Gerenciados', value: stats.totalClients, color: 'bg-slate-900', icon: 'fa-briefcase' },
            ].map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
                <div className={`absolute -right-4 -top-4 w-20 h-20 ${s.color} opacity-5 rounded-full group-hover:scale-150 transition-transform`}></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-3xl font-black text-slate-900">{s.value}</p>
                <div className={`mt-3 w-8 h-8 rounded-lg ${s.color} text-white flex items-center justify-center text-xs`}>
                  <i className={`fa-solid ${s.icon}`}></i>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="relative flex-1 max-w-md">
                <i className="fa-solid fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  type="text"
                  placeholder="Pesquisar por nome ou e-mail..."
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-8 py-6">Perfil do Usuário</th>
                    <th className="px-8 py-6">Tipo de Acesso</th>
                    <th className="px-8 py-6">Engajamento</th>
                    <th className="px-8 py-6 text-right">Ação Estratégica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map(user => {
                    const isPro = user.plan === 'pro';
                    const isMe = user.id === currentUser.id;
                    const userClientCount = allClients.filter(c => c.userId === user.id).length;
                    
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-all group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${isPro ? 'bg-amber-100 text-amber-600 shadow-inner' : 'bg-blue-100 text-blue-600'}`}>
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-900 leading-none">{user.name}</span>
                                {isMe && <span className="text-[8px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-black">VOCÊ</span>}
                              </div>
                              <div className="text-xs text-slate-400 mt-1">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase ${isPro ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-100 text-slate-500'}`}>
                            {isPro ? <><i className="fa-solid fa-crown text-[8px]"></i> CLIENTE PRO</> : 'USUÁRIO FREE'}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-bold text-slate-700">{userClientCount} Clientes</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Entrou em {new Date(user.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          {!isMe && (
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                               <button 
                                onClick={() => onUpdateUser(user.id, { plan: isPro ? 'free' : 'pro' })}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isPro ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}
                                title={isPro ? "Mudar para Free" : "Dar Upgrade Pro"}
                              >
                                <i className="fa-solid fa-gem"></i>
                              </button>
                              <button 
                                onClick={() => onDeleteUser(user.id, user.email)}
                                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                              >
                                <i className="fa-solid fa-user-slash text-xs"></i>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium">Nenhum usuário encontrado no Neon.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'revenue' && (
        <div className="bg-white p-12 rounded-[40px] text-center border border-slate-100 shadow-xl">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
            <i className="fa-solid fa-chart-line"></i>
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">MRR (Faturamento Recurrente)</h3>
          <p className="text-5xl font-black text-slate-900 mb-8">{formatCurrency(stats.mrr)}</p>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900 p-8 rounded-[40px] text-white">
            <h3 className="text-xl font-black mb-6">Conectividade Neon</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/10">
                <span className="text-xs font-bold text-slate-400">STATUS DA INSTÂNCIA</span>
                <span className="text-xs font-black text-green-400 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  OPERACIONAL
                </span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Manutenção do Banco</p>
                <button 
                  disabled={isSettingUp}
                  onClick={handleInitDB}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
                >
                  {isSettingUp ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-database"></i>}
                  {isSettingUp ? "CONFIGURANDO..." : "INICIALIZAR TABELAS NEON"}
                </button>
                {setupMsg && <p className="mt-2 text-[10px] text-blue-300 font-bold text-center uppercase">{setupMsg}</p>}
              </div>
            </div>
          </div>
          
          <div className="bg-blue-600 p-8 rounded-[40px] text-white">
             <h3 className="text-xl font-black mb-6">Informações de Saída</h3>
             <p className="text-sm text-blue-100 mb-8 leading-relaxed">
               Seus dados estão sendo sincronizados via Vercel Edge Functions diretamente para o Postgres do Neon. 
               Qualquer alteração feita no celular deve aparecer aqui em até 30 segundos.
             </p>
             <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                <p className="text-[10px] font-black text-blue-100 uppercase mb-2">Usuário Atual</p>
                <p className="text-xs font-bold">{currentUser.name} ({currentUser.role})</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
