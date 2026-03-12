---
trigger: model_decision
description: Sempre que for algo do front end use essa regra
---

## 5. Diretrizes de UI/UX e Arquitetura Front-end (Next.js)

### 5.1. Design Visual (Flat Design & Dark Mode)

* **Estética Core:** Foco absoluto em **Dark Mode**. Fundo predominantemente **Preto** com acentos, destaques e interações principais em **Roxo**.
* **Estilo:** Design moderno, limpo e chapado (*Flat Design*).
* **Proibições:** Zero uso de sombras pesadas (`shadow-2xl`, drop shadows densos) ou gradientes exagerados.
* **Bordas e Contraste:** Uso de bordas sutis (ex: `border-neutral-800`), cores sólidas e alto contraste para legibilidade em longas jornadas de uso.
* **Hierarquia:** Interface rigorosamente clara, com excelente separação de respiro (whitespace) entre as seções.

### 5.2. Arquitetura de CSS e Tailwind (DRY no Next.js)

* **Sistema de Cores:** Uso ESTRITO das variáveis CSS definidas no arquivo `app/globals.css` (ex: `bg-background`, `text-primary`). Não usar cores arbitrárias diretamente nas classes (ex: `bg-[#121212]`).
* **Verificação Prévia:** Antes de criar novos estilos, ler o `globals.css` e a pasta `utils/` (como `cn.ts` ou `design-tokens.ts`).
* **Fusão de Classes:** Uso obrigatório da função utilitária `cn()` (combinação de `clsx` e `tailwind-merge`) para compor classes e lidar com condicionalidades dinâmicas sem conflitos no Tailwind.
* **Reutilização e Design System:** Priorizar padrões existentes. Se um padrão visual (como um formato específico de Card ou Botão) se repetir, ele deve ser extraído para um Componente React ou ter sua classe base consolidada no `globals.css`. Evitar duplicação.

### 5.3. Estrutura de Layout e Scroll Seguro (Desktop App)

* **Window Layout:** Sendo um app desktop, evitar páginas infinitas. A casca do app deve ocupar `h-screen` e `w-screen`, com `overflow-hidden` no `<body>`.
* **Scroll Interno:** Quando listas ou logs de anotações crescerem, usar **scroll interno estrito nas seções** afetadas (aplicando `overflow-y-auto`, `flex-1` ou alturas controladas no container específico), mantendo a barra lateral e o cabeçalho sempre visíveis e imóveis.
* **Segurança de Quebra (Layout Shift):**
* Evitar quebra de layout usando classes de proteção: `min-w-0`, `truncate` (para nomes longos de projetos ou tags) e `overflow-hidden`.
* Conteúdos dinâmicos longos nunca devem expandir e quebrar a largura de seus containers pais.



### 5.4. Componentização e Performance no Next.js

* **Separação de Lógica vs. UI:** Componentes visuais (Dumb Components) devem focar apenas na renderização. A lógica complexa e chamadas de banco (SQLite) ficam isoladas em Hooks ou funções utilitárias.
* **Server vs. Client Components:** Tirar proveito da App Router do Next.js. Cascas de layout, barras de navegação estáticas e elementos sem interatividade complexa devem ser padrão. Usar a diretiva `"use client"` estritamente onde houver estado (`useState`), efeitos (`useEffect`) ou interações do usuário (cronômetro, cliques, modals).
* **Prop Drilling:** Evitar passagem excessiva de propriedades em múltiplos níveis. Priorizar o padrão de composição do React usando `children`.
* **Performance do Cronômetro:** O estado de contagem do cronômetro (que atualiza a cada segundo) deve ficar o mais isolado possível na árvore de componentes para evitar que a tela inteira sofra *re-render* a cada segundo.
* **Consistência do Sistema:** Manter consistência absoluta em espaçamentos (`gap`, `p`, `m`), *cards*, *headers*, tabelas e botões. Sempre prover *estados de vazio* (Empty States) amigáveis e estruturados quando não houver dados no banco, e estados de *loading* se uma query for pesada.
