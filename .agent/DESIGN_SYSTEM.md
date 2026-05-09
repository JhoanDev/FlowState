# FlowState Design System

Documentacao completa do design system, padroes de codigo
e arquitetura de UI do FlowState.

---

## Sumario

- [Estrutura de pastas](#estrutura-de-pastas)
- [Design Tokens (globals.css)](#design-tokens-globalscss)
- [Componentes UI reutilizaveis](#componentes-ui-reutilizaveis)
- [Utilitarios (lib/utils.ts)](#utilitarios-libutilsts)
- [Custom Hooks](#custom-hooks)
- [Providers e contextos](#providers-e-contextos)
- [Sistema de tipos (types/)](#sistema-de-tipos-types)
- [Servicos (services/)](#servicos-services)
- [Componentes de feature](#componentes-de-feature)
- [Layout e navegacao](#layout-e-navegacao)
- [Padroes e convencoes](#padroes-e-convencoes)
- [Dependencias de UI](#dependencias-de-ui)

---

## Estrutura de pastas

```text
/app/                   Paginas do Next.js App Router
  globals.css           Design tokens + tema + estilos globais
  layout.tsx            Layout raiz (fontes, providers, loader)
  page.tsx              Dashboard (pagina inicial)
  /session/             Pagina de sessao ativa
  /goals/               Pagina de metas semanais
  /logbook/             Pagina de historico/calendario
  /projects/            Pagina de projetos e tags
  /settings/            Pagina de configuracoes

/components/
  /ui/                  Primitivos reutilizaveis
  /layout/              AppLayout, GlobalLoader
  /activity/            Timer e sessao
  /dashboard/           Visualizacao e metricas
  /goals/               Metas e streaks
  /logbook/             Calendario e historico
  /projects/            Gestao de projetos/tags
  sidebar.tsx           Barra lateral de navegacao
  top-nav.tsx           Header mobile

/hooks/                 Custom hooks reutilizaveis
/lib/                   Funcoes utilitarias (cn)
/types/                 Tipos TypeScript (dominio)
/services/              Camada de API (Tauri IPC + mocks)
/providers/             Context providers (settings)
/public/                Assets estaticos
/src-tauri/             Backend Rust
```

---

## Design Tokens (globals.css)

O arquivo `app/globals.css` e o coracao do design system.
Ele define variaveis CSS, mapeia para classes Tailwind e
estabelece estilos base.

### Importacao e bridge Tailwind v4

```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  /* mapeia CSS vars para classes Tailwind */
}
```

O bloco `@theme inline` permite usar as variaveis como
classes Tailwind: `bg-background`, `text-primary`,
`border-border`, etc.

### Paleta de cores

| Token                  | Valor     | Uso                           |
| ---------------------- | --------- | ----------------------------- |
| `--background`         | `#09090b` | Fundo principal da app        |
| `--foreground`         | `#fafafa` | Texto principal               |
| `--card`               | `#0f0f12` | Superficie de cards           |
| `--card-foreground`    | `#fafafa` | Texto dentro de cards         |
| `--surface`            | `#16161a` | Superficie elevada            |
| `--primary`            | `#8b5cf6` | Acao principal (roxo)         |
| `--primary-foreground` | `#ffffff` | Texto sobre primary           |
| `--muted`              | `#1c1c22` | Fundo discreto                |
| `--muted-foreground`   | `#71717a` | Texto secundario              |
| `--accent`             | `#23232b` | Fundo de destaque sutil       |
| `--accent-foreground`  | `#fafafa` | Texto sobre accent            |
| `--border`             | `#27272a` | Bordas padrao                 |
| `--input`              | `#27272a` | Borda de inputs               |
| `--ring`               | `#8b5cf6` | Anel de foco                  |
| `--success`            | `#10b981` | Verde (sucesso)               |
| `--destructive`        | `#ef4444` | Vermelho (erro/exclusao)      |
| `--work`               | `#f97316` | Laranja (sessoes de trabalho) |
| `--work-foreground`    | `#ffffff` | Texto sobre work              |
| `--study`              | `#3b82f6` | Azul (sessoes de estudo)      |
| `--study-foreground`   | `#ffffff` | Texto sobre study             |

### Hierarquia de profundidade

O tema dark usa camadas progressivas de cinza para criar
profundidade visual:

```text
background (#09090b)
  -> card (#0f0f12)
    -> surface (#16161a)
      -> muted (#1c1c22)
        -> accent (#23232b)
```

### Temas de sessao

Classes CSS que sobrescrevem a cor primaria durante
sessoes ativas:

```css
.theme-work {
  --primary: var(--work);   /* laranja */
  --ring: var(--work);
}

.theme-study {
  --primary: var(--study);  /* azul */
  --ring: var(--study);
}
```

Quando aplicadas no elemento raiz, todos os componentes
que usam `bg-primary`, `text-primary`, `ring-ring`
mudam automaticamente de cor.

### Escala de border-radius

| Token          | Calculo         | Valor     |
| -------------- | --------------- | --------- |
| `--radius`     | Base            | `0.7rem`  |
| `--radius-sm`  | `radius * 0.5`  | `0.35rem` |
| `--radius-md`  | `radius`        | `0.7rem`  |
| `--radius-lg`  | `radius * 1.5`  | `1.05rem` |
| `--radius-xl`  | `radius * 2`    | `1.4rem`  |
| `--radius-2xl` | `radius * 3`    | `2.1rem`  |
| `--radius-3xl` | `radius * 4`    | `2.8rem`  |

### Tipografia

```css
font-family:
  var(--font-geist-sans),
  var(--font-geist-mono),
  "JetBrains Mono",
  system-ui,
  sans-serif;
```

Fontes carregadas via Next.js Google Fonts
(`Geist` e `Geist Mono`).

### Estilos base

- **Body**: `100vw x 100vh`, `overflow: hidden`,
  antialiased
- **Scrollbar**: 6px, cor `--border`,
  hover `--muted-foreground`
- **Selection**: fundo `--primary`,
  texto `--primary-foreground`

---

## Componentes UI reutilizaveis

Localizados em `components/ui/`. Sao os primitivos que
todos os componentes de feature consomem.

### Button (`components/ui/button.tsx`)

Componente com `forwardRef` e `displayName`.

**Variantes:**

| Variante      | Estilo                            |
| ------------- | --------------------------------- |
| `default`     | `bg-primary`, sombra, hover 90%   |
| `outline`     | Borda, fundo transparente         |
| `secondary`   | `bg-muted`, hover `bg-accent`     |
| `ghost`       | Sem fundo, hover `bg-accent`      |
| `destructive` | `bg-destructive`, hover 90%       |

**Tamanhos:**

| Tamanho   | Dimensoes                 |
| --------- | ------------------------- |
| `default` | `h-12 px-6 py-3 text-sm`  |
| `sm`      | `h-10 px-4 text-sm`       |
| `lg`      | `h-14 px-8 text-base`     |
| `icon`    | `h-11 w-11`               |

**Props**: estende `ButtonHTMLAttributes` com
`variant` e `size`.

### Card (`components/ui/card.tsx`)

Composto por subcomponentes, todos com `forwardRef`:

- **Card** - container com borda, sombra, hover sutil
- **CardHeader** - `p-7`, gap `1.5`
- **CardTitle** - `<h3>`, `text-base font-semibold`
- **CardDescription** - `text-sm text-muted-foreground`
- **CardContent** - `px-7 pb-7 pt-0`
- **CardFooter** - `flex items-center px-7 pb-7 pt-0`

### Badge (`components/ui/badge.tsx`)

**Variantes:**

| Variante    | Estilo                           |
| ----------- | -------------------------------- |
| `default`   | `bg-primary/10 text-primary`     |
| `secondary` | `bg-muted text-foreground`       |
| `outline`   | Apenas borda                     |
| `work`      | `bg-work/10 text-work` (laranja) |
| `study`     | `bg-study/10 text-study` (azul)  |

### Input (`components/ui/input.tsx`)

- Altura `h-12`, `rounded-md`, fundo transparente
- Foco: `ring-2 ring-ring/50`
- Remove spinners de inputs numericos (webkit)
- Hover com borda clara, disabled `opacity-50`

### Progress (`components/ui/progress.tsx`)

- Barra horizontal com `value` (0-100%)
- Altura `h-3`, `rounded-full`
- Transicao suave de `500ms` no indicador
- Aceita `indicatorClassName` para customizar cor

### Skeleton (`components/ui/skeleton.tsx`)

- `animate-pulse rounded-md bg-muted`
- Placeholder para estados de loading

### DatePicker (`components/ui/date-picker.tsx`)

- Calendario customizado (sem lib externa)
- Navegacao por mes/ano
- Formatacao locale-aware (`pt-BR`, `en-US`)
- Popover dropdown com `z-50`
- Destaque para hoje e data selecionada
- Formato ISO (`YYYY-MM-DD`) no valor

### TimePicker (`components/ui/time-picker.tsx`)

- Suporte a formato 12h/24h (via settings)
- Toggle AM/PM para modo 12h
- Inputs numericos inline
- Validacao de limites (0-23h, 0-59m)
- Integracao com `useSettings()`

---

## Utilitarios (lib/utils.ts)

Um unico utilitario exportado:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**O que faz**: combina `clsx` (concatenacao condicional
de classes) com `tailwind-merge` (resolve conflitos de
classes Tailwind).

**Exemplo de uso**:

```tsx
<div className={cn(
  "text-sm font-medium",
  isActive && "text-primary",
  className
)} />
```

**Regra**: todo componente que aceita `className` deve
usar `cn()` para mesclar classes.

---

## Custom Hooks

Localizados em `hooks/`. Encapsulam logica de dominio
reutilizavel.

### useAsync (`hooks/use-async.ts`)

Hook generico para data fetching.

```typescript
const { data, isLoading, error, refetch } =
  useAsync(fetchFn, [deps]);
```

- Gerencia estados `loading`, `error`, `data`
- Aceita array de dependencias para re-fetch
- Usado por todos os componentes que buscam dados

### useSessionTimer (`hooks/use-session-timer.ts`)

Gerencia o timer de sessao.

```typescript
const {
  seconds, formattedTime, isActive, isPaused,
  start, pause, resume, stop
} = useSessionTimer(mode, duration, onComplete);
```

- Modo `PROGRESSIVE`: conta para cima
- Modo `REGRESSIVE`: conta para baixo,
  auto-completa ao chegar em 0
- `formattedTime`: `HH:MM:SS` ou `MM:SS`

### useGoals (`hooks/useGoals.ts`)

CRUD completo de metas semanais.

```typescript
const {
  goals, history, summary, isLoading,
  addGoal, editGoal, removeGoal, refreshGoals
} = useGoals();
```

### useLogbook (`hooks/useLogbook.ts`)

Gerencia o calendario e filtro de atividades.

```typescript
const {
  currentMonth, calendarDays,
  selectedDate, selectedActivities,
  nextMonth, prevMonth, goToToday
} = useLogbook();
```

### useStats (`hooks/useStats.ts`)

Busca dados de streak e consistencia.

```typescript
const {
  streakInfo, consistencyDays, isLoading
} = useStats();
```

---

## Providers e contextos

### SettingsProvider (`providers/settings-provider.tsx`)

Provider global que gerencia configuracoes da app.

```typescript
interface SettingsContextType {
  settings: AppSettings | null;
  isLoading: boolean;
  updateSetting: <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => Promise<void>;
}
```

**Responsabilidades:**

- Carrega settings no mount
- Aplica classe de tema no `documentElement`
- Detecta tema do sistema (`prefers-color-scheme`)
- Updates otimistas na UI

**Como consumir:**

```typescript
const { settings, updateSetting } = useSettings();
```

---

## Sistema de tipos (types/)

Arquivo unico `types/index.ts` com todos os tipos.

### Tipos base (enums)

```typescript
type SessionType   = "WORK" | "STUDY";
type TimerMode     = "PROGRESSIVE" | "REGRESSIVE";
type SessionStatus =
  "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
```

### Entidades (espelham tabelas SQLite)

| Interface    | Campos principais                    |
| ------------ | ------------------------------------ |
| `Project`    | `id`, `name`, `color`, `archived`    |
| `Tag`        | `id`, `name`, `color`, `createdAt`   |
| `Session`    | `id`, `type`, `projectId`, `status`  |
| `SessionTag` | `sessionId`, `tagId` (relacao N:N)   |
| `WeeklyGoal` | `id`, `type`, `targetHours`, `tagId` |

### Tipos de visualizacao

| Interface             | Uso                             |
| --------------------- | ------------------------------- |
| `HeatmapDay`          | Dados do contribution heatmap   |
| `DistributionChart`   | Grafico de distribuicao (donut) |
| `DistributionSlice`   | Fatia individual do grafico     |
| `StudyTagRankingItem` | Ranking de tags de estudo       |
| `ActivityEntry`       | Atividade formatada p/ listagem |
| `DashboardStats`      | Metricas resumidas do dashboard |

### Tipos de configuracao

```typescript
type ThemeOption      = "light" | "dark" | "system";
type LanguageOption   = "en" | "pt" | "es";
type TimeFormatOption = "12h" | "24h";
type DateFormatOption = "US" | "BR";

interface AppSettings {
  theme: ThemeOption;
  language: LanguageOption;
  timeFormat: TimeFormatOption;
  dateFormat: DateFormatOption;
  strictModeDefault: boolean;
}
```

---

## Servicos (services/)

Camada de abstracao entre frontend e backend. Cada
arquivo encapsula chamadas Tauri IPC com fallback
para dados mock em desenvolvimento.

| Arquivo              | Responsabilidade               |
| -------------------- | ------------------------------ |
| `tauri.ts`           | Helper de invocacao IPC        |
| `sessions.ts`        | CRUD de sessoes                |
| `projects.ts`        | CRUD de projetos               |
| `tags.ts`            | CRUD de tags                   |
| `dashboard.ts`       | Dados agregados do dashboard   |
| `goalsService.ts`    | CRUD de metas semanais         |
| `logbookService.ts`  | Dados do calendario/logbook    |
| `statsService.ts`    | Streaks e consistencia         |
| `settingsService.ts` | Leitura/escrita de configs     |

---

## Componentes de feature

Componentes maiores que compoem as paginas. Consomem
os primitivos de `components/ui/`.

### Activity (`components/activity/`) - 7 componentes

| Componente                | Funcao                       |
| ------------------------- | ---------------------------- |
| `timer-display.tsx`       | Timer com play/pause/stop    |
| `session-type-toggle.tsx` | Toggle Work/Study animado    |
| `session-config-form.tsx` | Config de sessao             |
| `session-review-form.tsx` | Avaliacao pos-sessao         |
| `manual-session-form.tsx` | Entrada manual de sessao     |
| `project-selector.tsx`    | Dropdown de projeto          |
| `tag-selector.tsx`        | Multi-select de tags         |

### Dashboard (`components/dashboard/`) - 7 componentes

| Componente                 | Funcao                      |
| -------------------------- | --------------------------- |
| `stats-cards.tsx`          | 4 cards de metricas         |
| `contribution-heatmap.tsx` | Heatmap estilo GitHub       |
| `distribution-chart.tsx`   | Grafico donut com legenda   |
| `recent-activity.tsx`      | Sessoes recentes            |
| `study-tag-ranking.tsx`    | Ranking de tags por horas   |
| `top-rated-ranking.tsx`    | Sessoes melhor avaliadas    |
| `weekly-goals.tsx`         | Progresso de metas          |

### Goals (`components/goals/`) - 4 componentes

| Componente               | Funcao                       |
| ------------------------ | ---------------------------- |
| `current-week-goals.tsx` | Metas da semana atual        |
| `consistency-grid.tsx`   | Grid de consistencia         |
| `streak-card.tsx`        | Streak atual e melhor        |
| `goals-history.tsx`      | Historico de metas           |

### Logbook (`components/logbook/`) - 2 componentes

| Componente                | Funcao                       |
| ------------------------- | ---------------------------- |
| `logbook-calendar.tsx`    | Vista mensal com intensidade |
| `session-review-list.tsx` | Sessoes detalhadas do dia    |

### Projects (`components/projects/`) - 2 componentes

| Componente                   | Funcao                   |
| ---------------------------- | ------------------------ |
| `list-manager.tsx`           | CRUD de projetos e tags  |
| `filtered-sessions-view.tsx` | Sessoes por projeto/tag  |

---

## Layout e navegacao

### AppLayout (`components/layout/app-layout.tsx`)

Wrapper principal da estrutura da app:

- **Desktop** (`>= lg`): sidebar fixa 240px + conteudo
- **Mobile** (`< lg`): sidebar overlay + TopNav

### Sidebar (`components/sidebar.tsx`)

- Largura fixa: `w-[240px]`
- Indicador ativo com animacao spring (`layoutId`)
- Link de configuracoes no footer
- `layoutIdPrefix` para mobile/desktop

### TopNav (`components/top-nav.tsx`)

- Visivel apenas em `< lg`
- Altura `h-14`
- Botao hamburger + titulo da pagina

### GlobalLoader (`components/layout/global-loader.tsx`)

- Overlay fullscreen com logo animado
- Tempo minimo de exibicao: 1.5s
- `z-[9999]` para ficar acima de tudo

---

## Padroes e convencoes

### 1. Composicao de classes com `cn()`

Todos os componentes usam `cn()` para mesclar classes.
Isso evita conflitos do Tailwind e permite override
via prop `className`:

```tsx
<div className={cn(
  "base-classes",
  conditional && "extra",
  className
)} />
```

### 2. forwardRef + displayName

Componentes de UI primitivos usam `React.forwardRef`
e definem `displayName` para debugging:

```tsx
const Button = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, variant, ...props }, ref) => {
  /* ... */
});
Button.displayName = "Button";
```

### 3. Diretiva "use client"

- Componentes interativos: `"use client"` no topo
- Consumidores de contexto precisam da diretiva
- Layout components sao server-compatible

### 4. Props com interface tipada

```typescript
interface ComponentProps
  extends React.HTMLAttributes<HTMLElement> {
  variant?: "default" | "secondary" | "outline";
  size?: "sm" | "default" | "lg";
  className?: string;
}
```

### 5. Sistema de icones

Todos os icones vem do `lucide-react`.
Nao usamos SVGs customizados nem icon fonts:

```tsx
import {
  Clock, Play, Pause, Settings
} from "lucide-react";
```

### 6. Animacoes com Motion

A lib `motion` (Framer Motion) e usada para:

- **layoutId**: transicao entre estados
- **spring physics**: `bounce: 0.15`, `duration: 0.5`
- **fadeIn/slideIn**: entrada de componentes

### 7. Estados de loading

Padrao consistente em componentes de feature:

```tsx
if (isLoading) {
  return <Skeleton className="h-48" />;
}
if (!data) {
  return <p className="text-muted-foreground">
    Nenhum dado
  </p>;
}
return <ActualContent data={data} />;
```

### 8. Cores dinamicas

Componentes que recebem cor (projetos, tags)
aplicam via style inline:

```tsx
<div style={{ backgroundColor: project.color }} />
```

### 9. Responsividade

Mobile-first com breakpoints Tailwind padrao:

- Base: mobile
- `sm` (640px): ajustes de largura
- `lg` (1024px): layout desktop com sidebar
- Patterns: `hidden lg:block`, `w-[85vw]`

### 10. Transicoes padrao

- Hover/foco: `duration-200 ease-out`
- Barras de progresso: `duration-500`
- Animacoes de layout: spring via Motion

### 11. Acessibilidade

- `focus-visible:ring-2` em interativos
- Offset: `ring-offset-2 ring-offset-background`
- Disabled: `pointer-events-none opacity-50`
- HTML semantico: headings, button types
- Contraste WCAG (texto claro, fundo escuro)

---

## Dependencias de UI

| Pacote           | Versao   | Uso                         |
| ---------------- | -------- | --------------------------- |
| `tailwindcss`    | v4       | Framework CSS utility-first |
| `clsx`           | v2.1.1   | Concatenacao de classes     |
| `tailwind-merge` | v3.5.0   | Resolve conflitos Tailwind  |
| `lucide-react`   | v0.577.0 | Biblioteca de icones        |
| `motion`         | v12.38.0 | Animacoes (Framer Motion)   |
| `next`           | v16.2.0  | Framework React (SSG)       |
| `react`          | v19.2.3  | Biblioteca UI               |
| `typescript`     | v5       | Tipagem estatica            |
