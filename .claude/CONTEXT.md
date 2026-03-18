### Documento de Especificação Atualizado

Abaixo está a especificação do seu produto refatorada. Substituí a antiga seção de UI pelas suas **Novas Regras de Frontend** e adicionei a seção de **Integração e Dados (Tauri)** para refletir a arquitetura focada em mocks e isolamento.

#### 1. Visão Geral do Produto
Um aplicativo desktop nativo e local-first focado no rastreamento de tempo, gestão de produtividade e análise de dados para desenvolvedores. O sistema diferencia horas de estudo e horas de trabalho, fornecendo relatórios detalhados, metas semanais e um histórico completo de atividades sem depender de servidores em nuvem.

#### 2. Stack Tecnológica
* **Interface (UI/UX):** Next.js (configurado com `output: 'export'` para SSG) e React.
* **Estilização:** Tailwind CSS (componentes otimizados para desktop, sem seleção de texto indesejada).
* **Motor Nativo:** Tauri v2 (Rust) para integração com o sistema operacional (foco em Pop!_OS/Linux).
* **Banco de Dados:** SQLite (via `tauri-plugin-sql`), operando 100% localmente.

#### 3. Requisitos Funcionais

**3.1. Gestão de Atividades (Core)**
* **Tipos de Sessão:** O sistema deve suportar no mínimo duas categorias raízes: ESTUDO e TRABALHO.
* **Categorização por Tags:** Capacidade de taguear sessões por linguagem, tecnologia ou atividade.
* **Rastreamento de Projetos:** Capacidade de vincular o tempo de trabalho a projetos específicos.

**3.2. Módulo de Cronômetro e Foco**
* **Timer Híbrido e Maratona:** Suporte a tempo progressivo, regressivo (Pomodoro) e perfil rigoroso para simular tempo limitado.
* **Mini-Player (PiP):** Janela flutuante minimalista (Always on Top).
* **Imunidade a Suspensão:** Lógica baseada na diferença de timestamps para prevenir atrasos de suspensão do SO.
* **Possibilidade de cadastrar sessoẽs anteriores**: 

**3.3. Metas e Histórico (Logbook)**
* **Metas Semanais:** Horas-alvo por categoria/projeto com barras de progresso visuais em tempo real.
* **Diário Isolado e Linha do Tempo:** Drill-down por tag e feed cronológico de anotações por sessão.
* **Calendário Interativo:** Visão mensal para bloqueio visual e revisão.

**3.4. Relatórios e Dashboards**
* **Heatmap e Gráficos:** Gráfico de contribuições diárias, gráficos de pizza (foco vs estudo) e distribuição de esforço.
* **Métricas de Consistência:** Sistema de Streaks.

**3.5. Controle de Dados e Segurança**
* **Offline-First & Backup:** App 100% offline com importação/exportação física do arquivo `.db` do SQLite.

# FlowState — Estrutura do Banco de Dados

SQLite local via `tauri-plugin-sql`. Sem servidor, sem cloud. Tudo roda no disco do usuário.

---

## Diagrama de Relações

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│   projects   │       │     sessions     │       │     tags     │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id       PK  │◄──────│ project_id    FK │       │ id       PK  │
│ name         │       │ id            PK │       │ name         │
│ color        │       │ type             │       │ color        │
│ archived     │       │ timer_mode       │       │ created_at   │
│ created_at   │       │ status           │       └──────┬───────┘
└──────────────┘       │ planned_dur_sec  │              │
                       │ duration_seconds │       ┌──────┴───────┐
                       │ started_at       │       │ session_tags │
                       │ finished_at      │       ├──────────────┤
                       │ rating           │       │ session_id FK│──┐
                       │ notes            │       │ tag_id     FK│  │
                       │ created_at       │       └──────────────┘  │
                       └────────┬─────────┘                         │
                                │                                   │
                                └───────────────────────────────────┘

