# FlowState Design System v2.1

> Local-first time tracking pra devs. Tauri + Next.js (SSG export). Este doc é
> a fonte de verdade visual e arquitetural — qualquer divergência entre o que
> você vê na UI e o que está aqui é um bug.

---

## 1. Stack & Arquitetura

- **Core:** Next.js App Router (`output: 'export'`), Tauri v2 (Rust), Tailwind
  v4, Framer Motion, Lucide-react, next-intl.
- **RSC & Client:** Componentes interativos com `"use client"`. Buscas async
  priorizam Server Components com `<Suspense fallback={<Skeleton/>}>` pra
  streaming.
- **Services (`/services`):** Encapsulam IPC (`invokeTauri`) + mocks de dev.
  **UI nunca chama DB ou `invoke()` direto** — sempre via service layer.
- **Assets:** Sempre `<img />` nativo ou `<Image unoptimized />`
  (compatibilidade Tauri SSG).
- **Estado:** Server state via React Query / SWR no client; UI state local com
  `useState`. Settings globais em `useSettings` (Zustand ou Context).

---

## 2. Design Tokens & Temas

> **Regra de ouro:** todas as cores vivem em `app/globals.css` como CSS vars
> mapeadas para utilities Tailwind v4 via `@theme`. **Nenhum componente pode
> conter cor hardcoded.**

### 2.1 Fonte das cores

Toda cor visível na UI vem de uma var CSS definida em `globals.css`. Use
sempre as utilities Tailwind que mapeiam pra elas — nunca `bg-zinc-900`,
`text-gray-500`, `#ededed`, `rgb(...)`, nada disso direto no JSX.

**Mapa rápido (ver `globals.css` pra valores exatos):**

| Categoria   | Tokens disponíveis                                                            |
| ----------- | ----------------------------------------------------------------------------- |
| Surfaces    | `background`, `card`, `popover`, `surface`, `muted`, `accent`                 |
| Texto       | `foreground`, `card-foreground`, `muted-foreground`, `accent-foreground`      |
| Bordas      | `border`, `input`, `ring`                                                     |
| Brand       | `primary`, `primary-foreground`, `primary-hover`, `primary-muted`             |
| Feedback    | `success`, `success-solid`, `destructive`, `warning` (+ `-foreground/-muted`) |
| Sessão      | `work`, `work-muted`, `study`, `study-muted` (+ `-foreground`)                |
| Charts      | `chart-1` … `chart-6` (sequência harmônica pra distribution/heatmap)          |

**Uso em Tailwind:**

