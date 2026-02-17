#!/bin/bash

echo "🚀 Iniciando configuração do ambiente de desenvolvimento..."

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "📦 Node.js não encontrado. Instalando NVM (Node Version Manager)..."
    
    # Instala NVM
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    
    # Carrega NVM para a sessão atual
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    
    echo "✅ NVM instalado. Instalando a versão LTS do Node.js..."
    nvm install --lts
    nvm use --lts
else
    echo "✅ Node.js já instalado: $(node -v)"
fi

# Verifica se npm está disponível agora
if ! command -v npm &> /dev/null; then
    echo "❌ Erro: npm não encontrado mesmo após tentativa de instalação do Node."
    echo "Por favor, feche este terminal e abra um novo para recarregar as configurações de ambiente, depois rode este script novamente."
    exit 1
fi

echo "📦 Instalando dependências do projeto..."
npm install

echo "🛠️ Criando arquivo de configuração (.env)..."
if [ ! -f .env ]; then
    cp .env.example .env 2>/dev/null || echo "Criando .env do zero..."
    # Se ja criei o .env antes, ele nao vai sobrescrever se o arquivo existir, mas vou garantir que tenha o conteudo basico se estiver vazio
else
    echo "✅ Arquivo .env já existe."
fi

echo "🎉 Ambiente configurado com sucesso!"
echo ""
echo "👉 Próximos passos:"
echo "1. Abra o arquivo .env e configure a URL do seu banco de dados (DATABASE_URL)."
echo "   (Se você não tiver um banco, crie uma conta gratuita em https://neon.tech)"
echo "2. Para iniciar o servidor de desenvolvimento, rode:"
echo "   npm run dev"
