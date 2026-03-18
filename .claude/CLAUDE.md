# CLAUDE.md — FlowState Desktop

## Stack
- **UI:** Next.js (SSG, `output: 'export'`) + React + TypeScript
- **Styling:** Tailwind CSS
- **Runtime:** Tauri v2 (Rust) — target: Pop!_OS/Linux
- **DB:** SQLite via `tauri-plugin-sql` (100% local)

---

## Architecture

```
src/
├── types/          # Interfaces TypeScript (espelham structs Rust)
├── mocks/          # Dados falsos estruturados
├── services/       # Funções async — ÚNICA fonte de dados para componentes
└── components/
    └── ui/         # Componentes base reutilizáveis
```

---

## Regras Críticas

### 1. Camada de Dados (Service Layer)
- **NUNCA** coloque dados ou lógica de fetch dentro de componentes visuais
- Toda leitura/escrita de dados passa por `src/services/*.ts`
- Toda função de serviço é `async` + simula delay IPC:

```ts
// src/services/activities.ts
import { Activity } from '@/types';
import { mockActivities } from '@/mocks/activities';

export async function getActivities(): Promise<Activity[]> {
  // Futuro: return await invoke('get_activities');
  await new Promise(res => setTimeout(res, 300));
  return mockActivities;
}
```

- Troca futura: apenas a implementação do serviço muda. UI permanece intocada.

### 2. Tipagem
- Crie `interfaces`/`types` em `src/types/` antes de criar mocks ou serviços
- Types devem espelhar exatamente as futuras structs do Rust
- Mocks devem respeitar o type à risca — sem campos extras ou faltando

### 3. Estados Obrigatórios
Todo componente que consome um serviço **deve** tratar:
- `isLoading` — skeleton ou spinner
- `isError` — mensagem de erro visível

### 4. Frontend — Regras Invioláveis

| Regra | Correto | Proibido |
|---|---|---|
| Cores | `bg-background`, `text-foreground`, `bg-primary` | `#fff`, `gray-500`, inline style |
| Imagens | `<img />` ou `<Image unoptimized />` | `<Image />` sem `unoptimized` |
| Estilos dinâmicos | `cn()` (clsx + tailwind-merge) | template literals com classes TW |
| Efeitos visuais | `border`, `shadow-sm`, `rounded-md` | glow, glassmorphism, gradients custosos |
| Composição | `<Card><CardHeader /></Card>` | props drilling excessivo |

### 5. DRY — Antes de criar qualquer componente
Verificar nesta ordem:
1. `tailwind.config.ts` — tokens existentes
2. `globals.css` — variáveis CSS
3. `src/components/ui/` — componentes base

Nunca recriar o que já existe.

### 6. Layout
- **Desktop-first** — esqueça mobile
- `"use client"` é padrão nas telas interativas (app offline, sem SSR)
- Grids estruturados, flexbox para painéis, suporte a atalhos de teclado

---

## Modelo de Dados (SQLite)

```sql
CREATE TABLE activities (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    type           TEXT NOT NULL,          -- 'WORK' | 'STUDY'
    category       TEXT NOT NULL,          -- 'Java', 'Node.js', 'ZAPAPI'
    duration_seconds INTEGER,
    started_at     DATETIME,
    finished_at    DATETIME,
    notes          TEXT
);

CREATE TABLE weekly_goals (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    category       TEXT NOT NULL,
    target_hours   INTEGER NOT NULL,
    created_at     DATETIME
);
```

---

## Funcionalidades do Produto

### Core
- Sessões de tipo **WORK** ou **STUDY**, categorizadas por tag (linguagem, tech, projeto)
- Vinculação de sessões a projetos específicos

### Timer
- Modos: progressivo, regressivo (Pomodoro), maratona/rigoroso
- Imunidade a suspensão do SO via diff de timestamps
- Mini-player flutuante (Always on Top)
- Atalho para abrir VS Code na pasta do projeto ativo

### Logbook & Metas
- Metas semanais com barras de progresso por categoria/projeto
- Calendário mensal interativo
- Feed cronológico de anotações por sessão

### Relatórios
- Heatmap de contribuições diárias
- Gráficos de pizza (foco vs estudo), distribuição de esforço
- Sistema de Streaks

### Dados
- 100% offline — import/export do arquivo `.db` do SQLite