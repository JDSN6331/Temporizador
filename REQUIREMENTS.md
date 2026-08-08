# 📋 Documento de Requisitos do Sistema - Pulse & Precision

Este documento especifica os **Requisitos Funcionais (RF)**, **Requisitos Não Funcionais (RNF)**, **Requisitos de Infraestrutura/Hardware** e **Requisitos de Software** necessários para a execução, desenvolvimento e implantação da aplicação **Pulse & Precision**.

---

## 1. Requisitos de Infraestrutura & Hardware

### 1.1 Servidor de Produção (Hostinger VPS KVM2)
- **Plano Mínimo Recomendado:** Hostinger VPS KVM2 (ou superior).
- **CPU:** 2 vCPU Cores.
- **Memória RAM:** 8 GB RAM (mínimo 2 GB livres para containers).
- **Armazenamento:** 50 GB NVMe / SSD (com suporte a montagem de volume Docker persistente).
- **Sistema Operacional:** Ubuntu 22.04 LTS / Debian 12 ou Linux de 64-bits compatível com Docker.
- **Rede & Conectividade:** Endereço IP público estático IPv4/IPv6, portas `80` (HTTP) e `443` (HTTPS) liberadas no Firewall/UFW.

### 1.2 Ambiente de Desenvolvimento Local
- **Processador:** Dual-core 2.0 GHz ou superior.
- **Memória RAM:** 4 GB RAM ou superior.
- **Sistema Operacional:** Windows 10/11, macOS 12+ ou Linux.

---

## 2. Requisitos de Software & Dependências

### 2.1 Ambiente de Execução Backend & Build
- **Node.js:** Versão `v18.0.0` ou superior (recomendado Node.js `v20 LTS` ou `v22 LTS`).
- **npm:** Versão `v9.0.0` ou superior.
- **Gerenciador de Container:** Docker Engine `v24.0+` e Docker Compose `v2.20+`.
- **Painel de Gerenciamento:** Easypanel `v1.9+` ou superior.

### 2.2 Dependências Principais (`package.json`)
| Pacote | Versão Mínima | Função |
| :--- | :--- | :--- |
| `react` / `react-dom` | `^19.0.0` | Framework de Interface UI |
| `vite` | `^6.2.0` | Ferramenta de Bundling & Dev Server |
| `express` | `^4.21.0` | Servidor Backend & API REST |
| `pg` | `^8.11.0` | Driver PostgreSQL para Produção (Easypanel) |
| `better-sqlite3` | `^11.0.0` | Driver SQLite para Desenvolvimento Local |
| `bcryptjs` | `^2.4.3` | Criptografia Hash de Senhas |
| `jsonwebtoken` | `^9.0.0` | Autenticação e Gestão de Sessões JWT |
| `tailwindcss` | `^4.1.0` | Framework de Estilização CSS |
| `lucide-react` | `^0.546.0` | Conjunto de Ícones UI |

---

## 3. Requisitos Funcionais (RF)

### 🔑 RF01: Autenticação & Gestão de Usuários
- **RF01.1:** O sistema deve permitir que novos usuários se cadastrem fornecendo Nome Completo, E-mail válido e Senha.
- **RF01.2:** As senhas devem ser obrigatoriamente criptografadas no servidor utilizando `bcryptjs` antes do salvamento no banco de dados.
- **RF01.3:** O sistema deve permitir o login com E-mail e Senha e gerar um token de autenticação JWT com validade configurável (padrão: 30 dias).
- **RF01.4:** O sistema deve permitir a desconexão (*Logout*) limpando as credenciais da sessão.
- **RF01.5:** O sistema deve suportar um modo offline de contingência (*fallback*), mantendo a experiência funcional através do `localStorage`.

