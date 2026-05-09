<!-- markdownlint-disable-file MD013 -->
<p align="center">
  <img src="public/flowstate-mark-mono.svg" alt="FlowState Logo" width="80" />
</p>

<h1 align="center">FlowState</h1>

<p align="center">
  <strong>Rastreador de produtividade desktop para desenvolvedores que levam seu ofício a sério.</strong>
</p>

<p align="center">
  Acompanhe sessões focadas de trabalho e estudo, defina metas semanais, revise seu progresso — tudo offline, tudo seu.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-v2-blue?logo=tauri" alt="Tauri v2" />
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/Rust-2021-orange?logo=rust" alt="Rust" />
  <img src="https://img.shields.io/badge/SQLite-local--first-003B57?logo=sqlite" alt="SQLite" />
</p>

---

## Sobre

FlowState é uma **aplicação desktop local-first** construída para
desenvolvedores e estudantes que querem entender e melhorar como gastam seu
tempo de trabalho profundo. Ele separa sessões de **TRABALHO** (baseadas em
projetos) de sessões de **ESTUDO** (baseadas em tags), oferecendo insights
claros sobre ambas as dimensões do seu crescimento.

Sem nuvem. Sem contas. Sem telemetria. Seus dados vivem em um único arquivo
SQLite na sua máquina.

---

## Funcionalidades

### Temporizador de Sessão

- **Modo progressivo** — contagem crescente, encerre quando quiser
- **Modo regressivo** — contagem regressiva estilo Pomodoro com duração
  planejada
- Associação de projeto e tags por sessão
- Revisão pós-sessão com **avaliação de 1–5 estrelas** e anotações
- Registro manual de sessão para rastreamento retroativo

### Dashboard e Análises

- **Horas de trabalho e estudo** com indicadores de tendência período a período
- **Heatmap de contribuição** — visualização de atividade estilo GitHub (6
  meses)
- **Gráficos de distribuição** — veja para onde vão suas horas entre projetos e
  tags
- **Rankings mais bem avaliados** — seus projetos e tópicos de estudo com
  melhores notas
- **Rastreamento de streak** — streak atual e recorde pessoal

### Metas Semanais

- Defina metas de horas por projeto (TRABALHO) ou tag (ESTUDO)
- Barras de progresso em tempo real com horas computadas automaticamente das
  sessões
- Histórico de desempenho de metas de semanas anteriores
- Estatísticas resumidas: metas criadas, metas atingidas, média de horas/semana

### Logbook

- **Calendário interativo** com heatmap de intensidade
- Explore qualquer dia para revisar todas as sessões com detalhes completos
- Navegação mensal com atalho rápido para "hoje"

### Projetos e Tags

- **Projetos** com cores para rastreamento de trabalho
- **Tags** com cores para categorização de tópicos de estudo
- Visualizações de sessões filtradas por projeto ou tag
- CRUD completo com edição inline

### Configurações

- Tema: claro / escuro / sistema
- Idioma: inglês, português, espanhol
- Formato de hora: 12h / 24h
- Formato de data: US / BR
- Modo estrito (foco em tela cheia)
- **Cofre de Dados**: exportar, importar e limpar todos os dados

---

## Stack Tecnológica

