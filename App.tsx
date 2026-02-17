
import React, { useState, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientManager from './components/ClientManager';
import FollowUpManager from './components/FollowUpManager';
import Reports from './components/Reports';
import Subscription from './components/Subscription';
import Login from './components/Login';
import { AppView, Client, ClientStatus, DashboardStats, PaymentStatus, User } from './types';
import { INITIAL_CLIENTS } from './constants';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Recuperar sessão e dados do usuário logado
  useEffect(() => {
    const savedUser = localStorage.getItem('cs_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      // Carregar apenas os clientes deste usuário
      const savedClients = localStorage.getItem(`cs_clients_${parsedUser.id}`);
      if (savedClients) {
        setClients(JSON.parse(savedClients));
      } else {
        // Se for novo usuário, damos os exemplos vinculados ao seu ID
        const demoClients = INITIAL_CLIENTS.map(c => ({ ...c, userId: parsedUser.id }));
        setClients(demoClients);
      }
    }
    setIsInitialized(true);
  }, []);

  // Sincronizar clientes com o storage específico do usuário
  useEffect(() => {
    if (user && isInitialized) {
      localStorage.setItem(`cs_clients_${user.id}`, JSON.stringify(clients));
    }
  }, [clients, user, isInitialized]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('cs_user', JSON.stringify(userData));
    // Redireciona para o dashboard
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setClients([]);
    localStorage.removeItem('cs_user');
    setCurrentView('dashboard');
  };

  const stats = useMemo((): DashboardStats => {
    if (!user) return { activeClients: 0, proposalsSent: 0, closedDeals: 0, monthlyRevenue: 0, conversionRate: 0, pendingFollowUps: 0, overduePayments: 0 };
    
    const now = new Date();
    return {
      activeClients: clients.filter(c => c.status !== ClientStatus.PERDIDO).length,
      proposalsSent: clients.filter(c => c.status === ClientStatus.PROPOSTA_ENVIADA).length,
      closedDeals: clients.filter(c => c.status === ClientStatus.FECHADO).length,
      monthlyRevenue: clients
        .filter(c => c.status === ClientStatus.FECHADO)
        .reduce((sum, c) => sum + c.budget, 0),
      conversionRate: clients.length > 0 
        ? (clients.filter(c => c.status === ClientStatus.FECHADO).length / clients.length) * 100 
        : 0,
      pendingFollowUps: clients.filter(c => new Date(c.nextFollowUp) < now && c.status !== ClientStatus.FECHADO && c.status !== ClientStatus.PERDIDO).length,
      overduePayments: clients.filter(c => c.paymentStatus === PaymentStatus.VENCIDO).length,
    };
  }, [clients, user]);

  const handleAddClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'userId'>) => {
    if (!user) return;
    const newClient: Client = {
      ...clientData,
      userId: user.id,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setClients([...clients, newClient]);
  };

  const handleUpdateClient = (updatedClient: Client) => {
    if (updatedClient.userId !== user?.id) return; // Segurança extra
    setClients(clients.map(c => c.id === updatedClient.id ? updatedClient : c));
  };

  const handleDeleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  if (!isInitialized) return null;

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard stats={stats} clients={clients} />;
      case 'clients':
        return (
          <ClientManager 
            clients={clients} 
            onAddClient={handleAddClient} 
            onUpdateClient={handleUpdateClient} 
            onDeleteClient={handleDeleteClient}
          />
        );
      case 'followups':
        return <FollowUpManager clients={clients} onUpdateClient={handleUpdateClient} />;
      case 'reports':
        return <Reports clients={clients} />;
      case 'subscription':
        return <Subscription />;
      default:
        return <Dashboard stats={stats} clients={clients} />;
    }
  };

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView} user={user} onLogout={handleLogout}>
      {renderView()}
    </Layout>
  );
};

export default App;
