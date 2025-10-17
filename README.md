# TaskForU - Sistema de Gerenciamento de Tarefas

Uma aplicação completa de gerenciamento de tarefas desenvolvida com .NET Core, React.js e PostgreSQL.

## 🚀 Tecnologias Utilizadas

### Backend
- **.NET 8.0** - Framework principal
- **Entity Framework Core** - ORM para acesso ao banco de dados
- **PostgreSQL** - Banco de dados relacional
- **JWT Bearer Authentication** - Autenticação e autorização
- **Swagger/OpenAPI** - Documentação da API
- **xUnit** - Framework de testes unitários

### Frontend
- **React 18** - Biblioteca JavaScript para UI
- **TypeScript** - Superset tipado do JavaScript
- **Redux Toolkit** - Gerenciamento de estado global
- **React Query (TanStack Query)** - Cache e sincronização de dados do servidor
- **Ant Design** - Biblioteca de componentes UI
- **Axios** - Cliente HTTP para requisições

### DevOps
- **Docker & Docker Compose** - Containerização e orquestração
- **PostgreSQL Alpine** - Banco de dados containerizado

## 📋 Funcionalidades

### Autenticação
- Login com usuário e senha fixos
- Geração e validação de tokens JWT
- Proteção de rotas autenticadas

### Gerenciamento de Tarefas
- ✅ Listar todas as tarefas
- ➕ Criar nova tarefa
- ✏️ Editar tarefa existente
- 🗑️ Excluir tarefa
- 📊 Visualizar estatísticas das tarefas

### Interface do Usuário
- Design responsivo com Ant Design
- Gerenciamento de estado otimizado com Redux Toolkit
- Cache inteligente e sincronização de dados com React Query
- Feedback visual para ações do usuário
- Controle de loading e estados de erro
- Atualizações otimistas para melhor UX
- Logout automático quando token expira

## 🏃‍♂️ Como Executar o Projeto

### Pré-requisitos
- **Docker** e **Docker Compose** instalados
- **Git** para clonar o repositório

### Executando com Docker Compose

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd taskforU
```

2. **Execute o projeto:**
```bash
docker-compose up --build
```

3. **Aguarde a inicialização:**
   - PostgreSQL: Porta 5432
   - Backend API: http://localhost:5000
   - Frontend: http://localhost:3000
   - Swagger UI: http://localhost:5000/swagger

### Executando Localmente (Desenvolvimento)

#### Backend
```bash
cd backend
dotnet restore
dotnet run
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## 🔐 Como Fazer Login

### 🔐 Credenciais de Login

Para acessar a aplicação, use as seguintes credenciais:

- **Email**: `admin@taskforu.com`
- **Senha**: `admin123`

### Processo de Login
1. Acesse http://localhost:3000
2. Insira as credenciais acima
3. Clique em "Entrar"
4. Você será redirecionado para o dashboard

## 📚 Como Acessar a API pelo Swagger

1. **Acesse o Swagger UI:** http://localhost:5000/swagger

2. **Faça login para obter o token:**
   - Clique em `POST /api/auth/login`
   - Clique em "Try it out"
   - Use o JSON:
   ```json
   {
     "email": "admin@taskforu.com",
     "password": "admin123"
   }
   ```
   - Execute e copie o token da resposta

3. **Autorize no Swagger:**
   - Clique no botão "Authorize" (🔒)
   - Digite: `Bearer {seu-token-aqui}`
   - Clique em "Authorize"

4. **Teste os endpoints protegidos:**
   - Agora você pode testar todos os endpoints `/api/tasks`

## 🎯 Como Usar a Aplicação

### Dashboard Principal
- **Estatísticas:** Visualize o total de tarefas, concluídas e pendentes
- **Lista de Tarefas:** Veja todas as suas tarefas com status e data de criação

### Gerenciar Tarefas
1. **Criar Tarefa:**
   - Clique em "Nova Tarefa"
   - Preencha título e descrição
   - Clique em "Criar"

2. **Editar Tarefa:**
   - Clique no ícone de edição (✏️) na tarefa desejada
   - Modifique os campos necessários
   - Clique em "Salvar"

