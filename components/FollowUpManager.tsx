
import React, { useState } from 'react';
import { Client, ClientStatus, PaymentStatus } from '../types';
import { generateFollowUpMessage } from '../services/geminiService';

interface FollowUpManagerProps {
  clients: Client[];
  onUpdateClient: (client: Client) => void;
}

const FollowUpManager: React.FC<FollowUpManagerProps> = ({ clients, onUpdateClient }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [aiMessage, setAiMessage] = useState<{ id: string, text: string } | null>(null);

  const pendingClients = clients.filter(c => {
    const isOverdue = new Date(c.nextFollowUp) < new Date();
    const isPaymentPending = c.paymentStatus === PaymentStatus.VENCIDO;
    return (isOverdue && c.status !== ClientStatus.FECHADO && c.status !== ClientStatus.PERDIDO) || isPaymentPending;
  });

  const handleGenerateMessage = async (client: Client) => {
    setLoadingId(client.id);
    try {
      const msg = await generateFollowUpMessage(client);
      setAiMessage({ id: client.id, text: msg });
    } finally {
      setLoadingId(null);
    }
  };

  const handleSendWhatsApp = (client: Client, message: string) => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/55${client.phone.replace(/\D/g,'')}?text=${encoded}`, '_blank');
    
    // Atualiza data do próximo follow-up para daqui 3 dias automaticamente ao enviar
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 3);
    onUpdateClient({
      ...client,
      nextFollowUp: nextDate.toISOString(),
      lastInteraction: new Date().toISOString()
    });
    setAiMessage(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Follow-up Inteligente</h2>
        <p className="text-slate-500">A IA sugere as melhores abordagens para recuperar contatos e cobrar pagamentos.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingClients.map(client => (
          <div key={client.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  client.paymentStatus === PaymentStatus.VENCIDO ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                }`}>
                  {client.paymentStatus === PaymentStatus.VENCIDO ? 'Cobrança Pendente' : 'Retomar Contato'}
                </div>
                <span className="text-xs text-slate-400">
                  Atraso: {Math.floor((new Date().getTime() - new Date(client.nextFollowUp).getTime()) / (1000 * 3600 * 24))} dias
                </span>
              </div>
              
              <h4 className="font-bold text-slate-800 text-lg">{client.name}</h4>
              <p className="text-sm text-slate-500 mb-4">{client.service}</p>

              {aiMessage?.id === client.id ? (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 animate-fadeIn mb-4">
                  <p className="text-xs font-bold text-blue-600 uppercase mb-2">Sugestão da IA:</p>
                  <p className="text-sm text-slate-700 italic">"{aiMessage.text}"</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <i className="fa-solid fa-robot"></i>
                  </div>
                  <p className="text-xs text-slate-500">Clique abaixo para gerar uma mensagem personalizada.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              {aiMessage?.id === client.id ? (
                <>
                  <button
                    onClick={() => setAiMessage(null)}
                    className="flex-1 py-2 rounded-lg text-xs font-bold bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"
                  >
                    Trocar
                  </button>
                  <button
                    onClick={() => handleSendWhatsApp(client, aiMessage.text)}
                    className="flex-[2] py-2 rounded-lg text-xs font-bold bg-green-500 text-white hover:bg-green-600 flex items-center justify-center gap-2"
                  >
                    <i className="fa-brands fa-whatsapp"></i>
                    Enviar no Whats
                  </button>
                </>
              ) : (
                <button
                  disabled={loadingId === client.id}
                  onClick={() => handleGenerateMessage(client)}
                  className="w-full py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  {loadingId === client.id ? (
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  )}
                  Gerar Mensagem com IA
                </button>
              )}
            </div>
          </div>
        ))}

        {pendingClients.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-2xl mb-4">
              <i className="fa-solid fa-check-double"></i>
            </div>
            <p className="text-slate-500 font-medium text-lg">Incrível! Todos os seus follow-ups estão em dia.</p>
            <p className="text-slate-400 text-sm">Aproveite para prospectar novos clientes!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowUpManager;
