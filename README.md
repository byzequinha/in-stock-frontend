# InStock - Sistema de Controle de Estoque

InStock é um sistema de controle de estoque funcional, desenvolvido com o objetivo de gerenciar produtos, usuários e níveis de acesso de forma simples e eficiente. Este projeto foi desenvolvido utilizando **React**, **TypeScript**, **Next.js** no frontend, e conta com integração ao backend para autenticação e gerenciamento de dados.

Projeto para avaliação de [Rodolfo Mori](https://www.linkedin.com/in/rodolfomori/) para a formação MBA Code Masters do [DevClub](https://www.linkedin.com/school/dev-club-devs/posts/?feedView=all).

## 🚀 Tecnologias Utilizadas

### Frontend

- **React** com **Next.js**
- **TypeScript**
- **Tailwind CSS** para estilização
- **Axios** para integração com APIs
- **Prettier** e **ESLint** para padronização de código
- **Zustand** para gerenciamento de estado

### Backend

- **Node.js** com **Express**
- **TypeScript**
- **JWT** para autenticação
- **bcrypt** para criptografia de senhas
- Integração via API REST

### Banco de Dados

- **PostgreSQL** em container Docker
- Migrations para versionamento do banco

## 🌟 Funcionalidades Implementadas

### Autenticação e Segurança

- Login por **Matrícula** e **Senha**
- Logout automático após 1 hora de inatividade
- Redirecionamento para tela de login se o token estiver ausente ou inválido
- Criptografia de senhas com bcrypt
- Proteção de rotas baseada em níveis de acesso

### Perfil de Usuário

- Visualização e edição do nome do usuário
- Alteração de senha com validação da senha atual
- Exibição da matrícula do usuário
- Feedback visual durante operações
- Tratamento de erros com mensagens amigáveis

### Gerenciamento de Usuários (Supervisores)

- Criação de novos usuários
- Definição de nível de acesso (Usuário/Supervisor)
- Listagem de usuários cadastrados
- Validações de dados e feedback em tempo real

### Dashboard

- Exibição de **Nome da Empresa**, **CNPJ**, **Nome do Usuário**, e **Nível de Acesso**
- Menus horizontais para navegação
- Menus rápidos no `aside` esquerdo com ícones
- Layout responsivo e organizado

### Outras Funcionalidades

- Organização modular de componentes, páginas e serviços
- Configuração de variáveis de ambiente para facilitar o gerenciamento da API
- Arquitetura pronta para expansão e integração de novas funcionalidades
- Sistema de logs para rastreamento de operações

## 🔧 Instalação e Configuração

### Requisitos

- **Node.js** (v16 ou superior)
- **npm** ou **yarn**
- **Docker** (para rodar o backend ou o banco de dados)

### Instalação do Frontend

1. Clone este repositório:

   ```bash
   git clone https://github.com/byzequinha/in-stock-frontend.git
   cd in-stock-frontend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie um arquivo  `.env`  na raiz do Projeto e cole a variável abaixo:

   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
   ```

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Acesse o projeto no navegador:
   ```
   http://localhost:3000
   ```

## 🗂️ Estrutura de Pastas

```plaintext
src/
├── app/
│   ├── login/       # Página de Login
│   ├── dashboard/   # Página do Dashboard
│   ├── profile/     # Página de Perfil
│   ├── settings/    # Configurações e Gerenciamento de Usuários
│   └── services/    # Serviços para integração com API
├── components/      # Componentes reutilizáveis
├── hooks/          # Hooks personalizados
├── stores/         # Estados globais com Zustand
└── styles/         # Arquivos de estilização (Tailwind CSS)
```

## 📦 Integração com o Backend

### Endpoints Implementados

- **POST /api/auth/login**: Autenticação do usuário
- **GET /api/auth/user**: Dados do usuário autenticado
- **PUT /api/users/:id**: Atualização de dados do usuário
- **PUT /api/users/:id/password**: Alteração de senha
- **POST /api/auth/register**: Criação de novos usuários (Supervisores)

### Configuração do Banco de Dados

- Banco de dados PostgreSQL rodando em Docker:
  ```yaml
  services:
    postgres:
      image: postgres:latest
      ports:
        - '5432:5432'
      environment:
        POSTGRES_USER: user
        POSTGRES_PASSWORD: password
        POSTGRES_DB: instock_db
  ```

## ⚙️ Melhorias Planejadas

- Adicionar uma tabela no Dashboard para exibição de dados
- Implementar funcionalidades de CRUD para produtos
- Adicionar filtros e busca na listagem de usuários
- Implementar testes automatizados
- Adicionar sistema de logs de ações
- Implementar recuperação de senha

## Autor

- [José Francisco Moreira Neto](https://github.com/byzequinha)

![Logo](https://github.com/byzequinha/byzequinha/blob/main/Linkedin%20_qrcode%20Zequinha%20200px.png)

---

## 📝 Licença

Este projeto é open-source e está sob a licença [MIT](LICENSE).
