
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ClientManager from './components/ClientManager';
import FollowUpManager from './components/FollowUpManager';
import Reports from './components/Reports';
import Login from './components/Login';
import Upgrade from './components/Upgrade';
import AdminPanel from './components/AdminPanel';
import { AppView, Client, ClientStatus, DashboardStats, PaymentStatus, User } from './types';

const API_URL = "/api/sync";

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const syncData = useCallback(async () => {
    try {
      setIsSyncing(true);
      const response = await fetch(API_URL, {
        headers: {
          'x-sync-secret': process.env.SYNC_SECRET || ''
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.users) setAllUsers(data.users);
        if (data.clients) setAllClients(data.clients);
        setLastSyncTime(new Date());
        setSyncError(null);
      } else {
        const errData = await response.json();
        setSyncError(errData.error || "Erro ao ler dados do banco.");
      }
    } catch (error) {
      console.error("Erro ao sincronizar:", error);
      setSyncError("Não foi possível conectar ao servidor. Verifique se a rota /api/sync existe.");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const persistData = useCallback(async (users: User[], clients: Client[]) => {
    try {
      setIsSyncing(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sync-secret': process.env.SYNC_SECRET || ''
        },
        body: JSON.stringify({ users, clients })
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Falha ao gravar no Neon");
      }
      setSyncError(null);
    } catch (error: any) {
      console.error("Erro ao persistir:", error);
      setSyncError("Erro ao salvar: " + error.message);
      alert("Atenção: Os dados não puderam ser salvos no banco de dados. " + error.message);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    const savedSession = localStorage.getItem('cs_session_user');
    if (savedSession) {
      const parsedUser = JSON.parse(savedSession);
      setCurrentUser(parsedUser);
    }
    syncData().then(() => setIsInitialized(true));

    const interval = setInterval(syncData, 30000);
    return () => clearInterval(interval);
  }, [syncData]);

  const handleAuth = async (email: string, pass: string, isRegistering: boolean, name?: string) => {
    const loginEmail = email.toLowerCase().trim();
    const adminEmail = "vinicioassisdev@gmail.com";

    if (loginEmail === adminEmail && pass === "Hoje2025@#") {
      const admin: User = allUsers.find(u => u.email === adminEmail) || {
        id: 'admin-001', name: 'Diretor ClienteSimples', email: adminEmail, role: 'admin', plan: 'pro', status: 'ativo', createdAt: new Date().toISOString()
      };
      setCurrentUser(admin);
      localStorage.setItem('cs_session_user', JSON.stringify(admin));
      setCurrentView('admin');
      return;
    }

    const foundUser = allUsers.find(u => u.email === loginEmail);

    if (isRegistering) {
      if (foundUser) throw new Error('E-mail já cadastrado.');

      const newUser: User = {
        id: `u_${Math.random().toString(36).substr(2, 9)}`,
        name: name || 'Usuário',
        email: loginEmail,
        role: 'user',
        plan: 'free',
        status: 'ativo',
        createdAt: new Date().toISOString()
      };

      const newUsersList = [...allUsers, newUser];
      setAllUsers(newUsersList);
      setCurrentUser(newUser);
      localStorage.setItem('cs_session_user', JSON.stringify(newUser));
      await persistData(newUsersList, allClients);
      setCurrentView('dashboard');
    } else {
      if (!foundUser) throw new Error('Usuário não encontrado.');
      setCurrentUser(foundUser);
      localStorage.setItem('cs_session_user', JSON.stringify(foundUser));
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cs_session_user');
    setCurrentView('dashboard');
  };

  const handleAddClient = async (clientData: any) => {
    if (!currentUser) return;
    const newClient: Client = {
      ...clientData,
      id: `c_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      createdAt: new Date().toISOString()
    };
    const newClientsList = [...allClients, newClient];
    setAllClients(newClientsList);
    await persistData(allUsers, newClientsList);
  };

  const userClients = useMemo(() => allClients.filter(c => c.userId === currentUser?.id), [allClients, currentUser]);

  const stats = useMemo((): DashboardStats => {
    const c = userClients;
    return {
      activeClients: c.filter(x => x.status !== ClientStatus.PERDIDO).length,
      proposalsSent: c.filter(x => x.status === ClientStatus.PROPOSTA_ENVIADA).length,
      closedDeals: c.filter(x => x.status === ClientStatus.FECHADO).length,
      monthlyRevenue: c.filter(x => x.status === ClientStatus.FECHADO).reduce((s, x) => s + x.budget, 0),
      conversionRate: c.length > 0 ? (c.filter(x => x.status === ClientStatus.FECHADO).length / c.length) * 100 : 0,
      pendingFollowUps: c.filter(x => new Date(x.nextFollowUp) < new Date() && x.status !== ClientStatus.FECHADO).length,
      overduePayments: c.filter(x => x.paymentStatus === PaymentStatus.VENCIDO).length,
    };
  }, [userClients]);

  if (!isInitialized) return (
    <div className="h-screen flex items-center justify-center bg-white flex-col gap-4">
      <i className="fa-solid fa-database text-blue-600 text-5xl animate-pulse"></i>
      <p className="font-black text-slate-400 uppercase tracking-widest text-sm">Iniciando ClienteSimples...</p>
    </div>
  );

  if (!currentUser) return <Login onLogin={handleAuth} adminEmail="admin@clientesimples.com" />;

  return (
    <Layout currentView={currentView} onViewChange={setCurrentView} user={currentUser} onLogout={handleLogout}>
      <div className="relative">
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl transition-all border ${syncError ? 'bg-red-600 border-red-400 text-white' :
          isSyncing ? 'bg-blue-600 border-blue-400 text-white animate-pulse' :
            'bg-white border-slate-100 text-slate-400'
          }`}>
          <i className={`fa-solid ${syncError ? 'fa-triangle-exclamation' : isSyncing ? 'fa-sync fa-spin' : 'fa-cloud-check'} text-sm`}></i>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase leading-none">
              {syncError ? 'ERRO DE SYNC' : isSyncing ? 'Sincronizando' : 'Sincronizado'}
            </p>
            {lastSyncTime && !syncError && <p className="text-[9px] opacity-70">Neon DB: {lastSyncTime.toLocaleTimeString()}</p>}
            {syncError && <p className="text-[9px] opacity-70 truncate max-w-[150px]">{syncError}</p>}
          </div>
        </div>

        {currentView === 'dashboard' && <Dashboard stats={stats} clients={userClients} />}
        {currentView === 'clients' && (
          <ClientManager
            clients={userClients} userPlan={currentUser.plan}
            onAddClient={handleAddClient}
            onUpdateClient={async (u) => {
              const newList = allClients.map(c => c.id === u.id ? u : c);
              setAllClients(newList);
              await persistData(allUsers, newList);
            }}
            onDeleteClient={async (id) => {
              const newList = allClients.filter(c => c.id !== id);
              setAllClients(newList);
              await persistData(allUsers, newList);
            }}
            onNavigateToUpgrade={() => setCurrentView('upgrade')}
          />
        )}
        {currentView === 'followups' && <FollowUpManager clients={userClients} onUpdateClient={(u) => {
          const newList = allClients.map(c => c.id === u.id ? u : c);
          setAllClients(newList);
          persistData(allUsers, newList);
        }} />}
        {currentView === 'reports' && <Reports clients={userClients} />}
        {currentView === 'upgrade' && <Upgrade />}
        {currentView === 'admin' && (
          <AdminPanel
            allUsers={allUsers} allClients={allClients}
            onUpdateUser={async (id, d) => {
              const newList = allUsers.map(u => u.id === id ? { ...u, ...d } : u);
              setAllUsers(newList);
              await persistData(newList, allClients);
            }}
            onDeleteUser={async (id) => {
              const newList = allUsers.filter(u => u.id !== id);
              setAllUsers(newList);
              await persistData(newList, allClients);
            }}
            onImportData={(u, c) => { setAllUsers(u); setAllClients(c); }}
            currentUser={currentUser}
          />
        )}
      </div>
    </Layout>
  );
};

export default App;
