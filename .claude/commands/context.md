# FlowState Product Context

Visão geral do produto, arquitetura e tipos.

## 1. O que é & Stack

- **FlowState:** App desktop local-first de produtividade. Diferencia
  **TRABALHO** (projetos) de **ESTUDO** (tags). Sem cloud, dados em SQLite.
- **Stack:** Tauri v2, Rust (rusqlite), Next.js 16 (static export), React 19,
  Tailwind v4, Framer Motion, Lucide React, i18next, Geist Sans/Mono.

## 2. Fluxo de Dados

```text
UI Component → Hook → services/*.ts → invokeTauri<T>() → Rust commands → SQLite
```

- A UI nunca chama `invoke()` diretamente. Em dev (browser sem Tauri),
  `invokeTauri` retorna `null` e usa mocks com 300ms de delay simulado.

## 3. Provider Tree & Layout

Provider Tree (`app/layout.tsx`):

```text
I18nProvider → SettingsProvider (useSettings) → CommandPaletteProvider → GlobalLoader
```

`SettingsProvider` aplica `.light`/`.dark` no `<html>` e muda idioma.

Layout Estrutural (`AppLayout`):

```text
flex h-screen
├── <Sidebar> (oculto em < lg, fixo em ≥ lg)
├── Mobile overlay (fecha ao clicar fora)
├── Mobile sidebar panel (slide-in, w-[280px])
└── flex-1 flex-col → <TopNav> (hambúrguer) + <main> (overflow-y-auto)
```

## 4. Tipos TypeScript (`types/index.ts`)

Mapeiam 1:1 com structs Rust.

```ts
type SessionType = "WORK" | "STUDY";
type TimerMode = "PROGRESSIVE" | "POMODORO";
type PomodoroPhase = "WORK" | "SHORT_BREAK" | "LONG_BREAK";
type SessionStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
type ThemeOption = "light" | "dark" | "system";
type LanguageOption = "en" | "pt" | "es"; // "es" faz fallback para "en"
type TimeFormatOption = "12h" | "24h";
type DateFormatOption = "US" | "BR";

// Entidades SQLite
Project    → { id, name, color, archived, createdAt }
Tag        → { id, name, color, createdAt }
Session    → { id, type, projectId, timerMode, status,
               plannedDurationSeconds, durationSeconds, startedAt,
               finishedAt, rating (1-5), notes, createdAt }
WeeklyGoal → { id, type, label, targetHours, projectId, tagId,
               currentHours (computed), weekStart, createdAt }
Settings   → { theme, language, timeFormat, dateFormat, strictModeDefault }

// View Types (Computados/Helpers)
ActivityEntry        → Session + projectName, projectColor, tags
SessionWithRelations → Session + project? + tags
DashboardStats       → workHours, workTrend, studyHours, studyTrend, streaks...
HeatmapDay           → { date, totalSeconds, sessionCount, intensity }
```

## 5. Lifecycle do Timer & Hooks

Lifecycle de Sessão:

```text
IDLE → ACTIVE → REVIEW → (navega para /)
```

*Strict mode:* entra em fullscreen em ACTIVE, sai em REVIEW/IDLE.

### Hooks Customizados

- `useSessionTimer` (`use-session-timer.ts`): `{ seconds, formattedTime,
  isActive, start, pause, resume, stop }`. Em regressivo, ao zerar dispara
  `onTimerComplete`. `formattedTime` omite horas se `< 1h`.
- `useGoals` (`useGoals.ts`): `{ goals, history, summary, isLoading,
  refreshGoals }`.
- `useStats` (`useStats.ts`): `{ streakInfo, consistencyDays, refreshStats }`.
- `useLogbook` (`useLogbook.ts`): Dados do calendário e sessões por dia.
- `useSettings` (`settings-provider.tsx`): `{ settings, updateSetting }`.
- `useCommandPalette` (`use-command-palette.ts`): `{ isOpen, toggle }`.
- `useAsync` (`use-async.ts`): Estado genérico de promessas.

## 6. Padrões de Services

Use o padrão do respectivo arquivo:

- **Padrão 1 (funções):** `saveSession(session): Promise<Session>`
  (usado em sessions, projects, tags).
- **Padrão 2 (namespace):** `goalsService = { ... }` (usado em
  goals, stats, dashboard).

## 7. Locais Críticos

- `app/globals.css` — CSS vars de cor e `@theme` do Tailwind.
- `types/index.ts` — Todos os tipos TS.
- `services/tauri.ts` — Helper central `invokeTauri<T>()`.
- `providers/settings-provider.tsx` — Tema, idioma e `useSettings()`.
- `src-tauri/src/lib.rs` — Registro dos comandos Tauri.
- `src-tauri/src/database/migrations.rs` — Schema SQL inicial.
- `locales/en.ts` / `locales/pt-BR.ts` — Traduções.
