# FlowState Design System v2

## 1. Stack & Arquitetura

- **Core:** Next.js App Router, Tauri (Desktop), Tailwind v4, Framer Motion,
  Lucide-react, next-intl (ou similar).
- **RSC & Client:** Componentes interativos usam `"use client"`. Buscas
  assíncronas priorizam Server Components com `<Suspense fallback={<Skeleton/>}>`
  para streaming.
- **Services (`/services`):** Encapsulam IPC (`invokeTauri`) + mocks de dev.
  UI nunca chama DB direto.
- **Assets:** Sempre `<img />` nativo ou `<Image unoptimized />`
  (compatibilidade Tauri).

## 2. Design Tokens & Temas (globals.css)

- **Modos Light/Dark:** Troca via classe `.dark`/`.light` no `<html>`. Proibido
  cores hardcoded (ex: `#fff` ou `text-gray-500`). Use apenas vars CSS
  mapeadas (`bg-background`, `text-foreground`).
- **Contraste/Fadiga:** Evitar `#000` puro no light e `#fff` puro no dark.
  Usar cinzas/brancos off-white (ex: `#ededed`).
- **Profundidade (Estilo Premium):** Sem `drop-shadow` denso. Usar
  `backdrop-blur-md` (overlays) e bordas emissivas
  (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.05)` no dark).
- **Tipografia:** Fonte *Geist/Geist Mono*. `tracking-tight` em H1/H2.
  `tabular-nums` obrigatório em contadores.

## 3. i18n & Localização

- **Zero Hardcode:** Proibido strings fixas na UI (ex: usar `{t('btn.save')}`).
- **Locale-Aware:** Datas, horas (12h/24h) e números formatados via API
  nativa `Intl` respeitando a config do usuário.

## 4. Componentes Base (UI Primitives)

- **Button:** Herda `<motion.button>`. Padrão tátil universal:
  `whileTap={{ scale: 0.98 }}`, `whileHover={{ scale: 1.01 }}`.
- **Timer (Activity):** Uso de `tabular-nums`. Eixo Y isolado por dígito via
  `<AnimatePresence mode="popLayout">` para evitar *layout shifts*.
- **Composição:** Usar subcomponentes (`<Card><CardHeader/></Card>`) no
  padrão shadcn. Classes mescladas sempre via `cn()` (clsx + tailwind-merge).

## 5. Layout, Features & Responsividade

- **Dashboard:** Padrão **Bento Grid** (CSS Grid assimétrico). Heatmap
  ocupando 2 colunas, gráficos menores em 1 coluna. Entrada em cascata
  (`staggerChildren`).
- **Command Palette:** Atalho global (Ctrl+K / Cmd+K) para navegação/ações
  rápidas sem mouse.
- **Mobile-first para Tiling:** Código Tailwind mobile-first. Layout fluido
  (`flex-1`, `min-w-0`, `truncate`) para resistir a janelas estreitas (tiling
  WMs/VS Code lado a lado).
- **Adaptação:** `>= lg` = Sidebar fixa. `< lg` = Hamburger (TopNav).
  Listas viram carrosséis horizontais (`snap-x`) em janelas mínimas.

## 6. Estrutura de Pastas (Resumo)

```text
/app/               -> Pages, Layouts, CSS global, i18n configs
/components/ui/     -> Primitivos (Button, Card, Input) - todos cn()
/components/X/      -> Features (dashboard, logbook, activity)
/hooks/             -> useSettings, useSessionTimer, useAsync
/lib/utils.ts       -> cn()
/services/          -> Tauri IPC wrappers
/types/             -> Entidades do banco e DTOs
/src-tauri/         -> Backend Rust
```
