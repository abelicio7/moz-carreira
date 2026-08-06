# Guia de Migração do Supabase (Lovable -> Supabase Próprio)

Este documento descreve detalhadamente os passos para transferir e configurar a base de dados do projeto de testes/desenvolvimento da Lovable para a sua própria conta do Supabase.

---

## 📋 Pré-requisitos

1. **Conta no Supabase:** Crie uma conta e um novo projeto em [supabase.com](https://supabase.com).
2. **Supabase CLI:** Tenha o utilitário de linha de comando do Supabase instalado.
   - *Se não o tiver instalado, pode instalar usando npm/npx:*
     ```bash
     npm install -g supabase
     ```
3. **Credenciais do Novo Projeto:**
   - **Project Ref (ID do Projeto):** Encontra-se no URL do seu dashboard (ex: `https://supabase.com/dashboard/project/seu-project-ref`).
   - **Anon Key & Service Role Key:** Em **Project Settings > API**.
   - **Database Password:** A palavra-passe que definiu ao criar o projeto Supabase.

---

## 🚀 Passo a Passo da Migração

### Passo 1: Autenticar no Supabase CLI
Abra o terminal no diretório raiz do projeto e inicie a sessão no CLI do Supabase:
```bash
supabase login
```
*Siga as instruções no ecrã para autorizar o acesso à sua conta Supabase no navegador.*

### Passo 2: Associar o Projeto Local ao Novo Supabase
Associe a sua pasta local com o novo projeto Supabase remoto:
```bash
supabase link --project-ref <seu-project-ref>
```
*Durante este passo, ser-lhe-á solicitada a **Database Password** definida na criação do seu projeto.*

### Passo 3: Aplicar as Migrações da Base de Dados
O projeto já contém os scripts SQL necessários com toda a estrutura em `supabase/migrations/`. Para os enviar e aplicar no seu novo banco de dados, execute:
```bash
supabase db push
```
Este comando criará automaticamente:
- Todas as tabelas necessárias (`profiles`, `user_roles`, `curriculos`, `experiencias`, `formacoes`, `competencias`, `idiomas`, `certificados`, `projetos`, `referencias`, `cartas`).
- As políticas de segurança (RLS - Row Level Security).
- Funções internas, índices e o trigger de automação de registo de utilizadores (`on_auth_user_created`).

---

## 🔑 Configuração do Google OAuth (Login Social)

Com a migração para a sua própria instância, a autenticação com Google deixa de passar pelo servidor do Lovable e passa a ser feita diretamente pela sua conta.

### Passo 4.1: Obter credenciais da Google Cloud Console
1. Aceda ao [Google Cloud Console](https://console.cloud.google.com/).
2. Crie ou selecione um projeto e configure o **OAuth consent screen** (Ecrã de consentimento OAuth) como *External*.
3. Vá a **Credentials > Create Credentials > OAuth client ID**.
4. Defina o tipo de aplicação como **Web application**.
5. No campo **Authorized redirect URIs** (URLs de redirecionamento autorizados), adicione o callback do seu novo projeto Supabase:
   ```text
   https://<seu-project-ref>.supabase.co/auth/v1/callback
   ```
6. Guarde e copie o **Client ID** e o **Client Secret** gerados.

### Passo 4.2: Configurar no Painel do Supabase
1. Aceda ao painel do seu projeto em [Supabase](https://supabase.com/dashboard).
2. Vá a **Authentication > Providers > Google**.
3. Ative o fornecedor (*Enable Google Enabled*).
4. Insira o **Client ID** e o **Client Secret** obtidos no Google Cloud Console.
5. Guarde as alterações.

---

## 💻 Configuração Local e Deploy do Frontend

### Passo 5: Atualizar as Variáveis de Ambiente locais
1. Copie o ficheiro `.env.example` para criar o seu ficheiro `.env`:
   ```bash
   cp .env.example .env
   ```
2. Abra o `.env` e preencha as variáveis com as chaves e URL do seu novo projeto:
   ```env
   SUPABASE_PROJECT_ID="<seu-project-ref>"
   SUPABASE_PUBLISHABLE_KEY="<sua-anon-key>"
   SUPABASE_URL="https://<seu-project-ref>.supabase.co"
   
   VITE_SUPABASE_PROJECT_ID="<seu-project-ref>"
   VITE_SUPABASE_PUBLISHABLE_KEY="<sua-anon-key>"
   VITE_SUPABASE_URL="https://<seu-project-ref>.supabase.co"
   ```

### Passo 6: Deploy em Produção (Vercel, Netlify, etc.)
Ao realizar o deploy da aplicação em plataformas de alojamento, certifique-se de configurar as mesmas variáveis de ambiente acima nas definições de ambiente da plataforma de alojamento.