### ⏱️ RF02: Temporizador de Intervalos (Timer Engine)
- **RF02.1:** O sistema deve disponibilizar presets padrão de treinos: **HIIT**, **Tabata**, **EMOM**, **AMRAP**, **Recuperação** e **Séries de Força**.
- **RF02.2:** O temporizador deve gerenciar com precisão as fases de: *Preparação*, *Trabalho*, *Descanso curto* e *Descanso entre séries*.
- **RF02.3:** O sistema deve emitir sinais sonoros (apitos de alta e baixa frequência) e efeitos visuais nas transições de fases e na contagem regressiva final (3s, 2s, 1s).
- **RF02.4:** O usuário deve ser capaz de pausar, retomar, reiniciar, pular fases ou cancelar a sessão de treino a qualquer momento.
- **RF02.5:** O temporizador deve sincronizar com o título da aba do navegador para visibilidade durante multitarefas.

### 🛠️ RF03: Treinos Customizados
- **RF03.1:** O usuário deve poder criar novos treinos personalizados ajustando: Nome, Categoria, Tempo de Preparação, Tempo de Trabalho, Tempo de Descanso Curto, Tempo de Descanso da Série, Número de Exercícios e Número de Séries.
- **RF03.2:** Os treinos customizados criados pelo usuário devem ser salvos de forma permanente na tabela `custom_presets` do banco de dados SQLite.
- **RF03.3:** O usuário deve poder visualizar, iniciar e excluir seus treinos customizados salvos.

### 📊 RF04: Histórico & Métricas (Analytics)
- **RF04.1:** Ao concluir um treino, o sistema deve gravar automaticamente os detalhes na tabela `workout_history` no banco de dados.
- **RF04.2:** O sistema deve permitir a inclusão manual de treinos realizados.
- **RF04.3:** O sistema deve exibir gráficos e estatísticas de quantidade de treinos executados, minutos acumulados, dias em sequência (*streaks*) e cumprimento da meta semanal.
- **RF04.4:** O usuário deve ter a opção de remover um item específico do histórico ou limpar todo o seu histórico com confirmação prévia.

### 📱 RF05: Instalabilidade PWA (Progressive Web App)
- **RF05.1:** A aplicação deve disponibilizar o arquivo `manifest.json` válido com suporte a `display: standalone`.
- **RF05.2:** O sistema deve ter um Service Worker (`sw.js`) registrado para cache de recursos estáticos e suporte a acesso offline.
- **RF05.3:** A tela de Configurações e o cabeçalho devem exibir um prompt/botão interativo **"INSTALAR APLICATIVO NO NAVEGADOR"** utilizando o evento `beforeinstallprompt`.

---

## 4. Requisitos Não Funcionais (RNF)

### ⚡ RNF01: Desempenho & Disponibilidade
- **RNF01.1:** O tempo de resposta inicial da aplicação web (First Contentful Paint) deve ser inferior a 1,5 segundos.
- **RNF01.2:** A taxa de quadros (*framerate*) das animações do temporizador e anel de progresso deve ser mantida a 60 FPS.
- **RNF01.3:** O banco de dados SQLite deve utilizar o modo WAL (*Write-Ahead Logging*) para suporte a operações simultâneas de leitura e escrita sem travamentos.

### 🔐 RNF02: Segurança
- **RNF02.1:** Toda a comunicação no ambiente de produção deve ser realizada obrigatoriamente sob protocolo criptografado **HTTPS (TLS/SSL)**.
- **RNF02.2:** Os tokens de sessão JWT devem ser transmitidos via cabeçalho `Authorization: Bearer <token>`.
- **RNF02.3:** Nenhuma senha em texto claro pode ser gravada em logs ou no banco de dados.

### 💾 RNF03: Persistência & Resiliência
- **RNF03.1:** O arquivo do banco de dados SQLite (`/app/data/database.sqlite`) deve ser armazenado em um volume Docker externo/persistente no disco da VPS.
- **RNF03.2:** Em caso de reinicialização da VPS ou redeploy do container no Easypanel, nenhum dado cadastrado poderá ser perdido.

### 🎨 RNF04: Usabilidade & Acessibilidade
- **RNF04.1:** A interface deve ser 100% responsiva (Mobile First), adaptando-se a telas de smartwatches, smartphones, tablets e notebooks.
- **RNF04.2:** O sistema deve atender às diretrizes de contraste de cores para temas escuro e claro.
