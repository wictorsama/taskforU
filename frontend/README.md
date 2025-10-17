# TaskForU - Frontend

Interface web do sistema de gerenciamento de tarefas TaskForU, desenvolvida com React.js, TypeScript e Ant Design.

## 🚀 Tecnologias Utilizadas

- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset tipado do JavaScript
- **Ant Design** - Biblioteca de componentes UI
- **Axios** - Cliente HTTP para comunicação com a API
- **React Router** - Roteamento da aplicação
- **Context API** - Gerenciamento de estado global

## 📋 Funcionalidades

### Autenticação
- Tela de login com validação
- Gerenciamento de sessão com JWT
- Logout automático quando token expira
- Redirecionamento automático para áreas protegidas

### Dashboard
- Estatísticas em tempo real das tarefas
- Cards informativos com totais
- Interface responsiva e intuitiva

### Gerenciamento de Tarefas
- **Listagem**: Visualização paginada com filtros
- **Criação**: Formulário para novas tarefas
- **Edição**: Modificação inline de tarefas existentes
- **Status**: Alteração rápida entre Pendente/Concluída
- **Exclusão**: Remoção com confirmação
- **Filtros**: Por status e busca textual
- **Paginação**: Navegação eficiente entre páginas

## 🏃‍♂️ Como Executar

### Pré-requisitos
- Node.js 16+ instalado
- npm ou yarn
- Backend da API rodando (porta 5000)

### Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm start

# Executar testes
npm test

# Build para produção
npm run build
```

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do frontend:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🔐 Credenciais de Acesso

Para fazer login na aplicação:

- **Email**: `admin@taskforu.com`
- **Senha**: `admin123`

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── AppLayout.tsx   # Layout principal da aplicação
│   └── TaskForm.tsx    # Formulário de tarefas
├── contexts/           # Contextos React (Estado Global)
│   ├── AuthContext.tsx # Gerenciamento de autenticação
│   └── TaskContext.tsx # Gerenciamento de tarefas
├── pages/              # Páginas da aplicação
│   ├── Login.tsx       # Tela de login
│   ├── Dashboard.tsx   # Dashboard principal
│   └── Tasks.tsx       # Gerenciamento de tarefas
├── services/           # Camada de serviços
│   └── api.ts          # Cliente HTTP e endpoints
├── types/              # Definições TypeScript
│   └── index.ts        # Interfaces e tipos
├── App.tsx             # Componente raiz
└── index.tsx           # Ponto de entrada
```

## 🎨 Componentes Principais

### AppLayout
Layout base da aplicação com:
- Header com informações do usuário
- Menu de navegação
- Botão de logout
- Área de conteúdo responsiva

### TaskForm
Formulário reutilizável para:
- Criação de novas tarefas
- Edição de tarefas existentes
- Validação de campos obrigatórios

### AuthContext
Gerencia:
- Estado de autenticação
- Informações do usuário logado
- Funções de login/logout
- Persistência do token

### TaskContext
Controla:
- Lista de tarefas
- Operações CRUD
- Estados de loading
- Filtros e paginação
- Estatísticas

## 🔧 Scripts Disponíveis

### `npm start`
Executa a aplicação em modo desenvolvimento.\
Acesse [http://localhost:3000](http://localhost:3000) no navegador.

### `npm test`
Executa os testes em modo interativo.\
Veja mais sobre [testes no Create React App](https://facebook.github.io/create-react-app/docs/running-tests).

### `npm run build`
Gera build otimizado para produção na pasta `build/`.\
Veja mais sobre [deployment](https://facebook.github.io/create-react-app/docs/deployment).

### `npm run eject`
**Atenção: operação irreversível!**

Remove a abstração do Create React App e expõe todas as configurações.

## 🌐 Integração com API

### Endpoints Utilizados

- `POST /api/auth/login` - Autenticação
- `GET /api/tasks` - Listar tarefas (com filtros e paginação)
- `POST /api/tasks` - Criar tarefa
- `PUT /api/tasks/{id}` - Atualizar tarefa
- `DELETE /api/tasks/{id}` - Excluir tarefa
- `GET /api/tasks/stats` - Estatísticas

### Interceptadores HTTP

- **Request**: Adiciona automaticamente o token JWT
- **Response**: Trata erros 401 (não autorizado)
- **Error**: Redireciona para login em caso de token expirado

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação Completa
- Login com credenciais
- Proteção de rotas
- Gerenciamento de sessão
- Logout seguro

### ✅ CRUD de Tarefas
- Criar, listar, editar e excluir
- Validação de formulários
- Feedback visual de ações

### ✅ Interface Responsiva
- Design adaptável para mobile/desktop
- Componentes Ant Design
- UX otimizada

### ✅ Filtros e Busca
- Filtro por status (Todas/Pendentes/Concluídas)
- Busca textual em título e descrição
- Combinação de filtros

### ✅ Paginação Funcional
- Navegação entre páginas
- Controle de itens por página
- Total de registros correto
- Mantém filtros aplicados

### ✅ Estados de Loading
- Indicadores visuais durante requisições
- Tratamento de erros
- Mensagens de feedback

## 🐛 Solução de Problemas

### Erro de Conexão com API
```bash
# Verifique se o backend está rodando
curl http://localhost:5000/api/tasks

# Verifique a variável de ambiente
echo $REACT_APP_API_URL
```

### Problemas de CORS
Certifique-se de que o backend está configurado para aceitar requisições do frontend (porta 3000).

### Token Expirado
O sistema redireciona automaticamente para login quando o token expira. Faça login novamente.

## 📚 Recursos Adicionais

- [Documentação do React](https://reactjs.org/)
- [Ant Design Components](https://ant.design/components/overview/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Axios Documentation](https://axios-http.com/docs/intro)

## 🤝 Contribuição

1. Siga os padrões de código estabelecidos
2. Use TypeScript para tipagem forte
3. Mantenha componentes pequenos e reutilizáveis
4. Documente mudanças significativas
5. Teste funcionalidades antes do commit

---

*Este frontend faz parte do sistema TaskForU. Consulte o README principal do projeto para informações completas.*
