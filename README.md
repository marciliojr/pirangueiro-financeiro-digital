# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/9b77365c-c979-4951-9a61-19e83fa0efd4

## Sistema de Autenticação

Este projeto agora inclui um sistema completo de autenticação com as seguintes funcionalidades:

### 🔐 Login e Controle de Acesso
- **Tela de Login**: Interface completa para autenticação de usuários
- **Credenciais Padrão**:
  - Usuário: `adm`
  - Senha: `123`
- **Proteção de Rotas**: Todas as páginas do sistema são protegidas e requerem autenticação
- **Persistência Local**: Os dados do usuário são salvos no `localStorage` do navegador

### 👤 Gerenciamento de Usuário
- **Botão de Usuário**: Localizado no cabeçalho, ao lado do botão de notificações
- **Indicador Visual**: Ponto verde quando o usuário está autenticado
- **Modal de Gestão**: Permite fazer login, logout e atualizar credenciais
- **Validação**: Verificação de campos obrigatórios e confirmação de senha

### 🔧 Funcionalidades Técnicas
- **Context API**: Gerenciamento de estado global de autenticação
- **localStorage**: Persistência automática dos dados do usuário
- **Interface Responsiva**: Design adaptável para diferentes tamanhos de tela
- **Feedback Visual**: Toasts informativos para todas as ações

### 📱 Como Usar
1. **Primeiro Acesso**: Use as credenciais padrão (adm/123)
2. **Login**: Digite usuário e senha na tela inicial
3. **Gerenciar Conta**: Clique no ícone de usuário no cabeçalho
4. **Atualizar Dados**: Use a aba "Atualizar Usuário" no modal
5. **Logout**: Disponível no modal quando autenticado

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9b77365c-c979-4951-9a61-19e83fa0efd4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/9b77365c-c979-4951-9a61-19e83fa0efd4) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
