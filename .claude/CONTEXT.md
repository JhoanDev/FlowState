# FlowState — Contexto do Produto

## Visão Geral

App desktop nativo e local-first para rastreamento de tempo, gestão de produtividade e análise de dados para desenvolvedores. Diferencia horas de estudo e trabalho, com relatórios, metas semanais e histórico completo. Sem cloud.

## Stack

| Camada       | Tecnologia                                          |
|--------------|-----------------------------------------------------|
| UI           | Next.js (`output: 'export'`, SSG) + React           |
| Estilização  | Tailwind CSS (desktop-first, flat design)            |
| Runtime      | Tauri v2 (Rust)                                      |
| Banco        | SQLite via rusqlite (local, empacotado no binário)   |

## Funcionalidades Core

- **Sessões:** WORK e STUDY com tags, projetos e timer híbrido (progressivo/regressivo)
- **Mini-Player PiP:** Janela flutuante always-on-top
- **Metas Semanais:** Horas-alvo por categoria/projeto com progresso em tempo real
- **Logbook:** Drill-down por tag, feed cronológico, calendário interativo
- **Dashboard:** Heatmap, gráficos de distribuição, streaks, top rated
- **Backup:** Import/export do `.db` (offline-first)
- **Settings:** Formato de data (US/BR), relógio (12h/24h), idioma, strict mode

## Schema do Banco

```
projects ──< sessions >── session_tags >── tags
                              weekly_goals (standalone)
```

### Tabelas

| Tabela         | PK   | Campos principais                                                      |
|----------------|------|------------------------------------------------------------------------|
| `projects`     | `id` | name (UNIQUE), color, archived (0/1), created_at                       |
| `tags`         | `id` | name (UNIQUE), color, created_at                                       |
| `sessions`     | `id` | type (WORK/STUDY), project_id FK, timer_mode, status, duration_seconds, started_at, finished_at, rating (1-5), notes |
| `session_tags` | PK composta | session_id FK, tag_id FK                                        |
| `weekly_goals` | `id` | type, label, target_hours, project_id, tag_id, week_start             |

### Campos Computados (nunca armazenados)

`currentHours`, `heatmap.intensity`, `streaks`, `distribution` — derivados via queries em runtime.

### Status Lifecycle

```
ACTIVE → PAUSED → ACTIVE → COMPLETED
ACTIVE → CANCELLED
```

## Mapeamento IPC (Frontend → Backend)

Cada função em `services/*.ts` mapeia para um `#[tauri::command]` via `invoke()`.
O service layer abstrai isso — a UI nunca chama `invoke()` diretamente.

## Versionamento

A versão do app é mantida em **3 arquivos** que devem estar sincronizados:

| Arquivo                    | Campo       |
|----------------------------|-------------|
| `package.json`             | `version`   |
| `src-tauri/Cargo.toml`     | `version`   |
| `src-tauri/tauri.conf.json`| `version`   |
