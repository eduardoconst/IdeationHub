# 💡 IdeationHub

> Uma plataforma colaborativa moderna para criação, visualização e votação de ideias

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

## 🎯 Sobre o Projeto

O **IdeationHub** é uma aplicação web que facilita a colaboração e inovação através de uma plataforma intuitiva para compartilhamento de ideias. Com uma interface moderna inspirada em redes sociais, os usuários podem criar, visualizar e votar em ideias de forma simples e interativa.

### ✨ Principais Problemas Resolvidos
- **Centralização de ideias** em um ambiente colaborativo
- **Votação democrática** para validação de conceitos
- **Interface intuitiva** que incentiva a participação
- **Organização eficiente** de propostas e feedback

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 19.1.0** - Biblioteca para interfaces de usuário
- **TypeScript 4.9.5** - Tipagem estática para JavaScript
- **Tailwind CSS 3.4.1** - Framework CSS utilitário
- **Axios 1.10.0** - Cliente HTTP para APIs
- **Recharts 3.2.1** - Biblioteca de gráficos

### Backend
- **Node.js** - Runtime JavaScript
- **Express 4.21.2** - Framework web minimalista
- **PostgreSQL** - Banco de dados relacional
- **Knex.js 3.1.0** - Query builder SQL
- **JWT** - Autenticação por tokens
- **bcrypt** - Criptografia de senhas
- **Passport.js** - Middleware de autenticação

### Ferramentas de Desenvolvimento
- **Nodemon** - Auto-restart do servidor
- **ESLint** - Linter para JavaScript/TypeScript
- **Jest** - Framework de testes
- **PM2** - Gerenciador de processos

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Node.js** (versão 16 ou superior)
- **PostgreSQL** (versão 12 ou superior)
- **npm** ou **yarn**

### 1. Clone o repositório
```bash
git clone https://github.com/eduardoconst/IdeationHub.git
cd IdeationHub
```

### 2. Configuração do Backend
```bash
# Navegue para o diretório do backend
cd backend

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações do PostgreSQL

# Execute as migrações do banco de dados
npm run migrate

# Inicie o servidor de desenvolvimento
npm start
```

### 3. Configuração do Frontend
```bash
# Em um novo terminal, navegue para o frontend
cd frontend

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm start
```

### 4. Acesse a aplicação
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:3001`

---

## 📁 Estrutura do Projeto

```
IdeationHub/
├── 📂 backend/
│   ├── 📂 api/              # Controladores da API
│   ├── 📂 config/           # Configurações (DB, rotas, auth)
│   ├── 📂 migrations/       # Migrações do banco de dados
│   └── 📄 index.js          # Ponto de entrada do servidor
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 components/   # Componentes reutilizáveis
│   │   ├── 📂 context/      # Contextos React (AuthContext)
│   │   ├── 📂 hooks/        # Hooks customizados
│   │   ├── 📂 pages/        # Páginas da aplicação
│   │   ├── 📂 services/     # Serviços de API
│   │   └── 📄 App.tsx       # Componente principal
│   │
│   ├── 📂 public/           # Arquivos públicos
│   └── 📂 build/            # Build de produção
│
└── 📄 README.md
```

### Principais Diretórios Frontend
- **`components/`** - Componentes UI como IdeaCard, Navbar, Modais
- **`hooks/`** - Hooks para localStorage, notificações e preferências
- **`pages/`** - Página principal (Home) com feed de ideias
- **`services/`** - Integração com API (authService, cardService)
- **`context/`** - Gerenciamento de estado global (autenticação)

---

## 💎 Principais Recursos

### 🎨 Interface e Experiência
- ✅ **Design responsivo** com Tailwind CSS
- ✅ **Modo claro/escuro** com persistência local
- ✅ **Interface moderna** inspirada em cards
- ✅ **Animações suaves** e feedback visual
- ✅ **Notificações toast** para ações do usuário

### 📝 Gerenciamento de Ideias
- ✅ **Criar ideias** com título e descrição
- ✅ **Visualizar feed** de ideias em tempo real
- ✅ **Sistema de votação** (Sim/Não) intuitivo
- ✅ **Filtros inteligentes** (Ativas, Encerradas, Recentes)
- ✅ **Estatísticas em tempo real** (total de ideias, votos, usuários)

### 🔐 Autenticação e Segurança
- ✅ **Sistema de login/registro** seguro
- ✅ **Autenticação JWT** persistente
- ✅ **Controle de permissões** (criador/admin)
- ✅ **Proteção de rotas** sensíveis
- ✅ **Validação de dados** no frontend e backend

### ⚡ Performance e Usabilidade
- ✅ **Atualizações inteligentes** baseadas em visibilidade
- ✅ **Cache local** de preferências do usuário
- ✅ **Fallbacks** para conectividade instável
- ✅ **Loading states** e feedback de ações

---

## 🔐 Sistema de Autenticação

### Funcionalidades de Auth
- **Registro de usuários** com validação de dados
- **Login persistente** com JWT tokens
- **Proteção de rotas** automática
- **Refresh de sessão** transparente
- **Logout seguro** com limpeza de dados

### Fluxo de Autenticação
1. Usuário faz login → Backend valida credenciais
2. JWT token é gerado e armazenado localmente
3. Todas as requisições incluem o token automaticamente
4. Token é validado em rotas protegidas
5. Renovação automática antes da expiração

---

## 🎨 Design e Interface

### Princípios de Design
- **Mobile-first** - Responsivo em todos os dispositivos
- **Accessibility** - Suporte a leitores de tela e navegação por teclado
- **Performance** - Carregamento rápido e animações fluidas
- **Consistency** - Design system consistente com Tailwind CSS

### Componentes Principais
- **IdeaCard** - Card de ideia com votação e ações
- **Navbar** - Navegação principal com busca
- **Modais** - Login, criação de ideias, configurações
- **ToastContainer** - Sistema de notificações
- **ConfirmDialog** - Diálogos de confirmação

---

## 🗃️ Banco de Dados

### Estrutura Principal
```sql
📋 users
├── id (Primary Key)
├── name
├── email (Unique)
├── password (Encrypted)
├── admin (Boolean)
└── created_at

