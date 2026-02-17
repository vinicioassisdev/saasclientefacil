#!/bin/bash

# Garante que o NVM seja carregado
export NVM_DIR="$HOME/.nvm"
if [ -s "$NVM_DIR/nvm.sh" ]; then
   \. "$NVM_DIR/nvm.sh"
else
   echo "❌ NVM não encontrado. Tentando instalar novamente..."
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi

# Instala e usa a versão LTS do Node
echo "🔄 Configurando Node.js..."
nvm install --lts
nvm use --lts

# Verifica se o npm está funcionando
if ! command -v npm &> /dev/null; then
    echo "❌ Erro crítico: npm ainda não foi encontrado."
    exit 1
fi

echo "📦 Instalando dependências..."
npm install

echo "🚀 Iniciando o servidor de desenvolvimento..."
npm run dev
