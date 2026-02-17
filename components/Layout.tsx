
import React from 'react';
import { AppView, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onViewChange, user, onLogout }) => {
  const menuItems: { id: AppView; label: string; icon: string; hideOnFree?: boolean; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Painel', icon: 'fa-chart-pie' },
    { id: 'clients', label: 'Clientes', icon: 'fa-users' },
    { id: 'followups', label: 'Follow-ups', icon: 'fa-bell' },
    { id: 'reports', label: 'Relatórios', icon: 'fa-file-invoice-dollar' },
    { id: 'admin', label: 'Admin', icon: 'fa-screwdriver-wrench', adminOnly: true },
    { id: 'upgrade', label: 'Seja Pro', icon: 'fa-crown', hideOnFree: false },
  ];

  const filteredMenu = menuItems.filter(item => {
    if (item.adminOnly && user.role !== 'admin') return false;
    if (item.id === 'upgrade' && user.plan === 'pro') return false;
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <i className="fa-solid fa-rocket"></i>
            ClienteSimples
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                currentView === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              } ${item.id === 'upgrade' ? 'bg-amber-50 text-amber-600 border border-amber-100' : ''}`}
            >
              <i className={`fa-solid ${item.icon} w-5`}></i>
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-semibold truncate text-slate-800">{user.name}</p>
              <p className={`text-[10px] font-black uppercase ${user.plan === 'pro' ? 'text-amber-600' : 'text-slate-500'}`}>
                {user.plan === 'pro' ? 'PLANO PRO ★' : 'PLANO GRÁTIS'}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-black text-red-500 hover:bg-red-50 rounded-lg transition-colors uppercase"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            Sair da conta
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
