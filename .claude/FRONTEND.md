# Regras de Frontend (Next.js + Desktop)

## Estilo Visual

- **Flat estrito:** Bordas 1px, cores sólidas, `shadow-sm`, `--radius: 0rem`.
  Zero glow, glassmorphism ou cantos arredondados.
- **Cores semânticas:** Apenas classes Tailwind (`bg-background`,
  `text-foreground`, `border-border`). Proibido hardcoded hex/named colors.
- **Composição de classes:** Sempre via `cn()` (clsx + tailwind-merge).

## Arquitetura

- **`"use client"`** padrão nas telas interativas (app offline, sem servidor
  Node).
- **Imagens:** `<img />` nativo ou `<Image unoptimized />`. Sem otimização
  server-side.
- **DRY:** Verificar `tailwind.config.ts`, `globals.css` e `@/components/ui/`
  antes de criar.
- **Composição > Props:** Priorizar `<Card><CardHeader/></Card>` em vez de
  mega-props.

## Service Layer

- Toda busca de dados passa pelo service layer (`services/*.ts`), nunca direto
  no componente.
- Services usam `async/await` e encapsulam a chamada `invokeTauri()` com
  fallback para mocks em dev.
- Sempre tratar estados `isLoading` e `isError`.

## Responsividade

- **Desktop-first** mas com fluid layout (flex-1, min-w-0, aspect-square).
- Sem breakpoints bruscos — usar "Fluid Tensions" com max-w/min-w.
- Mobile: carrosséis horizontais (`flex overflow-x-auto snap-x`) para cards.
- Sidebar vira hambúrguer overlay em `< lg`.
