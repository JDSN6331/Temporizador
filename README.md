# ⚡ Pulse & Precision - Temporizador de Alta Performance & Analytics (PWA)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite_3-003b57.svg?logo=sqlite)](https://www.sqlite.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg?logo=docker)](https://www.docker.com/)
[![PWA](https://img.shields.io/badge/PWA-Installable-d2f000.svg)](https://web.dev/progressive-web-apps/)

**Pulse & Precision** é uma aplicação web de alta performance desenvolvida para atletas, praticantes de atividade física e personal trainers. O sistema combina um temporizador de intervalos (HIIT, Tabata, EMOM, AMRAP, Séries de Força e Treinos Customizados) com estatísticas detalhadas, histórico persistente, sincronização com banco de dados SQLite e suporte completo a PWA (instalável em dispositivos móveis e desktop).

---

## ✨ Principais Funcionalidades

- ⏱️ **Temporizador de Intervalos Avançado:**
  - Presets prontos para **HIIT**, **Tabata**, **EMOM**, **AMRAP**, **Recuperação/Descanso** e **Treinos de Força**.
  - Contagem regressiva em alta precisão sincronizada com áudio de apitos/beeps através da Web Audio API.
  - Alertas visuais e sonoros para fases de Preparação, Trabalho, Descanso entre Exercícios e Descanso entre Séries.
  - Suporte a execução em segundo plano com sincronização de tempo real.

- 🛠️ **Criador de Treinos Customizados:**
  - Crie e salve treinos personalizados ajustando tempo de trabalho, descanso curto, descanso longo, número de exercícios e séries.

- 🔐 **Sistema de Autenticação & Banco de Dados Persistente:**
  - Cadastro de usuários com criptografia de senha via `bcryptjs`.
  - Autenticação e controle de sessão via tokens `JWT`.
  - Banco de dados **SQLite** embarcado com modo WAL (*Write-Ahead Logging*) para velocidade e persistência de dados.
  - Sincronização offline-first com fallback automático no `localStorage` do navegador.

- 📊 **Métricas & Histórico de Treinos (Analytics):**
  - Registro de treinos concluídos com data, duração, calorias estimadas e categorias.
  - Gráficos e indicadores de frequência semanal, sequência de dias (*streaks*) e evolução.

- 📱 **Instalável no Navegador (Progressive Web App - PWA):**
  - Instalação direta no celular (Android/iOS) ou PC via Chrome, Safari e Edge.
  - Funcionamento offline via Service Worker (`sw.js`).
  - Suporte ao prompt de instalação nativo e botão integrado nas configurações.

- 🎨 **Interface Moderna & Temas Customizáveis:**
  - Design baseado em Glassmorphism responsivo.
  - 4 temas de cores vibrantes (*Electric Lime*, *Cyber Cyan*, *Energetic Orange*, *Volcanic Red*).
  - Suporte a modo claro (*Light Theme*) e modo escuro (*Dark Theme*).

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 6](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Ícones:** Lucide React + Flaticon Uicons + Material Symbols
- **Áudio:** Web Audio API nativa (`sound.ts`)

### Backend & Banco de Dados
- **Servidor:** [Node.js](https://nodejs.org/) + [Express 4](https://expressjs.com/)
- **Banco de Dados:** [SQLite](https://www.sqlite.org/) via `better-sqlite3`
- **Segurança:** `bcryptjs` (hash de senhas) + `jsonwebtoken` (JWT)

### Infraestrutura & Deploy
- **Containerização:** [Docker](https://www.docker.com/) (Build Multi-Stage)
- **Gerenciador de Container:** [Easypanel](https://easypanel.io/) / Docker Compose
- **Hospedagem Recomendada:** Hostinger VPS (KVM2 ou superior)

---

## 📂 Estrutura do Projeto

```
Temporizador-main/
├── public/
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   ├── manifest.json            # Manifesto de aplicativo PWA
│   └── sw.js                    # Service Worker (Cache offline)
├── src/
│   ├── components/
│   │   ├── AnalyticsScreen.tsx  # Tela de métricas e estatísticas
│   │   ├── AuthModal.tsx        # Modal de Login / Cadastro real
│   │   ├── BottomNav.tsx        # Navegação inferior
│   │   ├── CustomWorkoutModal.tsx # Criador de treinos customizados
│   │   ├── Drawers.tsx          # Menus laterais e perfil do usuário
│   │   ├── Header.tsx           # Cabeçalho da aplicação
│   │   ├── HistoryScreen.tsx    # Histórico de treinos executados
│   │   ├── HomeScreen.tsx       # Tela inicial com treinos e presets
│   │   ├── SettingsScreen.tsx   # Configurações do app e botão PWA
│   │   └── WorkoutTimerScreen.tsx # Tela do temporizador ativo
│   ├── services/
│   │   └── api.ts               # Cliente HTTP e sincronização com a API backend
│   ├── utils/
│   │   └── sound.ts             # Efeitos de som via Web Audio API
│   ├── App.tsx                  # Componente raiz e controle de estado
│   ├── index.css                # Sistema de design e estilos globais
│   ├── main.tsx                 # Ponto de entrada React + registro PWA
│   └── types.ts                 # Interfaces TypeScript
├── data/                        # Diretório do banco de dados SQLite (volume persistente)
├── server.js                    # Servidor Express API + SQLite
├── Dockerfile                   # Dockerfile Multi-Stage para produção
├── docker-compose.yml           # Arquivo Docker Compose
├── EASYPANEL_DEPLOY.md          # Guia passo a passo de deploy no Easypanel
├── REQUIREMENTS.md              # Requisitos técnicos e do sistema
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** v18+ instalado
- **npm** v9+ instalado

### 1. Clonar o Repositório e Instalar Dependências
```bash
git clone <url-do-repositorio>
cd Temporizador-main
npm install
```

### 2. Executar o Servidor em Modo de Desenvolvimento
```bash
# Iniciar o servidor backend Express + SQLite e frontend estático
node server.js
```
Acesse a aplicação no navegador em: `http://localhost:3000`

Para rodar apenas o servidor de dev do Vite:
```bash
npm run dev
```

### 3. Testar a Compilação de Produção
```bash
npm run build
```

---

## 🐳 Deploy no Easypanel (Hostinger VPS KVM2)

Para instruções detalhadas passo a passo de implantação na VPS Hostinger via Easypanel, consulte o documento **[EASYPANEL_DEPLOY.md](file:///c:/Users/josed/Downloads/Temporizador-main/Temporizador-main/EASYPANEL_DEPLOY.md)**.

### Resumo dos passos:
1. Suba o código para um repositório Git (GitHub / GitLab).
2. No **Easypanel**, crie um novo projeto e adicione um serviço **App**.
3. Defina o **Build Type** como `Dockerfile`.
4. Configure o volume de dados persistente: **Mount Path:** `/app/data`.
5. Clique em **Deploy**. O certificado HTTPS será gerado automaticamente.

---

## 📄 Licença

Este projeto está licenciado sob a Licença **Apache 2.0** - consulte o arquivo [LICENSE](LICENSE) para obter mais detalhes.
