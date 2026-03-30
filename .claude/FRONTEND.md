# Regras de Frontend (Next.js + Desktop)

Diretrizes arquiteturais e visuais estritas para o desenvolvimento da interface
do FlowState.

## 1. Estilo Visual (Padrão Premium)

- **Profundidade por Iluminação:** Evite sombras pesadas (`drop-shadow`).
  Utilize bordas emissivas (`box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.05)`)
  em cards e fundos translúcidos (`backdrop-blur-md`) em modais/overlays para
  criar camadas.
- **Geometria Tátil:** Respeite rigorosamente a escala de `--radius` definida no
  `globals.css`. Proibido o uso de cantos secos (`--radius: 0rem`), a interface
  deve manter um aspecto fluído e moderno.
- **Cores Semânticas:** Use exclusivamente classes Tailwind atreladas às
  variáveis CSS (`bg-background`, `text-muted-foreground`, `border-border`).
  É estritamente proibido o uso de cores hexadecimais ou nomeadas
  (ex: `text-gray-500`) diretamente nos componentes.
- **Contraste e Tipografia:** Evite branco puro (`#ffffff`) em textos longos
  para reduzir a fadiga visual; use para destaques. Aplique `tracking-tight` em
  títulos (H1, H2) e garanta legibilidade.

## 2. Arquitetura e Componentes

- **Diretiva de Cliente:** Como o app roda empacotado no desktop (sem servidor
  Node para SSR contínuo), use `"use client"` como padrão em páginas e
  componentes interativos.
- **Imagens Estáticas:** Utilize a tag `<img />` nativa ou o componente do
  Next.js com a prop `unoptimized` (`<Image unoptimized />`). A otimização
  server-side padrão do Next.js quebrará no build estático do Tauri.
- **Composição > Props:** Priorize a composição de componentes (ex:
  `<Card><CardHeader/></Card>`) no padrão shadcn/Radix. Evite criar
  componentes monolíticos que recebem objetos gigantes de configuração via props.
- **Mesclagem de Classes:** Todo e qualquer componente que aceite customização
  de estilo deve utilizar a função utilitária `cn()` (clsx + tailwind-merge)
  para evitar conflitos de especificidade.

## 3. Animações e Interações (Framer Motion)

- **Feedback Tátil Universal:** Todos os elementos clicáveis essenciais devem
  herdar o componente base `<Button>`, que é um wrapper de `<motion.button>`
  com a animação padrão de `whileTap={{ scale: 0.98 }}`.
- **Timer Sem Oscilação:** Números que atualizam frequentemente (como o timer)
  devem usar a classe `tabular-nums`. Para animações de rolagem no eixo Y, islole
  cada dígito em um contêiner absoluto usando `<AnimatePresence mode="popLayout">`
  para evitar *layout shifts* na tela.
- **Transições de Layout:** Utilize a prop `layoutId` do Framer Motion para
  alternar estados visuais (como abas ou toggles) em vez de transições bruscas
  de cor ou posição.

## 4. Service Layer e Dados

- **Isolamento de API:** Toda busca ou mutação de dados deve passar
  obrigatoriamente pela camada de serviços (`services/*.ts`). É proibido invocar
  o backend ou o banco de dados diretamente dentro do componente UI.
- **Comunicação Tauri (IPC):** Os serviços devem encapsular as chamadas
  `invokeTauri()`, sempre providenciando um fallback para dados *mockados* no
  ambiente de desenvolvimento (`process.env.NODE_ENV === 'development'`).
- **Estados Obrigatórios:** Sempre trate e exiba adequadamente os estados de
  `isLoading` (com Skeletons compatíveis com o layout) e `isError`.

## 5. Responsividade (Mobile-First para Desktop)

- **Mentalidade CSS:** Escreva o código Tailwind assumindo a menor largura de
  janela possível (Mobile-first). Utilize os prefixos (`sm:`, `md:`, `lg:`) para
  expandir o layout.
- **Resiliência a Tiling:** A interface deve sobreviver em metades ou terços de
  tela (comum ao dividir espaço com editores de código). Use layouts fluidos
  (`flex-1`, `min-w-0`, `truncate`) para evitar vazamento de conteúdo e quebras
  horizontais.
- **Navegação Adaptativa:** A barra lateral (`Sidebar`) deve ser fixa em
  larguras `>= lg`. Abaixo disso, ela deve obrigatoriamente se converter em um
  menu overlay hambúrguer (`TopNav`).
- **Otimização de Espaço Apertado:** Em larguras mínimas de janela, converta
  listas em grade (como projetos e metas) para carrosséis horizontais
  (`flex overflow-x-auto snap-x`) para preservar o espaço vertical do timer.