| Camada              | Tecnologia                                                                |
| ------------------- | ------------------------------------------------------------------------- |
| **Runtime Desktop** | [Tauri v2](https://v2.tauri.app)                                          |
| **Backend**         | Rust + [rusqlite](https://github.com/rusqlite/rusqlite) (SQLite embutido) |
| **Frontend**        | [Next.js 16](https://nextjs.org) (Static Export) + React 19               |
| **Estilização**     | [Tailwind CSS 4](https://tailwindcss.com)                                 |
| **Animações**       | [Motion](https://motion.dev) (Framer Motion)                              |
| **Ícones**          | [Lucide React](https://lucide.dev)                                        |
| **Linguagem**       | TypeScript 5 + Rust 2021 Edition                                          |

---

## Arquitetura

```text
┌─────────────────────────────────────────────────┐
│                  Janela Tauri                    │
│  ┌───────────────────────────────────────────┐  │
│  │           Frontend Next.js SSG            │  │
│  │  Componentes → Hooks → Serviços           │  │
│  └──────────────────┬────────────────────────┘  │
│                     │ invoke()                   │
│  ┌──────────────────▼────────────────────────┐  │
│  │            Backend Rust                   │  │
│  │  Comandos → Banco (Mutex<Connection>)     │  │
│  └──────────────────┬────────────────────────┘  │
│                     │                            │
│              ┌──────▼──────┐                     │
│              │   SQLite    │                     │
│              │ (modo WAL)  │                     │
│              └─────────────┘                     │
└─────────────────────────────────────────────────┘
```

**Camada de serviço dual-mode**: toda função de serviço tenta o backend Tauri
IPC primeiro. Se estiver rodando em um navegador (modo dev), faz fallback para
dados mock em memória automaticamente — sem necessidade de alterar código.

---

## Schema do Banco de Dados

```text
projects ──────< sessions >────── session_tags >────── tags
                                       │
weekly_goals                      settings (chave-valor)
```

5 tabelas principais + 1 tabela de configurações, todas gerenciadas via
migrations do rusqlite na primeira inicialização.

Documentação completa do schema: [`DATABASE.md`](DATABASE.md)

---

## Começando

### Pré-requisitos

**Dependências do sistema (Debian/Ubuntu/Pop!\_OS):**

```bash
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file \
  libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

**Toolchain:**

- [Node.js](https://nodejs.org) 18+
- [Rust](https://rustup.rs) (stable)
- npm ou yarn

### Instalação

```bash
git clone https://github.com/jhoanoliveira/FlowState.git
cd FlowState
npm install
```

### Desenvolvimento

```bash
# App desktop com hot-reload (Tauri + servidor dev do Next.js)
npm run tauri dev

# Apenas frontend (navegador com dados mock, sem necessidade do Tauri)
npm run dev
```

### Build de Produção

```bash
npm run tauri build
```

O instalador será gerado em:

```text
src-tauri/target/release/bundle/
├── deb/        → pacote .deb (dpkg -i)
└── appimage/   → executável portátil .AppImage
```

---

## Estrutura do Projeto

```text
FlowState/
├── app/                    # Páginas do Next.js App Router
│   ├── page.tsx            #   Dashboard
│   ├── session/            #   Temporizador e registro manual
│   ├── goals/              #   Metas semanais e streaks
│   ├── logbook/            #   Calendário e diário de sessões
│   ├── projects/           #   Gerenciamento de projetos e tags
│   └── settings/           #   Preferências e cofre de dados
├── components/             # Componentes React (por funcionalidade)
│   ├── layout/             #   AppLayout, Sidebar, TopNav
│   ├── ui/                 #   Button, Card, Input, Badge...
│   ├── dashboard/          #   Heatmap, Gráficos, Rankings
│   ├── activity/           #   Temporizador, Formulários de sessão
│   ├── goals/              #   Metas, Streaks, Consistência
│   ├── logbook/            #   Calendário, Revisões de sessão
│   └── projects/           #   Gerenciador de listas, Views filtradas
├── hooks/                  # Hooks React customizados
├── services/               # Camada de API (Tauri IPC + fallback mock)
├── providers/              # Providers de Contexto do React
├── mocks/                  # Dados mock para desenvolvimento
├── types/                  # Definições de tipos TypeScript
├── lib/                    # Funções utilitárias
├── public/                 # Assets estáticos
├── src-tauri/              # Backend em Rust
│   ├── src/
│   │   ├── lib.rs          #   Setup do app e registro de comandos
│   │   ├── models/         #   Structs Serde (camelCase)
│   │   ├── commands/       #   Handlers de comandos Tauri
│   │   └── database/       #   Conexão e migrations
│   ├── Cargo.toml
│   └── tauri.conf.json
└── DATABASE.md             # Documentação completa do banco de dados
```

---

## Regras do Backend

O backend em Rust segue diretrizes arquiteturais rígidas:

1. **Modular** — sem lógica de negócio em `main.rs` ou `lib.rs`
2. **Zero panics** — todos os comandos retornam `Result<T, String>`
3. **Contratos Serde** — `#[serde(rename_all = "camelCase")]` em todas as
   structs
4. **SQL parametrizado** — `?1, ?2, ...` (nunca interpolação de strings)
5. **Estado thread-safe** — `Mutex<Connection>` envolvido em `tauri::State`
6. **Offloading async** — operações pesadas usam async para não bloquear a UI

---

## Comandos IPC

| Domínio           | Comandos                                                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Projetos**      | `get_projects`, `create_project`, `update_project`, `delete_project`                                                                                                          |
| **Tags**          | `get_tags`, `create_tag`, `update_tag`, `delete_tag`                                                                                                                          |
| **Sessões**       | `save_session`, `save_session_review`, `get_session`, `save_manual_session`, `get_today_stats`                                                                                |
| **Metas**         | `get_weekly_goals`, `create_weekly_goal`, `update_weekly_goal`, `delete_weekly_goal`, `get_goal_progress`, `get_goals_summary`, `get_goals_history`                           |
| **Dashboard**     | `get_dashboard_stats`, `get_recent_activities`, `get_activities_by_date`, `get_activities_by_project`, `get_activities_by_tag`                                                |
| **Análises**      | `get_heatmap`, `get_work_distribution`, `get_study_distribution`, `get_top_rated_work`, `get_top_rated_study`, `get_streak_info`, `get_consistency_days`, `get_calendar_days` |
| **Configurações** | `get_settings`, `update_settings`, `export_data_vault`, `import_data_vault`, `wipe_all_data`                                                                                  |

---

## Licença

Este projeto é para uso pessoal e fins de portfólio.

---

<p align="center">
  Construído com foco por <a href="https://github.com/jhoanoliveira">@jhoanoliveira</a>
</p>
