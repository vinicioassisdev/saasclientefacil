
import React, { useState } from 'react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password || (isRegister && !name)) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    // Simulação de autenticação segura
    const mockUser: User = {
      id: btoa(email), // ID baseado no email para o MVP
      name: isRegister ? name : (name || 'Usuário'),
      email,
      plan: 'free'
    };

    onLogin(mockUser);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-slideUp">
        <div className="p-8 text-center bg-blue-600">
          <h1 className="text-2xl font-black text-white flex items-center justify-center gap-2">
            <i className="fa-solid fa-rocket"></i>
            ClienteSimples
          </h1>
          <p className="text-blue-100 text-sm mt-1">O CRM que trabalha por você.</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6 text-center">
            {isRegister ? 'Crie sua conta grátis' : 'Bem-vindo de volta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Seu Nome</label>
                <div className="relative">
                  <i className="fa-solid fa-user absolute left-4 top-3.5 text-slate-400"></i>
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail Profissional</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-4 top-3.5 text-slate-400"></i>
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-3.5 text-slate-400"></i>
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg flex items-center gap-2 animate-shake">
                <i className="fa-solid fa-circle-exclamation"></i>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-95"
            >
              {isRegister ? 'Começar Agora' : 'Acessar Painel'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              {isRegister ? 'Já tem uma conta? Entre aqui' : 'Não tem conta? Crie uma grátis'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
