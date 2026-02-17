
import React, { useState } from 'react';
import { Client, ClientStatus, PaymentStatus, UserPlan } from '../types';

interface ClientManagerProps {
  clients: Client[];
  userPlan: UserPlan;
  onAddClient: (client: Omit<Client, 'id' | 'createdAt' | 'userId'>) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onNavigateToUpgrade: () => void;
}

const ClientManager: React.FC<ClientManagerProps> = ({ 
  clients, 
  userPlan, 
  onAddClient, 
  onUpdateClient, 
  onDeleteClient,
  onNavigateToUpgrade 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [validationError, setValidationError] = useState('');

  // Limite reduzido para 10 para forçar upgrade
  const FREE_LIMIT = 10;
  const isLimitReached = userPlan === 'free' && clients.length >= FREE_LIMIT;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    budget: 0,
    status: ClientStatus.NOVO,
    paymentStatus: PaymentStatus.PENDENTE,
    nextFollowUp: new Date().toISOString().split('T')[0],
    lastInteraction: new Date().toISOString()
  });

  const sanitizeInput = (val: string) => val.replace(/[<>]/g, '').trim();

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      service: '',
      budget: 0,
      status: ClientStatus.NOVO,
      paymentStatus: PaymentStatus.PENDENTE,
      nextFollowUp: new Date().toISOString().split('T')[0],
      lastInteraction: new Date().toISOString()
    });
    setEditingClient(null);
    setValidationError('');
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      ...client,
      nextFollowUp: client.nextFollowUp.split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    if (isLimitReached) {
      setValidationError(`Você atingiu o limite de ${FREE_LIMIT} clientes do plano Free.`);
    }
    resetForm();
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!editingClient && isLimitReached) {
      setValidationError(`Limite atingido (${FREE_LIMIT} clientes). Faça o upgrade para o Plano Pro agora.`);
      return;
    }

    if (formData.budget < 0) {
      setValidationError('O orçamento não pode ser negativo.');
      return;
    }

    const sanitizedData = {
      ...formData,
      name: sanitizeInput(formData.name),
      service: sanitizeInput(formData.service),
      email: sanitizeInput(formData.email),
      phone: formData.phone.replace(/[^\d() +-]/g, '')
    };

    if (editingClient) {
      onUpdateClient({ ...editingClient, ...sanitizedData });
    } else {
      onAddClient(sanitizedData);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Seus Clientes</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-500">Gestão de contatos.</p>
            {userPlan === 'free' && (
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isLimitReached ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {clients.length}/{FREE_LIMIT} CLIENTES NO PLANO FREE
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200"
        >
          <i className="fa-solid fa-plus text-sm"></i>
          Novo Cliente
        </button>
      </div>

      {isLimitReached && (
        <div className="bg-red-50 border border-red-200 p-5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xl">
              <i className="fa-solid fa-lock"></i>
            </div>
            <div>
              <p className="text-sm font-black text-red-800 uppercase tracking-tight">Limite do Plano Free atingido!</p>
              <p className="text-xs text-red-600">Para cadastrar mais de {FREE_LIMIT} clientes, você precisa ser Pro.</p>
            </div>
          </div>
          <button 
            onClick={onNavigateToUpgrade}
            className="w-full md:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2"
          >
            <i className="fa-solid fa-crown"></i>
            LIBERAR ACESSO ILIMITADO
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs uppercase font-bold tracking-wider">
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Serviço / Valor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Pagamento</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{client.name}</p>
                        <p className="text-xs text-slate-400">{client.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-700">{client.service}</p>
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(client.budget)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                       client.status === 'Fechado' ? 'bg-green-100 text-green-700' :
                       client.status === 'Negociação' ? 'bg-indigo-100 text-indigo-700' :
                       client.status === 'Proposta Enviada' ? 'bg-blue-100 text-blue-700' :
                       'bg-slate-100 text-slate-700'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                      client.paymentStatus === 'Pago' ? 'text-green-600' : 
                      client.paymentStatus === 'Vencido' ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      <i className={`fa-solid fa-circle text-[8px]`}></i>
                      {client.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(client)} className="p-2 text-slate-400 hover:text-blue-600"><i className="fa-solid fa-pen"></i></button>
                      <button onClick={() => onDeleteClient(client.id)} className="p-2 text-slate-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {validationError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 border border-red-100">
                   <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
                   <div>
                     <p className="text-sm font-bold">{validationError}</p>
                     {!editingClient && isLimitReached && (
                       <button 
                         type="button"
                         onClick={() => { setIsModalOpen(false); onNavigateToUpgrade(); }}
                         className="mt-2 text-xs font-black underline"
                       >
                         QUERO SER PRO AGORA
                       </button>
                     )}
                   </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Completo</label>
                  <input
                    type="text" required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                {/* Outros campos */}
                <div className="col-span-2">
                   <button
                    disabled={!editingClient && isLimitReached}
                    type="submit"
                    className={`w-full py-4 text-white font-black rounded-xl transition-all shadow-lg ${
                      !editingClient && isLimitReached 
                        ? 'bg-slate-300 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                    }`}
                  >
                    {editingClient ? 'Salvar Alterações' : isLimitReached ? 'Limite Excedido' : 'Cadastrar Cliente'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManager;
