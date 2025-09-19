# 💡 IdeationHub

Uma plataforma moderna para compartilhamento e votação de ideias, construída com React + TypeScript no frontend e Node.js no backend.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Funcionalidades](#funcionalidades)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Instalação e Configuração](#instalação-e-configuração)
- [Como Usar](#como-usar)
- [API Endpoints](#api-endpoints)
- [Contribuição](#contribuição)

## 🎯 Sobre o Projeto

O **IdeationHub** é uma plataforma colaborativa onde usuários podem:
- Compartilhar suas ideias inovadoras
- Votar em ideias de outros usuários (👍/👎)
- Visualizar rankings das ideias mais populares
- Definir tempo limite para votação de cada ideia
- Interagir em uma interface moderna

### Objetivo
Facilitar a coleta, avaliação e priorização de ideias em comunidades, empresas ou grupos de trabalho.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19.1.0** - Biblioteca para interfaces de usuário
- **TypeScript 4.9.5** - Superset tipado do JavaScript
- **Tailwind CSS 3.4.1** - Framework CSS utilitário
- **Axios** - Cliente HTTP para requisições à API

### Backend
- **Node.js** - Runtime JavaScript no servidor
- **Express.js** - Framework web para Node.js
- **Knex.js** - Query builder SQL
- **PostgreSQL** - Banco de dados relacional
- **Passport.js** - Middleware de autenticação
- **bcrypt** - Criptografia de senhas

### Ferramentas de Desenvolvimento
- **ESLint** - Linter para JavaScript/TypeScript
- **PostCSS** - Ferramenta para transformação CSS
- **Git** - Controle de versão

## ✨ Funcionalidades

### 🎨 Interface do Usuário
- [x] **Design Responsivo** - Funciona em desktop, tablet e mobile
- [x] **Modo Escuro/Claro** - Alternância de tema com persistência
- [x] **Componentes Reutilizáveis** - Sistema de design consistente
- [x] **Animações Suaves** - Transições e hover effects

### 🔐 Autenticação
- [x] **Modal de Login** - Interface limpa com validação
- [x] **Modal de Cadastro** - Formulário completo com verificações
- [x] **Validação de Formulários** - Feedback em tempo real
- [x] **Autenticação JWT** - Sistema seguro de tokens
- [ ] **Recuperação de Senha** - Reset via email

### 💡 Gerenciamento de Ideias
- [x] **Criação de Ideias** - Modal com preview em tempo real
- [x] **Votação Interativa** - Sistema de likes/dislikes
- [x] **Timer de Votação** - Tempo limite configurável (1h a 1 semana)
- [x] **Filtros e Ordenação** - Por popularidade, tempo, recência
- [ ] **Categorias** - Organização por temas
- [ ] **Comentários** - Discussão sobre ideias

### 📊 Dashboard e Estatísticas
- [x] **Cards de Estatísticas** - Total de ideias, votos, participantes
- [x] **Filtros Dinâmicos** - "Todas", "Em Alta", "Recentes"
- [x] **Porcentagem de Aprovação** - Cálculo automático nos cards
- [ ] **Gráficos e Métricas** - Visualização avançada de dados
- [ ] **Rankings** - Top ideias e usuários mais ativos

## 📁 Estrutura do Projeto

```
IdeationHub/
├── .github/                   # Configurações do GitHub
├── .gitignore                 # Arquivos ignorados pelo Git
├── frontend/                  # Aplicação React
│   ├── public/               # Arquivos estáticos
│   │   └── index.html        # Template HTML principal
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── AdminCenterModal.tsx     # Modal do centro administrativo
│   │   │   ├── CreateIdeaModal.tsx      # Modal de criação de ideias
│   │   │   ├── IdeaCard.tsx             # Card de ideia individual
│   │   │   ├── LoginModal.tsx           # Modal de login
│   │   │   ├── Navbar.tsx               # Barra de navegação
│   │   │   ├── ProfileModal.tsx         # Modal de perfil do usuário
│   │   │   ├── SettingsModal.tsx        # Modal de configurações
│   │   │   ├── SettingsProfile.tsx      # Configurações do perfil
│   │   │   └── SignupModal.tsx          # Modal de cadastro
│   │   ├── context/          # Contextos React
│   │   │   └── AuthContext.tsx          # Contexto de autenticação
│   │   ├── hooks/            # Hooks personalizados
│   │   │   ├── useLocalStorage.ts       # Hook para localStorage
│   │   │   └── useUserPreferences.ts    # Hook para preferências
│   │   ├── pages/            # Páginas da aplicação
│   │   │   └── Home.tsx                 # Página principal
│   │   ├── services/         # Serviços e APIs
│   │   │   ├── adminService.ts          # Serviços administrativos
│   │   │   ├── api.js                   # Cliente Axios
│   │   │   ├── authService.ts           # Serviços de autenticação
│   │   │   └── cardService.ts           # Serviços de cards/ideias
│   │   ├── assets/           # Recursos estáticos (imagens, ícones)
│   │   ├── App.tsx           # Componente principal
│   │   ├── index.tsx         # Ponto de entrada
│   │   └── index.css         # Estilos globais (Tailwind)
│   ├── .gitignore            # Arquivos ignorados (frontend)
│   ├── package.json          # Dependências do frontend
│   ├── postcss.config.js     # Configuração do PostCSS
│   ├── tailwind.config.js    # Configuração do Tailwind CSS
│   └── tsconfig.json         # Configuração do TypeScript
├── backend/                  # API Node.js
│   ├── api/                  # Rotas da API
│   │   ├── admin.js                     # Rotas administrativas
│   │   ├── auth.js                      # Autenticação
│   │   ├── card.js                      # CRUD de ideias
│   │   ├── user.js                      # Usuários
│   │   ├── validation.js                # Validações
│   │   └── vote.js                      # Sistema de votação
│   ├── config/               # Configurações
│   │   ├── admin.js                     # Configurações administrativas
│   │   ├── db.js                        # Conexão com banco
│   │   ├── middlewares.js               # Middlewares Express
│   │   ├── passport.js                  # Estratégias de autenticação
│   │   └── routes.js                    # Registro de rotas
│   ├── migrations/           # Migrações do banco
│   │   ├── 20240610120000_add_showVotes_to_votes.js
│   │   ├── 20250317173421_create_table_users.js
│   │   ├── 20250317173523_create_table_card.js
│   │   ├── 20250324133650_create_table_votes.js
│   │   ├── 20250627123535_add_deleted_at_table_users.js
│   │   ├── 20250702000000_alter_card_content_to_text.js
│   │   ├── 20250702171628_add_created_at_to_users.js
│   │   └── 20250702171636_add_created_at_to_users.js
│   ├── tests/                # Testes automatizados
│   │   └── database.test.js             # Testes do banco de dados
│   ├── .env                  # Variáveis de ambiente (não versionado)
│   ├── index.js              # Servidor principal
│   ├── knexfile.js           # Configuração do Knex.js
│   ├── package.json          # Dependências do backend
│   ├── readme.md             # Documentação específica do backend
│   ├── test-admin-functions.js # Testes das funções administrativas
│   └── test-admin.js         # Testes administrativos
└── README.md                 # Documentação principal do projeto
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- PostgreSQL 12+

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/ideationhub.git
cd ideationhub
```

### 2. Configuração do Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Executar migrações
npm run migrate

# Iniciar servidor de desenvolvimento
npm run dev
```

### 3. Configuração do Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar aplicação de desenvolvimento
npm run dev
```

### 4. Acessar a aplicação
- Frontend: http://localhost:4000
- Backend API: http://localhost:3000

## 💻 Como Usar

### Para Usuários

1. **Acessar a Plataforma**
   - Abra o navegador em http://localhost:4000
   - A página inicial mostra todas as ideias ativas

2. **Criar uma Conta**
   - Clique em "Entrar" → "Cadastre-se"
   - Preencha nome, email e senha
   - Aceite os termos de serviço

3. **Criar uma Ideia**
   - Clique no botão "Nova Ideia"
   - Adicione título e descrição detalhada
   - Defina o tempo de votação (1h a 1 semana)
   - Visualize o preview e publique

4. **Votar em Ideias**
   - Navigate pela lista de ideias
   - Clique em 👍 (aprovar) ou 👎 (reprovar)
   - Acompanhe a porcentagem de aprovação

5. **Filtrar e Ordenar**
   - Use os filtros: "Todas", "Em Alta", "Recentes"
   - Ordene por: "Mais Votadas", "Tempo Restante", "Mais Recentes"

### Para Desenvolvedores

#### Comandos Úteis

**Frontend:**
```bash
npm start     
npm run build      
npm run preview    
```

**Backend:**
```bash
npm start          
npm run migrate    
npm test           
```

## 🔌 API Endpoints

### Autenticação
```http
POST /api/auth/login          # Login de usuário
POST /api/auth/register       # Cadastro de usuário
POST /api/auth/logout         # Logout
GET  /api/auth/me            # Dados do usuário logado
```

### Ideias (Cards)
```http
GET    /api/cards            # Listar todas as ideias
POST   /api/cards            # Criar nova ideia
GET    /api/cards/:id        # Buscar ideia por ID
PUT    /api/cards/:id        # Atualizar ideia
DELETE /api/cards/:id        # Deletar ideia
```

### Votação
```http
POST   /api/votes            # Registrar voto
GET    /api/votes/:cardId    # Buscar votos de uma ideia
DELETE /api/votes/:id        # Remover voto
```

### Usuários
```http
GET    /api/users            # Listar usuários
GET    /api/users/:id        # Buscar usuário por ID
PUT    /api/users/:id        # Atualizar perfil
```

## 🎨 Componentes e Funções

### IdeaCard.tsx
**Principais funções:**
- `handleVote()` - Processa cliques nos botões de voto
- Exibe informações da ideia (título, descrição, tempo)
- Calcula porcentagem de aprovação
- Design responsivo com hover effects

### Navbar.tsx
**Principais funções:**
- `onToggleDarkMode()` - Alterna tema claro/escuro
- `onOpenLogin()` - Abre modal de login
- `onOpenCreateIdea()` - Abre modal de criação
- Barra de busca (placeholder)

### LoginModal.tsx
**Principais funções:**
- `handleSubmit()` - Processa formulário de login
- Validação de email e senha
- Estado de loading
- Alternância para cadastro

### SignupModal.tsx
**Principais funções:**
- `handleSubmit()` - Processa cadastro
- `validateForm()` - Validação completa
- `handleChange()` - Atualiza campos
- Confirmação de senha

### CreateIdeaModal.tsx
**Principais funções:**
- `handleSubmit()` - Cria nova ideia
- `validateForm()` - Valida campos obrigatórios
- Preview em tempo real
- Seleção de duração da votação

### Home.tsx
**Principais funções:**
- `handleVote()` - Gerencia votação local
- Sistema de filtros e ordenação
- Cálculo de estatísticas dinâmicas
- Renderização da lista de ideias

## 🤝 Contribuição

1. **Fork** o projeto
2. Crie sua **feature branch** (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um **Pull Request**

### Padrões de Código
- Use **TypeScript** para tipagem
- Siga as convenções do **ESLint**
- Adicione **comentários** explicativos
- Escreva **testes** para novas funcionalidades
- Use **commits semânticos**

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Autores

- **Eduardo Ferreira** - *Desenvolvimento inicial* - [@eduardoconst](https://github.com/eduardoconst)

## 🙏 Agradecimentos

- Comunidade React pela excelente documentação
- Tailwind CSS pelo framework CSS incrível
- Equipe do Node.js pelo runtime robusto

---

⭐ **Se este projeto te ajudou, deixe uma estrela!**

📧 **Dúvidas?** Abra uma [issue](https://github.com/seu-usuario/ideationhub/issues) ou entre em contato.
