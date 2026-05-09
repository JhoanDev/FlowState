# FlowState — Logo Pack

Logos oficiais em SVG vetorial, alinhados ao design system v2.1.

## Arquivos

- `flowstate-mark-light.svg` — Mark padrão para uso em fundos claros (light theme)
- `flowstate-mark-dark.svg` — Mark padrão para uso em fundos escuros (dark theme)
- `flowstate-mark-mono.svg` — Mark monocromático (1 cor) — favicon, embeds, print
- `flowstate-mark-on-primary.svg` — Mark para uso em fundo --primary (violet)
- `flowstate-mark-state-work.svg` — Mark com sessão WORK ativa (barra do meio em laranja)
- `flowstate-mark-state-study.svg` — Mark com sessão STUDY ativa (barra do meio em azul)
- `flowstate-mark-state-paused.svg` — Mark em estado PAUSED (50% opacity)
- `flowstate-lockup-light.svg` — Lockup completo (mark + wordmark "FlowState") para light theme
- `flowstate-lockup-dark.svg` — Lockup completo (mark + wordmark) para dark theme

## Paleta usada (tokens do globals.css)

| Token         | Light     | Dark      |
| ------------- | --------- | --------- |
| --foreground  | #18181b   | #f4f4f6   |
| --background  | #f6f6f8   | #0a0a0d   |
| --primary     | #7c3aed   | #8b5cf6   |
| --work        | #c2410c   | #ea580c   |
| --study       | #1d4ed8   | #2563eb   |

## Uso no Tauri

Para gerar os ícones do app (`32x32.png`, `128x128.png`, `icon.icns`,
`icon.ico`), rode:

```bash
# tauri-cli (v2)
tauri icon flowstate-mark-light.svg
```

Isso gera todos os tamanhos em `src-tauri/icons/` automaticamente.

## Uso no React

```tsx
import LogoLight from '@/assets/flowstate-mark-light.svg';
import LogoDark from '@/assets/flowstate-mark-dark.svg';

<img src={LogoLight} alt="FlowState" className="dark:hidden w-8 h-8" />
<img src={LogoDark} alt="FlowState" className="hidden dark:block w-8 h-8" />
```

Para o mark monocromático (`flowstate-mark-mono.svg`), use `currentColor`:

```tsx
<span className="text-foreground">
  <FlowStateMonoSVG />
</span>
```
