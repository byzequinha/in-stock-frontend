# In Stock - B

Um sistema de controle de estoque eficiente, com autenticação baseada em JWT, CRUD completo para gerenciamento de usuários e validações robustas. Desenvolvido com Node.js, Express, TypeScript e testes automatizados.

---

## Sumário
- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Configuração e Instalação](#configuração-e-instalação)
- [Endpoints Disponíveis](#endpoints-disponíveis)
- [Testes Automatizados](#testes-automatizados)
- [Backup e Restauração do Banco de Dados](#backup-e-restauração-do-banco-de-dados)
- [Próximos Passos](#próximos-passos)

---

## Sobre o Projeto

O **In Stock** é uma aplicação backend para controle de estoque, com foco em flexibilidade, segurança e usabilidade. Atualmente, oferece CRUD completo para gerenciar usuários e produtos, autenticação segura com JWT, validações robustas usando Joi e suporte para controle hierárquico (Supervisor, Usuário, etc.).

---

## Tecnologias Utilizadas
- **Node.js**: Ambiente de execução JavaScript
- **Express**: Framework web para criar APIs RESTful
- **TypeScript**: Tipagem estática para JavaScript
- **PostgreSQL**: Banco de dados relacional
- **JWT (JSON Web Tokens)**: Autenticação segura
- **Docker & Docker Compose**: Contêinerização para deploy e desenvolvimento
- **Joi**: Validações de entrada de dados
- **Jest**: Framework de testes automatizados
- **Swagger**: Documentação e testes de endpoints da API
- **Bcrypt**: Criptografia de senhas
- **CORS**: Middleware para configuração de CORS

---

## Configuração e Instalação

### 🔧 Instalação e Configuração

Antes de iniciar o frontend, é necessário configurar e rodar o backend do projeto. Siga os passos do repositório do backend para configurá-lo corretamente:

🔗 **Backend**: [https://github.com/byzequinha/in-stock-backend](https://github.com/byzequinha/in-stock-backend)

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
