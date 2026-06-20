# FlowState Design System

Fonte de verdade visual e arquitetural da interface do FlowState.

## 1. Princípios & Stack

- **Estilo:** Profundidade via contraste de surfaces (`bg-card` vs
  `bg-background`) e bordas emissivas inset.
  Sem sombras pesadas (`shadow-sm` no máximo).
- **Stack:** Next.js App Router (`output: 'export'`), Tailwind v4, Tauri v2,
  Framer Motion, Lucide-react, i18next + react-i18next.
- **RSC & Client:** `"use client"` em interativos. Buscas async priorizam
  `<Suspense fallback={<Skeleton />}>`.
- **Assets:** Tag `<img />` ou `<Image unoptimized />` (compatibilidade Tauri).

## 2. Cores & Tokens (`globals.css`)

**Zero cor hardcoded** no JSX. Use apenas utilities Tailwind vinculadas às vars:

```tsx
// ✅ correto
<button className="bg-primary text-primary-foreground" />
<Badge className="bg-work-muted text-work-muted-foreground" />

// ❌ proibido
<button className="bg-violet-600 text-white" />
<p className="text-gray-500" />
```

### Classes & Tons

- **base** (`--work`, `--study`): bordas, ícones, dot indicators. Sem fill.
- **solid** (`--success-solid`): fill de botão com texto branco (WCAG AA).
- **muted** (`--work-muted` + `--work-muted-foreground`): chips/badges
  passivos. Sempre parear ambos.

*Evite branco/preto puros* para reduzir fadiga visual. Foco visível sempre
via `focus-visible:ring-2`.

## 3. Tipografia, Spacing & Radius

- **Fontes:** Geist Sans (UI geral) + Geist Mono (tabular-nums, IDs, paths).
- **Tabular-nums:** Obrigatório em timer, contadores, durations e metas.
- **Headings:** `tracking-tight` em H1/H2 e `font-semibold` (não bold puro).
- **Radius:** `rounded-sm` (4px, badges), `rounded-md` (6px, botões),
  `rounded-lg` (10px, cards), `rounded-xl` (14px, modais/app icon symbol).
- **Spacing:** Base 4px. Espaço de seção: `gap-6` ou `gap-8`.

## 4. Componentes Especiais & Estrutura

- **Timer:** Digitos animados individualmente via
  `<AnimatePresence mode="popLayout">` para evitar layout shifts.
- **Bento Grid (Dashboard):** Mobile-first, colunas em grid assimétrico:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
  <Heatmap className="lg:col-span-2 lg:row-span-2" />
  <StreakCard className="lg:col-span-1" />
  <Distribution className="lg:col-span-2" />
</div>
```

- **Command Palette:** Ctrl+K / Cmd+K. Posicionado no centro-topo.
- **Mini-Player PiP:** Janela separada (`alwaysOnTop: true, decorations: false,
  transparent: true`), `~280×80px`, drag region em todo o body (exceto botões).
- **i18n:** Zero strings hardcoded. Use `t('chave')`. Plurais via
  `Intl.PluralRules` ou ICU MessageFormat (nunca ternários manuais).

## 5. Motion, Microinterações & Acessibilidade

- **Transições:** `transition-colors duration-150` em hover; spring para
  transformações táteis; `layoutId` para alternar estados.
- **Timer inativo:** Desaturar via opacity (não mudar a cor original).
- **Acessibilidade:**
  - Desabilite stagger e scale hover se `prefers-reduced-motion` ativo.
  - Hit targets mínimos de 40x40px desktop.
  - Status via cor + ícone + texto (nunca apenas cor).
  - Keyboard: `Tab` em ordem visual; `Esc` fecha modais/palette.

## 6. Estrutura de Pastas

```text
/app/                  # globals.css, layout, rotas i18n
/components/           # ui/ (primitivos), dashboard/, logbook/, activity/
/hooks/                # useSettings, useSessionTimer, useHotkeys
/lib/                  # utils (cn), format (wrapper Intl)
/services/             # Chamadas invokeTauri + mock fallbacks
/types/                # db.ts, dto.ts
```

## 7. Checklist de PR

- [ ] Zero cor hardcoded.
- [ ] Zero string hardcoded em UI (traduzidas via `t()`).
- [ ] `tabular-nums` em timers e contadores.
- [ ] `focus-visible:ring-*` em todo elemento interativo.
- [ ] Testado em 320px de largura (tiling-friendly).
- [ ] Versão sincronizada nos 3 arquivos (`package.json`, Cargo, tauri.conf)
      se for release.
