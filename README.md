
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

### Backend
- Backend conectado para autenticação de usuários e gerenciamento de dados
- Integração via API REST

### Banco de Dados
- Banco de dados gerenciado com PostgreSQL em container Docker

## 🌟 Funcionalidades Implementadas

### Autenticação
- Login por **Matrícula** e **Senha**
- Logout automático após 15 minutos de inatividade
- Redirecionamento para tela de login se o token de autenticação estiver ausente ou inválido

### Dashboard
- Exibição de **Logo da Empresa**, **Nome do Usuário**, e **Nível de Acesso**
- Menus horizontais para navegação
- Menus rápidos no `aside` esquerdo com ícones para funcionalidades principais
- Layout responsivo e organizado

### Outras Funcionalidades
- Organização modular de componentes, páginas e serviços
- Configuração de variáveis de ambiente para facilitar o gerenciamento da API
- Arquitetura pronta para expansão e integração de novas funcionalidades

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

3. Configure as variáveis de ambiente no arquivo `.env.local`:
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
│   └── services/    # Serviços para integração com API
├── components/      # Componentes reutilizáveis
├── hooks/           # Hooks personalizados
└── styles/          # Arquivos de estilização (Tailwind CSS)
```

## 📦 Integração com o Backend

### Endpoints Implementados
- **POST /login**: Realiza a autenticação do usuário com matrícula e senha.

### Configuração do Banco de Dados
- Banco de dados PostgreSQL rodando em Docker:
  ```yaml
  services:
    postgres:
      image: postgres:latest
      ports:
        - "5432:5432"
      environment:
        POSTGRES_USER: user
        POSTGRES_PASSWORD: password
        POSTGRES_DB: instock_db
  ```

## ⚙️ Melhorias Planejadas
- Adicionar uma tabela no Dashboard para exibição de dados
- Implementar funcionalidades de CRUD para produtos e usuários
- Testes automatizados no frontend e backend

## 📝 Licença

Este projeto é open-source e está sob a licença [MIT](LICENSE).


## Autor

- [José Francisco Moreira Neto](https://github.com/byzequinha)

![Logo](https://github.com/byzequinha/byzequinha/blob/main/Linkedin%20_qrcode%20Zequinha%20200px.png)

---

## Licença

Todos os Direitos Reservados

[MIT](https://choosealicense.com/licenses/mit/)