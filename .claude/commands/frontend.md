# Frontend Rules (Next.js SSG + React + Tailwind v4)

Diretrizes arquiteturais e visuais para a interface do FlowState.

## 1. Regras Arquiteturais & Service Layer

- **`"use client"`:** Obrigatório em todas as páginas/componentes (no SSR/SSG
  desktop). Next.js com `output: 'export'`.
- **Imagens:** Use `<img />` nativo ou `<Image unoptimized />`.
- **Composição:** Siga padrão shadcn (composição > props monolíticas).
- **Isolamento de API:** A UI nunca chama `invoke()` direto. Use a camada
  `services/*.ts` que encapsula `invokeTauri()`.
- **Dev Mode Fallback:** Em dev (browser), `invokeTauri` retorna `null` e os
  serviços usam mocks de `mocks/`.

Exemplo de Service:

```ts
export async function getProjects(): Promise<Project[]> {
  const result = await invokeTauri<Project[]>('get_projects');
  return result ?? mockProjects;
}
```

## 2. Design Visual & Cores (Zero Hardcode)

- **Profundidade:** Evite sombras pesadas. Use bordas emissivas inset
  (`box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.05)`) e `backdrop-blur-md`
  para modais.
- **Geometria:** Use estritamente a escala de `--radius` do `globals.css`.
- **Cores Semânticas:** Use apenas classes atreladas a variáveis CSS
  (`bg-background`, `text-muted-foreground`, `border-border`).
- **Contraste:** Sem `#ffffff` puro para textos longos (evitar fadiga visual).

### Uso de Tokens

- **base** (`--work`, `--study`): bordas, ícones, dots indicadores.
- **solid** (`--success-solid`): botões com texto branco (garantia AA).
- **muted** (`--work-muted` + `--work-muted-foreground`): chips/badges
  passivos (parear ambos).

## 3. Animações (Framer Motion)

- **Feedback Tátil:** Elementos clicáveis usam `<Button>` (wrapper de
  `motion.button` com `whileTap={{ scale: 0.98 }}`).
- **Timer Sem Oscilação:** Use `tabular-nums`. Isole dígitos em contêineres com
  `<AnimatePresence mode="popLayout">` para evitar layout shifts.
- **Transições:** Use `layoutId` para alternar estados visuais suavemente.
- **Cascata:** Stagger transitions para listas com delay e stagger.
- **Acessibilidade:** Desabilite stagger e scale hover se
  `prefers-reduced-motion` estiver ativo.

```tsx
<AnimatePresence mode="popLayout">
  <motion.span key={digit} className="font-mono tabular-nums">
    {digit}
  </motion.span>
</AnimatePresence>
```

## 4. Responsividade & Responsabilidade da UI

- **Grid/Flex Fluido:** Nunca use `min-w` fixo nos cards. Use `min-w-0 flex-1`.
- **Tiling (Layout Adaptativo):** Listas viram carrosséis com
  `flex overflow-x-auto snap-x` em telas muito estreitas.
- **Sidebar Adaptativa:** Fixa em `>= lg`. Em telas menores, recolhe para menu
  hambúrguer overlay (`TopNav`).
- **Estados Obrigatórios:** Trate `isLoading` (Skeletons) e `error` de forma
  explícita. Nunca deixe a tela vazia.

## 5. Tipografia & Acessibilidade

- **Fontes:** Geist Sans (UI) + Geist Mono (números, caminhos, IDs).
- **Escala & Tracking:** `tracking-tight` em H1/H2. `text-sm` como padrão.
- **Foco:** `focus-visible:ring-2 focus-visible:ring-ring` em interativos.
- **Hit Targets:** Mínimo 40x40px. Use `aria-label` em botões apenas com
  ícones.
- **Status:** Transmitidos por cor + ícone + texto (nunca apenas cor).
- **Teclado:** `Tab` em ordem visual; `Esc` fecha modais e palettes.
