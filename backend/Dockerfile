# Use a imagem base do Node.js
FROM node:18

# Defina o diretório de trabalho dentro do container
WORKDIR /app

# Copie o package.json e package-lock.json para o container
COPY package*.json ./

# Instale as dependências
RUN npm install

# Instala o nodemon globalmente
RUN npm install -g nodemon

# Copie o restante do código da aplicação
COPY . .

# Exponha a porta que a aplicação irá usar
EXPOSE 4000

# Comando para iniciar a aplicação
CMD ["npm", "start", "--port", "4000"] 