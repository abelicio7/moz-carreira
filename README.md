# Moz Career Pro

Projeto: Moz Carreira – A Maior Plataforma de Criação de Currículos de Moçambique

Quero que você atue como um Engenheiro de Software Sênior, UX/UI Designer, Product Manager e Especialista em SaaS.

Sua missão é criar uma plataforma SaaS completa de criação de currículos profissionais utilizando React, TypeScript, TailwindCSS, Supabase e todas as melhores práticas de arquitetura.

Objetivo

Criar a melhor plataforma de criação de currículos de Moçambique.

O sistema deve transmitir profissionalismo, rapidez e simplicidade.

A experiência deve ser semelhante à do Canva, Resume.io e Kickresume, porém mais moderna e orientada por Inteligência Artificial.

Toda a interface deve ser responsiva.

Utilizar design limpo com bastante espaço em branco, animações suaves, componentes reutilizáveis e excelente experiência do usuário.

Stack

React

TypeScript

TailwindCSS

Supabase

React Router

React Hook Form

Zod

TanStack Query

Lucide Icons

Arquitetura modular.

Código extremamente organizado.

Componentes reutilizáveis.

Separação clara entre UI, lógica e serviços.

Banco de Dados (Supabase)

Criar todas as tabelas automaticamente.

Users

id

nome

email

telefone

país

idioma

plano

created_at

Curriculos

id

user_id

título

modelo

idioma

cor_principal

foto

status

created_at

updated_at

Experiencias

empresa

cargo

descrição

data_inicio

data_fim

Formação

instituição

curso

nível

início

fim

Competências

nome

nível

Idiomas

idioma

nível

Certificados

nome

instituição

data

CartasApresentacao

user_id

conteúdo

Preparar tudo para Row Level Security.

Cada usuário deve visualizar apenas seus dados.

Login

Criar:

Login

Cadastro

Recuperação de senha

Confirmação por email

Usar Supabase Auth.

Dashboard

Após login mostrar:

"Bem-vindo"

Botões rápidos:

Criar Currículo

Meus Currículos

Criar Carta de Apresentação

Criar Carta de Motivação

Modelos

Configurações

Perfil

Plano

Criador de Currículo

Fluxo em etapas.

Etapa 1

Dados pessoais.

Nome

Telefone

Email

Cidade

País

LinkedIn

Resumo profissional

Etapa 2

Experiência profissional.

Adicionar infinitas experiências.

Etapa 3

Formação.

Etapa 4

Competências.

Etapa 5

Idiomas.

Etapa 6

Certificados.

Etapa 7

Projetos.

Etapa 8

Referências.

Editor

Enquanto o usuário preenche os dados, mostrar uma pré-visualização em tempo real do currículo ao lado.

Sem necessidade de recarregar a página.

Modelos

Criar inicialmente 12 modelos profissionais.

Minimalista

Executivo

Moderno

Criativo

Elegante

Tecnologia

Clássico

Estudante

Primeiro Emprego

Todos personalizáveis.

Permitir alterar:

cores

tipografia

espaçamento

tamanho da fonte

ordem das seções

mostrar ou ocultar seções

Inteligência Artificial

Criar integração preparada para API.

Criar camada de serviços para Gemini.

A IA deve:

Melhorar resumo profissional.

Melhorar descrição das experiências.

Corrigir ortografia.

Reescrever textos.

Traduzir currículo.

Criar carta de apresentação.

Criar carta de motivação.

Gerar competências sugeridas.

Sugerir melhorias.

Criar resumo baseado nas experiências.

Analisar uma vaga de emprego colada pelo usuário e adaptar automaticamente o currículo às competências exigidas.

Toda a arquitetura deve permitir trocar o provedor de IA apenas alterando uma variável de configuração.

Exportação

Permitir exportar em:

PDF

DOCX (estrutura preparada para futura implementação)

Impressão

Área Premium

Criar sistema de planos.

Plano Gratuito

Até 1 currículo

2 modelos

Sem IA

Recursos básicos

Plano Premium

Currículos ilimitados

Todos os modelos

IA ilimitada (com limites configuráveis)

Carta de apresentação

Carta de motivação

Tradução

Personalização completa

Criar estrutura para integração futura com M-Pesa, e-Mola.

Configurações

Tema claro e escuro.

Idioma preparado para:

Português (Moçambique)

Português (Portugal)

Inglês.

Painel Administrativo

Criar painel administrativo protegido.

Visualizar:

Usuários

Currículos criados

Novos cadastros

Planos

Receita

Estatísticas

Controle de limites dos planos

Logs

Segurança

Implementar:

Row Level Security

Validação com Zod

Proteção de rotas

Sanitização de entradas

Boas práticas de autenticação

Performance

Lazy Loading

Code Splitting

Memoização quando necessário

Otimização de consultas

Design

Visual moderno semelhante a produtos SaaS internacionais.

Interface premium.

Animações discretas.

Cards elegantes.

Ícones modernos.

Botões consistentes.

Excelente experiência mobile.

Estrutura futura

Planejar a arquitetura para adicionar facilmente:

• Gerador de Portfólio Profissional
• Criador de Perfil para LinkedIn
• Simulador de Entrevistas
• Banco de Vagas
• Análise ATS
• Criador de Biografia Profissional
• Exportação para LinkedIn
• Compartilhamento do currículo por link público
• QR Code para currículo
• Histórico de versões
• Colaboração em equipe

A arquitetura deve nascer preparada para crescer sem necessidade de grandes refatorações.

O resultado esperado é um SaaS profissional, escalável, com código limpo, excelente UX/UI e pronto para se tornar a principal plataforma de criação de currículos em Moçambique e, futuramente, em outros mercados lusófonos.

Enviei nos anexos o logotipo da plataforma

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1df5715c-651a-4ce3-9a6b-c730e833f8ff).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
