
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (email: string, pass: string, name?: string) => void;
  adminEmail: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, adminEmail }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const isAdminAttempt = email.toLowerCase() === adminEmail.toLowerCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isRegister && !name)) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      onLogin(email, password, isRegister ? name : undefined);
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 md:bg-slate-50 p-4 transition-colors duration-500">
      <div className={`w-full max-w-md bg-white rounded-[40px] shadow-2xl overflow-hidden animate-slideUp border-4 transition-all duration-300 ${isAdminAttempt ? 'border-amber-400' : 'border-transparent'}`}>
        
        {/* Header Visual */}
        <div className={`p-8 text-center transition-colors duration-500 ${isAdminAttempt ? 'bg-slate-900' : 'bg-blue-600'}`}>
          {isAdminAttempt ? (
            <div className="animate-pulse">
              <i className="fa-solid fa-shield-halved text-amber-400 text-4xl mb-2"></i>
              <h1 className="text-xl font-black text-white uppercase tracking-widest">Painel do Dono</h1>
              <p className="text-amber-200 text-[10px] font-bold">ACESSO RESTRITO E MONITORADO</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                <i className="fa-solid fa-rocket"></i>
                ClienteSimples
              </h1>
              <p className="text-blue-100 text-sm mt-1">O CRM que trabalha por você.</p>
            </>
          )}
        </div>

        <div className="p-10">
          <h2 className="text-xl font-bold text-slate-800 mb-8 text-center">
            {isAdminAttempt 
              ? 'Verificação de Identidade' 
              : isRegister ? 'Crie sua conta em segundos' : 'Faça login no seu painel'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && !isAdminAttempt && (
              <div className="animate-fadeIn">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
                <div className="relative">
                  <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                    placeholder="Ex: João Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">E-mail Profissional</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Sua Senha</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {isAdminAttempt && (
                <p className="mt-2 text-[10px] text-amber-600 font-bold flex items-center gap-1">
                  <i className="fa-solid fa-circle-info"></i>
                  E-mail mestre reconhecido. Insira a senha root.
                </p>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3 border border-red-100 animate-shake">
                <i className="fa-solid fa-circle-exclamation text-lg"></i>
                {error}
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-4 font-black rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                isAdminAttempt 
                  ? 'bg-slate-900 text-amber-400 hover:bg-black shadow-slate-200' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
              }`}
            >
              {isAdminAttempt ? (
                <>
                  <i className="fa-solid fa-key"></i>
                  DESBLOQUEAR PAINEL ADM
                </>
              ) : (
                isRegister ? 'COMEÇAR GRÁTIS' : 'ACESSAR MINHA CONTA'
              )}
            </button>
          </form>

          {!isAdminAttempt && (
            <div className="mt-10 pt-6 border-t border-slate-50 text-center">
              <button
                onClick={() => { setIsRegister(!isRegister); setError(''); }}
                className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
              >
                {isRegister ? 'Já tem uma conta? Entrar' : 'Não tem conta? Criar agora'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
