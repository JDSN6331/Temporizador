# Guia de Deploy - Pulse & Precision na Hostinger VPS KVM2 com PostgreSQL via Easypanel

Este documento instrui passo a passo como realizar o deploy do **Pulse & Precision** na sua **Hostinger VPS KVM2** gerenciada pelo **Easypanel** utilizando **PostgreSQL** para o banco de dados de produção.

---

## 📋 Requisitos Prévios
1. Instância **Hostinger VPS KVM2** configurada.
2. Painel **Easypanel** instalado na VPS.
3. Repositório Git com este código atualizado.

---

## 🐘 Passo 1: Criar o Banco de Dados PostgreSQL no Easypanel
1. No seu projeto no Easypanel, clique em **"+ Service"**.
2. Selecione a opção **"PostgreSQL"**.
3. Nomeie o serviço como `pulse-postgres`.
4. O Easypanel gerará automaticamente as credenciais e o endereço do banco.

---

## 🚀 Passo 2: Criar e Configurar a Aplicação (App Service)
1. Clique em **"+ Service"** e escolha a opção **"App"** (ou **"GitHub"**).
2. Nomeie o serviço como `pulse-app`.
3. Na aba **Source**:
   - **Repository:** URL do seu repositório Git.
   - **Branch:** `main`.
4. Na aba **Build**:
   - **Build Type:** Selecione `Dockerfile`.

---

## 🔑 Passo 3: Conectar a Aplicação ao Banco PostgreSQL (DATABASE_URL)
Na aba **Environment** da aplicação `pulse-app`:
1. Adicione a variável `DATABASE_URL` apontando para o seu serviço PostgreSQL no Easypanel (ou use a opção de link direto de variáveis do Easypanel):
   - `DATABASE_URL` = `postgres://postgres:SuaSenha@pulse-postgres:5432/postgres`
2. Adicione as variáveis do app:
   - `PORT` = `3000`
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `ChaveSecretaSuperSeguraPulse2026!`

---

## 🌐 Passo 4: Domínio, SSL & Deploy
1. Na aba **Domains**, insira seu domínio (ex: `treino.meusite.com`). O Easypanel emitirá o certificado **SSL HTTPS** automaticamente.
2. Clique no botão **"Deploy"** no canto superior direito.
3. O servidor detectará a variável `DATABASE_URL`, conectará ao **PostgreSQL** e criará as tabelas automaticamente!
