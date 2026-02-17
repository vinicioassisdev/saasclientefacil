
import React, { useState } from 'react';

const Upgrade: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const pixCode = "00020126580014br.gov.bcb.pix0136b3363530-0d53-4833-9759-57b5e83a9c56520400005303986540539.905802BR5916Vinicio de Assis6009Sao Paulo62230519daqr38407328802255463048B53";
  
  // URL para geração do QR Code via API externa segura
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="md:flex">
          {/* Coluna de Benefícios */}
          <div className="md:w-1/2 p-8 md:p-12 bg-blue-600 text-white flex flex-col justify-between">
            <div>
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
            </div>
            
            <div className="mt-12 p-6 bg-blue-700/50 rounded-2xl border border-blue-500">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-200 mb-2">Investimento Especial</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">R$ 39,90</span>
                <span className="text-blue-200">/mês</span>
              </div>
            </div>
          </div>

          {/* Coluna de Pagamento */}
          <div className="md:w-1/2 p-8 md:p-12">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center md:text-left">Pagamento via Pix</h3>
            
            <div className="bg-slate-50 p-6 rounded-3xl border-2 border-dashed border-slate-200 mb-8 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Escaneie o QR Code abaixo</p>
              
              <div className="flex justify-center mb-6">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code PIX" 
                    className="w-40 h-40 object-contain"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">PIX Copia e Cola</label>
                <div className="flex flex-col gap-2">
                  <textarea 
                    readOnly 
                    value={pixCode}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[10px] font-mono font-bold text-slate-600 h-20 resize-none focus:outline-none"
                  />
                  <button 
                    onClick={handleCopy}
                    className={`w-full py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                      copied 
                        ? 'bg-green-500 text-white' 
                        : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200'
                    }`}
                  >
                    {copied ? (
                      <>
                        <i className="fa-solid fa-check"></i>
                        CÓDIGO COPIADO!
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-copy"></i>
                        COPIAR CÓDIGO PIX
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-center">
              <p className="text-sm text-slate-600 font-medium">
                Após realizar o pagamento, envie o comprovante para nosso WhatsApp para ativação.
              </p>
              <a 
                href="https://wa.me/5581989411840?text=Acabei%20de%20pagar%20o%20Plano%20Pro%20do%20ClienteSimples.%20Aqui%20está%20meu%20comprovante."
                target="_blank"
                rel="noreferrer"
                className="block w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-3 transform active:scale-95"
              >
                <i className="fa-brands fa-whatsapp text-xl"></i>
                Enviar Comprovante
              </a>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ativação manual em até 30 minutos.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
