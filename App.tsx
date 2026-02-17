
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

const getSafeEnv = (key: string, defaultValue: string): string => {
  try {
    const viteEnv = (import.meta as any).env;
    if (viteEnv && viteEnv[`VITE_${key}`]) return viteEnv[`VITE_${key}`];
    if (viteEnv && viteEnv[key]) return viteEnv[key];
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env) {
      return (
        process.env[`VITE_${key}`] || 
        process.env[key] || 
        process.env[`REACT_APP_${key}`] || 
        defaultValue
      );
    }
  } catch (e) {}
  return defaultValue;
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
    
    let initialUsers: User[] = savedGlobalUsers ? JSON.parse(savedGlobalUsers) : [];
    const adminEmail = ADMIN_CREDENTIALS.email.toLowerCase().trim();
    
    const adminIndex = initialUsers.findIndex(u => u.id === 'owner-root' || u.email === adminEmail);
    const masterUser: User = {
      id: 'owner-root', 
      name: 'Proprietário ClienteSimples', 
      email: adminEmail, 
      role: 'admin', 
      plan: 'pro', 
      status: 'ativo', 
      createdAt: new Date().toISOString()
    };

    if (adminIndex === -1) {
      initialUsers.push(masterUser);
    } else {
      initialUsers[adminIndex] = { ...initialUsers[adminIndex], ...masterUser };
    }
    
    const initialClients: Client[] = savedGlobalClients ? JSON.parse(savedGlobalClients) : [];
    setAllUsers(initialUsers);
    setAllClients(initialClients);

    const sessionUser = localStorage.getItem('cs_session_user');
    if (sessionUser) {
      const user = JSON.parse(sessionUser);
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

  const handleAuth = (email: string, pass: string, isRegistering: boolean, name?: string) => {
    const loginEmail = email.toLowerCase().trim();
    const adminEmail = ADMIN_CREDENTIALS.email.toLowerCase().trim();

    if (loginEmail === adminEmail) {
      if (pass !== ADMIN_CREDENTIALS.pass) {
        throw new Error('Senha de Administrador incorreta.');
      }
      const adminUser = allUsers.find(u => u.email === adminEmail) || allUsers.find(u => u.id === 'owner-root');
      if (adminUser) {
        setCurrentUser(adminUser);
        localStorage.setItem('cs_session_user', JSON.stringify(adminUser));
        setCurrentView('admin');
        return;
      }
    }

    const existingUser = allUsers.find(u => u.email === loginEmail);

    if (isRegistering) {
      if (existingUser) {
        throw new Error('Este e-mail já está cadastrado. Por favor, faça login.');
      }
      
      const newUser: User = {
        id: 'u-' + Math.random().toString(36).substr(2, 9),
        name: name || 'Novo Usuário',
        email: loginEmail,
        role: 'user', 
        plan: 'free',
        status: 'ativo',
        createdAt: new Date().toISOString()
      };
      
      setAllUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      localStorage.setItem('cs_session_user', JSON.stringify(newUser));
      setCurrentView('dashboard');
    } else {
      if (!existingUser) {
        throw new Error('Usuário não encontrado. Por favor, crie uma conta primeiro.');
      }

      if (existingUser.status === 'bloqueado') {
        throw new Error('Este acesso foi suspenso pelo administrador.');
      }

      setCurrentUser(existingUser);
      localStorage.setItem('cs_session_user', JSON.stringify(existingUser));
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cs_session_user');
    setCurrentView('dashboard');
  };

  const handleUpdateUser = (userId: string, data: Partial<User>) => {
    if (userId === 'owner-root' && (data.role === 'user' || data.status === 'bloqueado')) {
      alert('Impossível alterar status do Proprietário Principal.');
      return;
    }
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
  };

  const handleDeleteUser = (userId: string) => {
    if (userId === 'owner-root') {
      alert('O Proprietário Principal não pode ser excluído.');
      return;
    }
    if (window.confirm('PERIGO: Isso excluirá o usuário e TODOS os seus dados permanentemente. Tem certeza?')) {
      setAllUsers(prev => prev.filter(u => u.id !== userId));
      setAllClients(prev => prev.filter(c => c.userId !== userId));
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
      alert('Limite do plano atingido. Faça o upgrade para PRO.');
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
  if (!currentUser) return <Login onLogin={handleAuth} adminEmail={ADMIN_CREDENTIALS.email} />;

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
      case 'admin': return <AdminPanel allUsers={allUsers} allClients={allClients} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} />;
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