```tsx
// ✅ correto — token semântico
<button className="bg-primary text-primary-foreground hover:bg-primary-hover" />
<Badge className="bg-work-muted text-work-muted-foreground" />
<p className="text-muted-foreground" />

// ❌ proibido
<button className="bg-violet-600 text-white" />
<div style={{ color: '#71717a' }} />
<p className="text-gray-500" />

2.2 Quando usar solid vs muted vs base

Cada cor semântica tem três "tons" pra cobrir os contextos:

    base (--success, --work, --study, …): borda, ícone, ring, dot indicator. Não use como fill com texto branco — pode falhar AA.
    solid (--success-solid): fill de botão/chip preenchido com texto. É a versão garantida AA pra white-on-color.
    muted (--work-muted + --work-muted-foreground): bg de chip/badge passivo, estados "selected" sutis, tints de heatmap. Sempre pareie *-muted com *-muted-foreground.

// Botão Start Session (WORK)
<button className="bg-work text-work-foreground" />

// Tag-WORK selecionada (passivo, na lista)
<span className="bg-work-muted text-work-muted-foreground" />

// Indicador de status (dot + ring)
<div className="bg-work ring-2 ring-work/30" />

2.3 Contraste & Fadiga

    Off-white/off-black obrigatório. #000 puro no light e #fff puro no dark causam fadiga. --background e --foreground em globals.css já estão calibrados — use os tokens, não escreva preto/branco.
    Mínimo WCAG AA (4.5:1 texto normal, 3:1 UI). muted-foreground foi ajustado pra passar AA tanto em background quanto em card.
    Foco visível sempre. focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background.

2.4 Profundidade (Premium, sem drop-shadow pesado)

    Overlays (modal, popover, command palette): bg-popover/85 backdrop-blur-md border border-border.
    Edge highlight (dark mode, em cards/botões elevados): box-shadow: inset 0 1px 0 oklch(1 0 0 / 0.05).
    Sombras: usar utility shadow-sm no máximo. Profundidade vem de contraste de surface (bg-card vs bg-background), não de blur escuro.

2.5 Tipografia

    Famílias: Geist Sans (UI) e Geist Mono (números, paths, IDs).
    Headings: tracking-tight em H1/H2, font-semibold (não bold puro).
    Números: tabular-nums obrigatório em timer, contadores, durações, valores de meta. Sem exceção.
    Escala: text-xs (11–12px metadata), text-sm (14px UI padrão), text-base (16px corpo), text-lg (18px títulos de card), text-2xl+ (H1 de página). Não invente tamanhos fora dessa escala.

2.6 Spacing & Radius

    Use o spacing scale do Tailwind (4px). Spacing de seção: gap-6 ou gap-8.
    Radius tokens definidos em globals.css:
        rounded-sm (4px) — inputs pequenos, badges
        rounded-md (6px) — botões, inputs
        rounded-lg (10px) — cards
        rounded-xl (14px) — modais, painéis grandes
    Container do app icon e mark: rounded-[14px] (1:1 com o símbolo).

3. i18n & Localização

    Zero hardcode. Toda string visível passa por t('chave'). ESLint rule no-literal-string ativa em /components e /app.
    Locale-aware:
        Datas: Intl.DateTimeFormat(locale, { dateStyle: 'medium' }) respeitando settings.dateFormat (US/BR).
        Horas: Intl.DateTimeFormat(locale, { hour12: settings.clock === '12h' }).
        Números/duração: Intl.NumberFormat + Intl.RelativeTimeFormat.
    Pluralização: Intl.PluralRules ou ICU MessageFormat — nunca ${n === 1 ? 'sessão' : 'sessões'}.

4. Componentes Base (UI Primitives)

    Button: <motion.button> com whileTap={{ scale: 0.98 }} e whileHover={{ scale: 1.01 }}. Variantes: default (primary), secondary, ghost, outline, destructive. Tamanhos: sm, md, lg, icon.
    Timer (Activity): tabular-nums + font-mono. Cada dígito animado individualmente via <AnimatePresence mode="popLayout"> pra evitar layout shift. Cor herdada do tipo de sessão (text-work ou text-study).
    Card: <Card> <CardHeader> <CardTitle> <CardDescription> <CardContent> <CardFooter> (padrão shadcn). Background bg-card, borda border border-border.
    Input/Select: bg-input (no dark é distinto de bg-background), border border-border, focus-visible:ring-2 focus-visible:ring-ring.
    Badge/Chip: Sempre par *-muted + *-muted-foreground. Nunca fill saturado em badge passivo.
    Composição: Classes sempre via cn() (clsx + tailwind-merge). Props className propagada em todo primitivo.

5. Layout, Features & Responsividade
5.1 Dashboard — Bento Grid

CSS Grid assimétrico, mobile-first:

<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
  <Heatmap     className="lg:col-span-2 lg:row-span-2" />
  <StreakCard  className="lg:col-span-1" />
  <TopRated    className="lg:col-span-1" />
  <Distribution className="lg:col-span-2" />
  <WeeklyGoals  className="lg:col-span-2" />
</div>

    Entrada em cascata: staggerChildren: 0.05, delayChildren: 0.1.
    Heatmap usa chart-1…chart-6 em escala de intensidade calculada via runtime.

5.2 Command Palette

    Atalho global: Ctrl+K / Cmd+K (registrar via useHotkeys + listener Tauri pra capturar mesmo sem foco na webview se quiser).
    UI: bg-popover/90 backdrop-blur-md border-border rounded-xl. Posicionada centro-topo (não centro absoluto — usuário olha pro topo).
    Ações esperadas: navegação (/dashboard, /logbook, /settings), iniciar sessão WORK/STUDY, criar projeto/tag, alternar tema.

5.3 Mini-Player PiP

    Janela Tauri separada, alwaysOnTop: true, decorations: false, transparent: true.
    ~280×80px. Conteúdo: timer (mono, tabular), tipo de sessão (dot bg-work/bg-study), pause/stop.
    Drag region em todo o body exceto botões.

5.4 Mobile-first & Tiling WMs

    Tudo Tailwind mobile-first. Layout fluido com flex-1, min-w-0, truncate pra resistir a janelas estreitas (i3/Hyprland, VS Code lado a lado).
    Breakpoints práticos (Tauri pode ir pra 320px de largura):
        < sm (640px): single-column, listas viram carrosséis snap-x.
        sm–lg: 2 colunas, sidebar colapsada (TopNav + hamburger).
        ≥ lg (1024px): sidebar fixa, bento grid completo.
    Nada de min-w fixo em pixels nos cards. Use min-w-0 + flex-1.

6. Motion & Microinterações

    Padrão: transition-colors duration-150 em hover de superfícies; duration-200 ease-out em entradas; spring(stiffness: 400, damping: 30) em transformações táteis.
    Reduced motion: respeitar prefers-reduced-motion desabilitando staggerChildren e whileHover scale (manter cor/opacity).
    Loading: <Skeleton> com bg-muted + animação shimmer sutil. Nunca spinner solto sem container.
    Stateful timer: transição de cor entre estados (ACTIVE → PAUSED desatura o --work/--study levemente via opacidade, não via outra cor).

7. Acessibilidade

    Foco visível em tudo que é interativo (focus-visible:ring-2).
    aria-label em botões sem texto (icon-only).
    Hit target mínimo 40×40px desktop, 44×44px se a janela for usada em toque (Tauri tablet).
    Contraste validado (ver §2.3). Nunca confiar só em cor pra status — sempre cor + ícone + texto (ex.: badge WORK = laranja + ícone briefcase + label).
    Keyboard nav: Tab percorre em ordem visual; Esc fecha modais/palette; setas em listas de sessões/tags.

8. Estrutura de Pastas

/app/
  globals.css            -> ÚNICO lugar com vars de cor + @theme
  layout.tsx             -> aplica .light/.dark no <html>
  [locale]/              -> rotas com i18n
/components/
  ui/                    -> Primitivos (Button, Card, Input, Badge) com cn()
  dashboard/             -> Bento, Heatmap, StreakCard, Distribution
  logbook/               -> Calendar, Feed, DrillDown
  activity/              -> Timer, MiniPlayer, SessionControls
  command/               -> CommandPalette
/hooks/
  useSettings.ts
  useSessionTimer.ts
  useAsync.ts
  useHotkeys.ts
/lib/
  utils.ts               -> cn()
  format.ts              -> wrappers Intl (formatDate, formatDuration)
/services/
  sessions.ts            -> invokeTauri('start_session', …)
  projects.ts
  tags.ts
  goals.ts
  backup.ts
/types/
  db.ts                  -> Project, Session, Tag, WeeklyGoal, SessionStatus
  dto.ts
/src-tauri/              -> Backend Rust (rusqlite, commands)

9. Versionamento

A versão do app vive em 3 arquivos sincronizados — script pnpm version deve atualizar os três:
Arquivo  Campo
package.json  version
src-tauri/Cargo.toml  version
src-tauri/tauri.conf.json  version
10. Checklist de PR

Antes de abrir PR, garantir:

    Zero cor hardcoded (grep -rE '#[0-9a-f]{3,6}|rgb\(' components/ vazio)
    Zero string hardcoded em UI (passou por t())
    tabular-nums em todo número que muda no tempo
    focus-visible:ring-* em todo elemento interativo
    Tested em janela de 320px de largura (tiling-friendly)
    Light + Dark testados (toggle no DevTools)
    prefers-reduced-motion respeitado
    Versão sincronizada nos 3 arquivos (se for release)
