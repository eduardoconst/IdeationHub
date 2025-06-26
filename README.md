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
- Interagir em uma interface moderna estilo Twitter/X

### Objetivo
Facilitar a coleta, avaliação e priorização de ideias em comunidades, empresas ou grupos de trabalho.

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 19.1.0** - Biblioteca para interfaces de usuário
- **TypeScript 4.9.5** - Superset tipado do JavaScript
- **Tailwind CSS 3.4.1** - Framework CSS utilitário
- **Vite** - Build tool moderna e rápida
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
- [ ] **Autenticação JWT** - Sistema seguro de tokens
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
├── frontend/                  # Aplicação React
│   ├── public/               # Arquivos estáticos
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── IdeaCard.tsx         # Card de ideia individual
│   │   │   ├── Navbar.tsx           # Barra de navegação
│   │   │   ├── LoginModal.tsx       # Modal de login
│   │   │   ├── SignupModal.tsx      # Modal de cadastro
│   │   │   └── CreateIdeaModal.tsx  # Modal de criação
│   │   ├── pages/            # Páginas da aplicação
│   │   │   └── Home.tsx             # Página principal
│   │   ├── context/          # Contextos React
│   │   │   └── AuthContext.tsx      # Contexto de autenticação
│   │   ├── services/         # Serviços e APIs
│   │   │   └── api.js               # Cliente Axios
│   │   ├── App.tsx           # Componente principal
│   │   ├── index.tsx         # Ponto de entrada
│   │   └── index.css         # Estilos globais (Tailwind)
│   ├── package.json          # Dependências do frontend
│   ├── tailwind.config.js    # Configuração do Tailwind
│   └── tsconfig.json         # Configuração do TypeScript
├── backend/                  # API Node.js
│   ├── api/                  # Rotas da API
│   │   ├── auth.js                  # Autenticação
│   │   ├── card.js                  # CRUD de ideias
│   │   ├── user.js                  # Usuários
│   │   ├── vote.js                  # Sistema de votação
│   │   └── validation.js            # Validações
│   ├── config/               # Configurações
│   │   ├── db.js                    # Conexão com banco
│   │   ├── passport.js              # Estratégias de autenticação
│   │   └── routes.js                # Registro de rotas
│   ├── migrations/           # Migrações do banco
│   ├── tests/               # Testes automatizados
│   ├── package.json         # Dependências do backend
│   └── index.js             # Servidor principal
└── README.md                # Documentação do projeto
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
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 💻 Como Usar

### Para Usuários

1. **Acessar a Plataforma**
   - Abra o navegador em http://localhost:3000
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
npm run dev        # Servidor de desenvolvimento
npm run build      # Build de produção
npm run preview    # Preview da build
npm run lint       # Verificar código
```

**Backend:**
```bash
npm run dev        # Servidor com nodemon
npm start          # Servidor de produção
npm run migrate    # Executar migrações
npm test           # Executar testes
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

- **Eduardo Ferreira** - *Desenvolvimento inicial* - [@EduardoFerreiraConst](https://github.com/EduardoFerreiraConst)

## 🙏 Agradecimentos

- Comunidade React pela excelente documentação
- Tailwind CSS pelo framework CSS incrível
- Equipe do Node.js pelo runtime robusto

---

⭐ **Se este projeto te ajudou, deixe uma estrela!**

📧 **Dúvidas?** Abra uma [issue](https://github.com/seu-usuario/ideationhub/issues) ou entre em contato.