📋 cards (ideias)
├── id (Primary Key)
├── title
├── content
├── userID (Foreign Key)
├── voting_start
├── voting_end
└── created_at

📋 votes
├── id (Primary Key)
├── cardID (Foreign Key)
├── userID (Foreign Key)
├── vote (Boolean: true=sim, false=não)
├── anonymous (Boolean)
└── created_at
```

---

## 🧭 Roadmap e Melhorias Futuras

### 🔄 Curto Prazo
- [ ] **Sistema de comentários** nas ideias
- [ ] **Ranking de ideias** mais votadas
- [ ] **Categorias/tags** para organização
- [ ] **Notificações em tempo real** (WebSocket)

### 🚀 Médio Prazo
- [ ] **Dashboard administrativo** completo
- [ ] **Relatórios e analytics** detalhados
- [ ] **Sistema de badges** e gamificação
- [ ] **API pública** para integração

### 🔮 Longo Prazo
- [ ] **Integração com IA** para sugestões de ideias
- [ ] **Modo colaborativo** em tempo real
- [ ] **Integração com Slack/Teams**
- [ ] **Mobile app nativo** (React Native)

---

## 📊 Scripts Disponíveis

### Frontend
```bash
npm start          # Servidor de desenvolvimento
npm run build      # Build de produção
npm test           # Executar testes
npm run eject      # Ejetar configuração (irreversível)
```

### Backend
```bash
npm start          # Servidor de desenvolvimento (nodemon)
npm run production # Deploy com PM2
npm test           # Executar testes
npm run lint       # Verificar código com ESLint
```

---

## 🤝 Contribuindo

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/MinhaFeature`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. **Push** para a branch (`git push origin feature/MinhaFeature`)
5. Abra um **Pull Request**

### Padrões de Código
- Use **TypeScript** para tipagem estática
- Siga as convenções do **ESLint** configurado
- Adicione **testes** para novas funcionalidades
- Documente **APIs** e funções complexas

---

## 📝 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Eduardo Ferreira Constantino**

- 🌐 GitHub: [@eduardoconst](https://github.com/eduardoconst)
- 📧 Email: [eduardoconstantino2003@gmail.com](mailto:eduardoconstantino2003@gmail.com)
- 💼 LinkedIn: [Eduardo Constantino](https://linkedin.com/in/eduardo-constantino)

---

## 🙏 Agradecimentos

- **React Team** pela excelente biblioteca
- **Tailwind CSS** pelo sistema de design flexível
- **Comunidade Open Source** pelas ferramentas utilizadas
- **Contribuidores** que ajudaram a melhorar o projeto

---

<div align="center">

**⭐ Se este projeto foi útil para você, considere dar uma estrela!**

[🐛 Reportar Bug](https://github.com/eduardoconst/IdeationHub/issues) • [✨ Solicitar Feature](https://github.com/eduardoconst/IdeationHub/issues) • [📖 Documentação](https://github.com/eduardoconst/IdeationHub/wiki)

</div>
