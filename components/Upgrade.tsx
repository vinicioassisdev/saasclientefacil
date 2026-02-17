
import React, { useState } from 'react';

const Upgrade: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const pixKey = "81989492431";

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 p-8 md:p-12 bg-blue-600 text-white">
            <h2 className="text-3xl font-black mb-6">Seja Pro e escale seu negócio!</h2>
            <ul className="space-y-4">
              {[
                "Clientes ilimitados (Adeus limite de 10)",
                "IA com créditos infinitos",
                "Relatórios financeiros detalhados",
                "Suporte prioritário via WhatsApp",
                "Exportação de dados para Excel/PDF"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-blue-100 font-medium">
                  <i className="fa-solid fa-circle-check text-white"></i>
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-12 p-6 bg-blue-700/50 rounded-2xl border border-blue-500">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-200 mb-2">Investimento Especial</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">R$ 39,90</span>
                <span className="text-blue-200">/mês</span>
              </div>
            </div>
          </div>

          <div className="md:w-1/2 p-8 md:p-12">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center md:text-left">Pagamento via Pix</h3>
            
            <div className="bg-slate-50 p-6 rounded-2xl border-2 border-dashed border-slate-200 mb-8">
              <p className="text-xs font-bold text-slate-500 uppercase mb-4 text-center">Escaneie ou copie a chave</p>
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 bg-white p-2 rounded-lg shadow-sm border border-slate-100 flex items-center justify-center">
                  <i className="fa-solid fa-qrcode text-6xl text-slate-800"></i>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Chave Pix (Telefone)</label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={pixKey}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono font-bold text-slate-700"
                  />
                  <button 
                    onClick={handleCopy}
                    className={`px-4 py-2 rounded-lg font-bold text-white transition-all ${copied ? 'bg-green-500' : 'bg-slate-800 hover:bg-slate-900'}`}
                  >
                    {copied ? <i className="fa-solid fa-check"></i> : <i className="fa-solid fa-copy"></i>}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-center">
              <p className="text-sm text-slate-600 font-medium">
                Após realizar o pagamento, envie o comprovante para nosso WhatsApp para ativação manual.
              </p>
              <a 
                href="https://wa.me/5581989411840?text=Acabei%20de%20pagar%20o%20Plano%20Pro%20do%20ClienteSimples"
                target="_blank"
                rel="noreferrer"
                className="block w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl shadow-lg shadow-green-100 transition-all flex items-center justify-center gap-3"
              >
                <i className="fa-brands fa-whatsapp text-xl"></i>
                Enviar Comprovante
              </a>
              <p className="text-[10px] text-slate-400">Ativação manual em até 30 minutos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
