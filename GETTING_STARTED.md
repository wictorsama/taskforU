# 🚀 Getting Started - TaskForU

Este guia irá ajudá-lo a configurar e executar o projeto TaskForU em sua máquina local.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

### Opção 1: Execução com Docker (Recomendado)
- [Docker](https://www.docker.com/get-started) (versão 20.10 ou superior)
- [Docker Compose](https://docs.docker.com/compose/install/) (versão 2.0 ou superior)

### Opção 2: Execução Local
- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [PostgreSQL](https://www.postgresql.org/download/) (versão 13 ou superior)

## 🐳 Execução com Docker (Método Mais Fácil)

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/taskforu.git
cd taskforu
```

### 2. Execute com Docker Compose
```bash
# Construir e iniciar todos os serviços
docker-compose up --build

# Ou executar em segundo plano
docker-compose up --build -d
```

### 3. Acesse a Aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Swagger UI**: http://localhost:5000/swagger

### 4. Credenciais de Login
```
Email: admin@taskforu.com
Senha: Admin123!
```

### 5. Parar os Serviços
```bash
# Parar todos os contêineres
docker-compose down

# Parar e remover volumes (limpar dados)
docker-compose down -v
```

## 💻 Execução Local (Desenvolvimento)

### 1. Clone o Repositório
```bash
git clone https://github.com/seu-usuario/taskforu.git
cd taskforu
```

### 2. Configurar o Banco de Dados PostgreSQL

#### Instalar PostgreSQL
- Windows: Baixe do [site oficial](https://www.postgresql.org/download/windows/)
- macOS: `brew install postgresql`
- Linux: `sudo apt-get install postgresql postgresql-contrib`

#### Criar Banco de Dados
```sql
-- Conectar ao PostgreSQL como superusuário
psql -U postgres

-- Criar banco de dados
CREATE DATABASE taskforu;

-- Criar usuário (opcional)
CREATE USER taskforu_user WITH PASSWORD 'postgres123';
GRANT ALL PRIVILEGES ON DATABASE taskforu TO taskforu_user;
```

### 3. Configurar o Backend (.NET)

```bash
# Navegar para o diretório do backend
cd backend

# Restaurar dependências
dotnet restore

# Configurar string de conexão (opcional)
# Edite appsettings.Development.json se necessário
```

#### Executar Migrations
```bash
# Aplicar migrations ao banco de dados
dotnet ef database update

# Ou criar nova migration (se necessário)
dotnet ef migrations add InitialCreate
```

#### Iniciar o Backend
```bash
# Executar em modo de desenvolvimento
dotnet run

# Ou usar watch para hot reload
dotnet watch run
```

O backend estará disponível em: http://localhost:5000

### 4. Configurar o Frontend (React)

```bash
# Navegar para o diretório do frontend
cd frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm start
```

O frontend estará disponível em: http://localhost:3000

## 🧪 Executar Testes

### Testes do Backend
```bash
cd backend
dotnet test
```

### Testes do Frontend
```bash
cd frontend
npm test
```

## 🔧 Configurações Avançadas

### Variáveis de Ambiente

#### Backend (.env ou appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=taskforu;Username=postgres;Password=postgres123"
  },
  "JwtSettings": {
    "Secret": "your-super-secret-key-here-must-be-at-least-32-characters",
    "Issuer": "TaskForU.Api",
    "Audience": "TaskForU.Frontend",
    "ExpirationInMinutes": 60
  }
}
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

### Portas Personalizadas

#### Backend
```bash
# Executar em porta específica
dotnet run --urls="http://localhost:5001"
```

#### Frontend
```bash
# Definir porta no package.json ou usar variável de ambiente
PORT=3001 npm start
```

## 🐛 Solução de Problemas

### Problemas Comuns

#### 1. Erro de Conexão com Banco de Dados
```bash
# Verificar se PostgreSQL está rodando
# Windows
net start postgresql-x64-13

# macOS/Linux
sudo service postgresql start
```

#### 2. Porta já em Uso
```bash
# Verificar processos usando a porta
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# macOS/Linux
lsof -i :3000
lsof -i :5000
```

#### 3. Problemas com Docker
```bash
# Limpar cache do Docker
docker system prune -a

# Reconstruir sem cache
docker-compose build --no-cache
```

#### 4. Problemas com Node Modules
```bash
# Limpar cache do npm
npm cache clean --force

# Remover node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Logs e Debugging

#### Docker Logs
```bash
# Ver logs de todos os serviços
docker-compose logs

# Ver logs de um serviço específico
docker-compose logs frontend
docker-compose logs backend
docker-compose logs postgres
```

#### Logs do Backend
Os logs aparecem no console quando executado com `dotnet run`

#### Logs do Frontend
Os logs aparecem no console do navegador (F12 → Console)

## 📚 Recursos Adicionais

### Documentação da API
- Acesse http://localhost:5000/swagger quando o backend estiver rodando
- Documentação interativa com todos os endpoints disponíveis

### Estrutura do Projeto
```
taskforu/
├── frontend/          # Aplicação React
├── backend/           # API .NET
├── docs/             # Documentação
├── docker-compose.yml # Configuração Docker
└── README.md         # Documentação principal
```

### Comandos Úteis

#### Docker
```bash
# Ver contêineres rodando
docker ps

# Entrar em um contêiner
docker exec -it taskforu_backend bash
docker exec -it taskforu_postgres psql -U postgres -d taskforu

# Ver logs em tempo real
docker-compose logs -f
```

#### .NET
```bash
# Verificar versão
dotnet --version

# Listar migrations
dotnet ef migrations list

# Reverter migration
dotnet ef database update PreviousMigrationName
```

#### Node.js
```bash
# Verificar versão
node --version
npm --version

# Audit de segurança
npm audit

# Atualizar dependências
npm update
```

## 🆘 Precisa de Ajuda?

Se você encontrar problemas:

1. Verifique se todos os pré-requisitos estão instalados
2. Consulte a seção de solução de problemas acima
3. Verifique os logs para mensagens de erro específicas
4. Abra uma issue no repositório do GitHub

## 🎉 Próximos Passos

Após configurar com sucesso:

1. Explore a aplicação usando as credenciais fornecidas
2. Teste as funcionalidades de criação, edição e exclusão de tarefas
3. Acesse a documentação da API via Swagger
4. Experimente fazer modificações no código e veja as mudanças em tempo real

Boa sorte e happy coding! 🚀