3. **Marcar como Concluída:**
   - Clique no ícone de check (✅) para marcar como concluída
   - Ou use o ícone de desfazer (↩️) para marcar como pendente

4. **Excluir Tarefa:**
   - Clique no ícone de lixeira (🗑️)
   - Confirme a exclusão

### Logout
- Clique no ícone de logout no canto superior direito
- Você será redirecionado para a tela de login

## 🧪 Executar Testes

### Testes Unitários do Backend
```bash
cd backend
dotnet test
```

Os testes cobrem:
- ✅ Criação de tarefas
- ✅ Listagem de tarefas
- ✅ Busca por ID
- ✅ Atualização de tarefas
- ✅ Exclusão de tarefas
- ✅ Estatísticas de tarefas

## 🏗️ Estrutura do Projeto

```
taskforU/
├── backend/                 # API .NET Core
│   ├── Controllers/         # Controladores da API
│   ├── Services/           # Lógica de negócio
│   ├── Models/             # Modelos de dados
│   ├── DTOs/               # Objetos de transferência
│   ├── Data/               # Contexto do banco
│   └── Tests/              # Testes unitários
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços de API
│   │   ├── contexts/       # Contextos React
│   │   ├── store/          # Redux store e slices
│   │   ├── hooks/          # Hooks customizados (React Query)
│   │   ├── lib/            # Configurações (QueryClient)
│   │   └── types/          # Definições TypeScript
└── docker-compose.yml      # Orquestração dos containers
```

## 🔧 Configurações

### Variáveis de Ambiente

#### Backend
- `ASPNETCORE_ENVIRONMENT`: Ambiente de execução
- `ASPNETCORE_URLS`: URLs de binding
- `JWT_SECRET`: Chave secreta para JWT
- `JWT_ISSUER`: Emissor do token
- `JWT_AUDIENCE`: Audiência do token

#### Frontend
- `REACT_APP_API_URL`: URL da API backend

### Banco de Dados
- **Host:** localhost (ou postgres no Docker)
- **Porta:** 5432
- **Database:** taskforu
- **Usuário:** postgres
- **Senha:** postgres123

## 🐛 Solução de Problemas

### Problemas Comuns

1. **Erro de conexão com banco:**
   - Verifique se o PostgreSQL está rodando
   - Confirme as credenciais no `docker-compose.yml`

2. **Frontend não conecta com backend:**
   - Verifique se a `REACT_APP_API_URL` está correta
   - Confirme se o backend está rodando na porta 5000

3. **Token JWT inválido:**
   - Faça logout e login novamente
   - Verifique se as configurações JWT estão corretas

### Logs
```bash
# Ver logs de todos os serviços
docker-compose logs

# Ver logs de um serviço específico
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

## 📚 Documentação Adicional

### 📖 Guias e Documentação
- **[🚀 Getting Started](./GETTING_STARTED.md)** - Guia completo de configuração e execução para novos usuários
- **[🏗️ Arquitetura do Sistema](./ARCHITECTURE.md)** - Documentação detalhada da arquitetura, padrões e estrutura do projeto
- **[🎨 Padrões de Design](./docs/DESIGN_PATTERNS.md)** - Padrões de design e boas práticas utilizadas no projeto

### 🎯 Diagramas e Visualizações
- **[📊 Diagrama de Arquitetura](./docs/architecture-diagram.svg)** - Visualização completa da arquitetura 3-tier do sistema

> 💡 **Dica**: Para uma configuração rápida, consulte o [Getting Started](./GETTING_STARTED.md). Para entender a arquitetura em detalhes, veja [ARCHITECTURE.md](./ARCHITECTURE.md) e o [diagrama visual](./docs/architecture-diagram.svg).

## 📝 API Endpoints

### Autenticação
- `POST /api/auth/login` - Fazer login

### Tarefas (Autenticado)
- `GET /api/tasks` - Listar tarefas
- `POST /api/tasks` - Criar tarefa
- `GET /api/tasks/{id}` - Buscar tarefa por ID
- `PUT /api/tasks/{id}` - Atualizar tarefa
- `DELETE /api/tasks/{id}` - Excluir tarefa
- `GET /api/tasks/stats` - Estatísticas das tarefas

## 👥 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.