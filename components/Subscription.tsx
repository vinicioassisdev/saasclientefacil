
import React from 'react';

const Subscription: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fadeIn py-8">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-900 mb-4">Escolha o plano ideal para você</h2>
        <p className="text-slate-500 text-lg">Cresça seu negócio de forma organizada com ClienteSimples.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Plano Básico */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Básico</h3>
            <p className="text-slate-500 text-sm">Para quem está começando agora.</p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-black text-slate-900">R$ 29,90</span>
            <span className="text-slate-400">/mês</span>
          </div>
          <ul className="space-y-4 mb-12 flex-1">
            <li className="flex items-center gap-3 text-sm text-slate-600">
              <i className="fa-solid fa-check text-green-500"></i>
              Até 100 clientes ativos
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-600">
              <i className="fa-solid fa-check text-green-500"></i>
              Follow-up inteligente (Gemini AI)
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-600">
              <i className="fa-solid fa-check text-green-500"></i>
              Relatórios financeiros básicos
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-400 italic">
              <i className="fa-solid fa-xmark"></i>
              Automações avançadas
            </li>
          </ul>
          <button className="w-full py-4 rounded-2xl font-bold border-2 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
            Plano Atual
          </button>
        </div>

        {/* Plano Pro */}
        <div className="bg-white rounded-3xl border-2 border-blue-600 shadow-xl shadow-blue-100 p-8 flex flex-col relative">
          <div className="absolute top-0 right-10 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
            Mais Popular
          </div>
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Pro</h3>
            <p className="text-slate-500 text-sm">Ideal para profissionais em escala.</p>
          </div>
          <div className="mb-8">
            <span className="text-4xl font-black text-slate-900">R$ 59,90</span>
            <span className="text-slate-400">/mês</span>
          </div>
          <ul className="space-y-4 mb-12 flex-1">
            <li className="flex items-center gap-3 text-sm text-slate-600 font-semibold">
              <i className="fa-solid fa-check text-green-500"></i>
              Clientes ilimitados
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-600">
              <i className="fa-solid fa-check text-green-500"></i>
              IA Ilimitada (Follow-ups infinitos)
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-600">
              <i className="fa-solid fa-check text-green-500"></i>
              Exportação de dados (PDF/Excel)
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-600">
              <i className="fa-solid fa-check text-green-500"></i>
              Integração direta com Pix
            </li>
            <li className="flex items-center gap-3 text-sm text-slate-600">
              <i className="fa-solid fa-check text-green-500"></i>
              Suporte VIP prioritário
            </li>
          </ul>
          <button className="w-full py-4 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            Upgrade para Pro
          </button>
        </div>
      </div>

      <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200 text-center">
        <h4 className="font-bold text-slate-800 mb-2">Precisa de algo sob medida?</h4>
        <p className="text-slate-500 text-sm mb-6">Temos planos para agências e equipes grandes. Fale conosco.</p>
        <button className="text-blue-600 font-bold hover:underline">Conversar com suporte no WhatsApp</button>
      </div>
    </div>
  );
};

export default Subscription;