┌──────────────────┐
│   weekly_goals   │
├──────────────────┤
│ id            PK │
│ type             │
│ label            │
│ target_hours     │
│ week_start       │
│ created_at       │
└──────────────────┘
```

---

## Schema SQL Completo

### `projects`

Repositórios ou iniciativas de trabalho do usuário.

```sql
CREATE TABLE projects (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    color       TEXT    NOT NULL DEFAULT '#8b5cf6',  -- hex para identificação visual
    archived    INTEGER NOT NULL DEFAULT 0,          -- 0 = ativo, 1 = arquivado
    created_at  DATETIME NOT NULL DEFAULT (datetime('now'))
);
```

| Coluna     | Tipo     | Descrição                                    |
|------------|----------|----------------------------------------------|
| id         | INTEGER  | PK auto-increment                            |
| name       | TEXT     | Nome único do projeto                        |
| color      | TEXT     | Cor hex para UI (badges, gráficos)           |
| archived   | INTEGER  | Soft delete — projetos arquivados não aparecem |
| created_at | DATETIME | Timestamp de criação                         |

---

### `tags`

Tecnologias, linguagens ou tópicos de estudo.

```sql
CREATE TABLE tags (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL UNIQUE,
    color       TEXT    NOT NULL DEFAULT '#a78bfa',
    created_at  DATETIME NOT NULL DEFAULT (datetime('now'))
);
```

| Coluna     | Tipo     | Descrição                          |
|------------|----------|------------------------------------|
| id         | INTEGER  | PK auto-increment                  |
| name       | TEXT     | Nome único da tag                  |
| color      | TEXT     | Cor hex para UI                    |
| created_at | DATETIME | Timestamp de criação               |

---

### `sessions`

Tabela central. Cada registro é uma sessão de trabalho ou estudo completa.

```sql
CREATE TABLE sessions (
    id                      INTEGER PRIMARY KEY AUTOINCREMENT,
    type                    TEXT    NOT NULL CHECK (type IN ('WORK', 'STUDY')),
    project_id              INTEGER REFERENCES projects(id) ON DELETE SET NULL,
    timer_mode              TEXT    NOT NULL CHECK (timer_mode IN ('PROGRESSIVE', 'REGRESSIVE')),
    status                  TEXT    NOT NULL DEFAULT 'ACTIVE'
                                   CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')),
    planned_duration_seconds INTEGER,          -- usado apenas no modo REGRESSIVE
    duration_seconds        INTEGER NOT NULL DEFAULT 0,
    started_at              DATETIME NOT NULL,
    finished_at             DATETIME,
    rating                  INTEGER CHECK (rating BETWEEN 1 AND 5),
    notes                   TEXT    NOT NULL DEFAULT '',
    created_at              DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_sessions_type       ON sessions(type);
CREATE INDEX idx_sessions_project    ON sessions(project_id);
CREATE INDEX idx_sessions_started_at ON sessions(started_at);
CREATE INDEX idx_sessions_status     ON sessions(status);
```

| Coluna                   | Tipo     | Descrição                                           |
|--------------------------|----------|-----------------------------------------------------|
| id                       | INTEGER  | PK auto-increment                                   |
| type                     | TEXT     | `'WORK'` ou `'STUDY'`                               |
| project_id               | INTEGER  | FK → projects. NULL para sessões de estudo           |
| timer_mode               | TEXT     | `'PROGRESSIVE'` (contagem ↑) ou `'REGRESSIVE'` (↓)  |
| status                   | TEXT     | Estado do ciclo de vida da sessão                    |
| planned_duration_seconds | INTEGER  | Duração alvo em modo regressivo (Pomodoro)           |
| duration_seconds         | INTEGER  | Duração real em segundos                             |
| started_at               | DATETIME | Início real (para imunidade a suspensão do SO)       |
| finished_at              | DATETIME | Fim da sessão (NULL enquanto ativa)                  |
| rating                   | INTEGER  | Autoavaliação 1-5 (preenchida no review)             |
| notes                    | TEXT     | Anotações livres da sessão                           |
| created_at               | DATETIME | Timestamp de criação do registro                     |

**Status lifecycle:**
```
ACTIVE → PAUSED → ACTIVE → COMPLETED
ACTIVE → CANCELLED
```

---

### `session_tags`

Tabela de junção N:N entre sessions e tags. Uma sessão pode ter múltiplas tags.

```sql
CREATE TABLE session_tags (
    session_id  INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    tag_id      INTEGER NOT NULL REFERENCES tags(id)     ON DELETE CASCADE,
    PRIMARY KEY (session_id, tag_id)
);

CREATE INDEX idx_session_tags_tag ON session_tags(tag_id);
```

| Coluna     | Tipo    | Descrição         |
|------------|---------|-------------------|
| session_id | INTEGER | FK → sessions     |
| tag_id     | INTEGER | FK → tags         |

---

### `weekly_goals`

Metas semanais de horas por categoria/projeto.

```sql
CREATE TABLE weekly_goals (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    type         TEXT    NOT NULL CHECK (type IN ('WORK', 'STUDY')),
    label        TEXT    NOT NULL,           -- nome descritivo (ex: "FlowState App")
    target_hours INTEGER NOT NULL,
    week_start   DATE    NOT NULL,           -- sempre uma segunda-feira (YYYY-MM-DD)
    created_at   DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_weekly_goals_week ON weekly_goals(week_start);
```

| Coluna       | Tipo     | Descrição                                     |
|--------------|----------|-----------------------------------------------|
| id           | INTEGER  | PK auto-increment                             |
| type         | TEXT     | `'WORK'` ou `'STUDY'`                         |
| label        | TEXT     | Rótulo da meta (projeto ou tag)                |
| target_hours | INTEGER  | Horas-alvo da semana                           |
| week_start   | DATE     | Segunda-feira da semana (YYYY-MM-DD)           |
| created_at   | DATETIME | Timestamp de criação                           |

> **Nota:** `current_hours` é **computado** via query nas sessions da semana, nunca armazenado.

---

## Campos Computados (Views / Queries)

Estes dados são derivados no runtime, não armazenados:

| Dado                    | Fonte                                                     |
|-------------------------|------------------------------------------------------------|
| `currentHours` (goals)  | `SUM(duration_seconds)` de sessions na semana do goal      |
| `heatmap.intensity`     | Calculado a partir de `SUM(duration_seconds)` por dia      |
| `heatmap.totalSeconds`  | `SUM(duration_seconds)` agrupado por `DATE(started_at)`    |
| `heatmap.sessionCount`  | `COUNT(*)` agrupado por `DATE(started_at)`                 |
| `stats.workHours`       | `SUM(duration_seconds)/3600` WHERE type = 'WORK'           |
| `stats.studyHours`      | `SUM(duration_seconds)/3600` WHERE type = 'STUDY'          |
| `stats.currentStreak`   | Dias consecutivos com pelo menos 1 session COMPLETED       |
| `distribution`          | `GROUP BY project_id` ou `GROUP BY tag_id` com JOIN        |

---

## Queries Úteis

### Heatmap dos últimos 6 meses
```sql
SELECT
    DATE(started_at)    AS date,
    SUM(duration_seconds) AS total_seconds,
    COUNT(*)            AS session_count
FROM sessions
WHERE status = 'COMPLETED'
  AND started_at >= DATE('now', '-6 months')
GROUP BY DATE(started_at)
ORDER BY date;
```

### Streak atual
```sql
WITH days AS (
    SELECT DISTINCT DATE(started_at) AS d
    FROM sessions
    WHERE status = 'COMPLETED'
    ORDER BY d DESC
),
streak AS (
    SELECT d, ROW_NUMBER() OVER (ORDER BY d DESC) AS rn
    FROM days
)
SELECT COUNT(*) AS current_streak
FROM streak
WHERE JULIANDAY(DATE('now')) - JULIANDAY(d) = rn - 1;
```

### Progresso semanal de um goal
```sql
SELECT COALESCE(SUM(s.duration_seconds) / 3600.0, 0) AS current_hours
FROM sessions s
JOIN session_tags st ON s.id = st.session_id
WHERE s.status = 'COMPLETED'
  AND s.started_at >= :week_start
  AND s.started_at < DATE(:week_start, '+7 days')
  AND st.tag_id IN (SELECT id FROM tags WHERE name = :label);
```

### Distribuição de trabalho por projeto
```sql
SELECT
    p.name  AS label,
    p.color AS color,
    SUM(s.duration_seconds) / 3600.0 AS hours
FROM sessions s
LEFT JOIN projects p ON s.project_id = p.id
WHERE s.type = 'WORK' AND s.status = 'COMPLETED'
GROUP BY s.project_id
ORDER BY hours DESC;
```

---

## Mapeamento TypeScript ↔ SQLite

| TypeScript Type     | Tabela SQLite   | Notas                                      |
|---------------------|-----------------|---------------------------------------------|
| `Project`           | `projects`      | `archived: boolean` → `INTEGER 0/1`        |
| `Tag`               | `tags`          | Mapeamento direto                           |
| `Session`           | `sessions`      | `projectId` → `project_id` (snake_case)     |
| `SessionTag`        | `session_tags`  | Tabela de junção, sem ID próprio            |
| `WeeklyGoal`        | `weekly_goals`  | `currentHours` é computado, não armazenado  |
| `SessionWithRelations` | JOIN query   | View que junta sessions + project + tags    |
| `ActivityEntry`     | VIEW / query    | Projeção simplificada para o dashboard      |
| `HeatmapDay`        | Aggregation     | `GROUP BY DATE(started_at)`                 |
| `DashboardStats`    | Aggregation     | Múltiplos `SUM/COUNT` em sessions           |
| `DistributionChart` | Aggregation     | `GROUP BY project_id` ou `tag_id`           |

---

## Migração Futura (Tauri IPC)

Cada função em `front-end/services/*.ts` mapeia para um comando Tauri:

```
getProjects()       → invoke('get_projects')
createProject()     → invoke('create_project', { name, color })
deleteProject()     → invoke('delete_project', { id })
getTags()           → invoke('get_tags')
createTag()         → invoke('create_tag', { name, color })
deleteTag()         → invoke('delete_tag', { id })
saveSession()       → invoke('save_session', { session })
saveSessionReview() → invoke('update_session_review', { sessionId, rating, notes })
getStats()          → invoke('get_dashboard_stats')
getWeeklyGoals()    → invoke('get_weekly_goals', { weekStart })
createWeeklyGoal()  → invoke('create_weekly_goal', { type, label, targetHours, referenceId })
updateWeeklyGoal()  → invoke('update_weekly_goal', { id, targetHours, label })
deleteWeeklyGoal()  → invoke('delete_weekly_goal', { id })
getGoalProgress()   → invoke('get_goal_progress', { goalId })
getGoalsSummary()   → invoke('get_goals_summary')
getGoalsHistory()   → invoke('get_goals_history')
getStreakInfo()      → invoke('get_streak_info')
getConsistencyDays() → invoke('get_consistency_days', { days: 30 })
getRecentActivities() → invoke('get_recent_activities', { limit })
getHeatmap()        → invoke('get_heatmap', { months })
getWorkDistribution() → invoke('get_work_distribution')
getStudyDistribution() → invoke('get_study_distribution')
```

A UI **não muda** — apenas o corpo das funções de serviço troca de mock para `invoke()`.
