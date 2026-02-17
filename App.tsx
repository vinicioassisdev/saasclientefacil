
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientManager from './components/ClientManager';
import FollowUpManager from './components/FollowUpManager';
import Reports from './components/Reports';
import Login from './components/Login';
import Upgrade from './components/Upgrade';
import AdminPanel from './components/AdminPanel';
import { AppView, Client, ClientStatus, DashboardStats, PaymentStatus, User } from './types';

/**
 * 🛡️ SISTEMA DE RECUPERAÇÃO DE VARIÁVEIS DE AMBIENTE
 * 
 * No Vercel/Frontend, variáveis precisam de prefixos para serem expostas.
 * Esta função tenta buscar em todos os formatos comuns.
 */
const getSafeEnv = (key: string, defaultValue: string): string => {
  if (typeof process === 'undefined' || !process.env) return defaultValue;
  
  return (
    process.env[key] || 
    process.env[`VITE_${key}`] || 
    process.env[`REACT_APP_${key}`] || 
    process.env[`NEXT_PUBLIC_${key}`] || 
    defaultValue
  );
};

const ADMIN_CREDENTIALS = {
  email: getSafeEnv('ADMIN_EMAIL', 'admin@clientesimples.com'),
  pass: getSafeEnv('ADMIN_PASS', 'sua-senha-segura-123')
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const savedGlobalUsers = localStorage.getItem('cs_global_users');
    const savedGlobalClients = localStorage.getItem('cs_global_clients');
    
    const initialUsers: User[] = savedGlobalUsers ? JSON.parse(savedGlobalUsers) : [];
    const adminEmail = ADMIN_CREDENTIALS.email;
    
    // Injeção dinâmica do Admin Master
    const hasAdmin = initialUsers.some(u => u.role === 'admin' && u.email === adminEmail);
    if (!hasAdmin) {
      initialUsers.push({
        id: 'owner-root', 
        name: 'Proprietário ClienteSimples', 
        email: adminEmail, 
        role: 'admin', 
        plan: 'pro', 
        status: 'ativo', 
        createdAt: new Date().toISOString()
      });
    }
    
    const initialClients: Client[] = savedGlobalClients ? JSON.parse(savedGlobalClients) : [];

    setAllUsers(initialUsers);
    setAllClients(initialClients);

    const sessionUser = localStorage.getItem('cs_session_user');
    if (sessionUser) {
      const user = JSON.parse(sessionUser);
      // Validação de segurança: se o e-mail administrativo mudar no Vercel, desloga sessões antigas
      if (user.role === 'admin' && user.email !== adminEmail) {
        localStorage.removeItem('cs_session_user');
        setCurrentUser(null);
      } else {
        setCurrentUser(user);
      }
    }
    
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cs_global_users', JSON.stringify(allUsers));
      localStorage.setItem('cs_global_clients', JSON.stringify(allClients));
    }
  }, [allUsers, allClients, isInitialized]);

  const handleLogin = (email: string, pass: string, name?: string) => {
    const loginEmail = email.toLowerCase().trim();
    const adminEmail = ADMIN_CREDENTIALS.email.toLowerCase().trim();

    // 1. Verificação contra Variáveis de Ambiente
    if (loginEmail === adminEmail) {
      if (pass !== ADMIN_CREDENTIALS.pass) {
        throw new Error('Credenciais de Administrador inválidas.');
      }
      
      const adminUser = allUsers.find(u => u.email === adminEmail) || {
        id: 'owner-root',
        name: 'Proprietário ClienteSimples',
        email: adminEmail,
        role: 'admin',
        plan: 'pro',
        status: 'ativo',
        createdAt: new Date().toISOString()
      };

      setCurrentUser(adminUser as User);
      localStorage.setItem('cs_session_user', JSON.stringify(adminUser));
      setCurrentView('admin');
      return;
    }

    // 2. Fluxo Normal de Usuários
    let user = allUsers.find(u => u.email === loginEmail);
    
    if (!user) {
      user = {
        id: btoa(loginEmail),
        name: name || 'Novo Usuário',
        email: loginEmail,
        role: 'user', 
        plan: 'free',
        status: 'ativo',
        createdAt: new Date().toISOString()
      };
      setAllUsers(prev => [...prev, user as User]);
    }

    if (user.status === 'bloqueado') {
      throw new Error('Acesso suspenso. Procure o administrador.');
    }

    setCurrentUser(user);
    localStorage.setItem('cs_session_user', JSON.stringify(user));
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cs_session_user');
    setCurrentView('dashboard');
  };

  const handleUpdateUser = (userId: string, data: Partial<User>) => {
    if (userId === 'owner-root' && (data.role === 'user' || data.status === 'bloqueado')) {
      alert('Ação negada para o usuário mestre.');
      return;
    }

    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    
    if (currentUser?.id === userId) {
      const updated = { ...currentUser, ...data };
      setCurrentUser(updated);
      localStorage.setItem('cs_session_user', JSON.stringify(updated));
    }
  };

  const userClients = useMemo(() => 
    allClients.filter(c => c.userId === currentUser?.id), 
  [allClients, currentUser]);

  const stats = useMemo((): DashboardStats => {
    const clients = userClients;
    return {
      activeClients: clients.filter(c => c.status !== ClientStatus.PERDIDO).length,
      proposalsSent: clients.filter(c => c.status === ClientStatus.PROPOSTA_ENVIADA).length,
      closedDeals: clients.filter(c => c.status === ClientStatus.FECHADO).length,
      monthlyRevenue: clients.filter(c => c.status === ClientStatus.FECHADO).reduce((sum, c) => sum + c.budget, 0),
      conversionRate: clients.length > 0 ? (clients.filter(c => c.status === ClientStatus.FECHADO).length / clients.length) * 100 : 0,
      pendingFollowUps: clients.filter(c => new Date(c.nextFollowUp) < new Date() && c.status !== ClientStatus.FECHADO).length,
      overduePayments: clients.filter(c => c.paymentStatus === PaymentStatus.VENCIDO).length,
    };
  }, [userClients]);

  const handleAddClient = (clientData: any) => {
    if (!currentUser) return;
    if (currentUser.plan === 'free' && userClients.length >= 10) {
      alert('Limite do plano atingido.');
      return;
    }
    const newClient: Client = {
      ...clientData,
      userId: currentUser.id,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setAllClients(prev => [...prev, newClient]);
  };

  if (!isInitialized) return null;
  if (!currentUser) return <Login onLogin={handleLogin} adminEmail={ADMIN_CREDENTIALS.email} />;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard stats={stats} clients={userClients} />;
      case 'clients': return (
        <ClientManager 
          clients={userClients} 
          userPlan={currentUser.plan}
          onAddClient={handleAddClient} 
          onUpdateClient={(updated) => setAllClients(prev => prev.map(c => c.id === updated.id ? updated : c))}
          onDeleteClient={(id) => setAllClients(prev => prev.filter(c => c.id !== id))}
          onNavigateToUpgrade={() => setCurrentView('upgrade')}
        />
      );
      case 'upgrade': return <Upgrade />;
      case 'admin': 
        return currentUser.role === 'admin' ? (
          <AdminPanel allUsers={allUsers} allClients={allClients} onUpdateUser={handleUpdateUser} />
        ) : <Dashboard stats={stats} clients={userClients} />;
      case 'followups': return <FollowUpManager clients={userClients} onUpdateClient={(u) => setAllClients(prev => prev.map(c => c.id === u.id ? u : c))} />;
      case 'reports': return <Reports clients={userClients} />;
      default: return <Dashboard stats={stats} clients={userClients} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView} user={currentUser} onLogout={handleLogout}>
      {renderView()}
    </Layout>
  );
};

export default App;

