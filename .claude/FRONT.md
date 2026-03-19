
#### 5. Regras de Frontend (Next.js + Desktop Offline)

* **5.1 DRY Obrigatório:** Antes de codar, verifique `tailwind.config.ts`, `globals.css` e `@/components/ui/`. Reutilize sempre, nunca recrie ou duplique tokens.
* **5.2 Visual Desktop (Flat Estrito):** Foco em densidade de informação. Bordas de 1px (`border`), cores sólidas, sombras funcionais (`shadow-sm`), cantos vivamente retos (`--radius: 0rem` global em CSS). **Zero efeitos custosos e zero cantos arredondados** (sem glow ou glassmorphism).
* **5.3 Sistema de Cores (Tailwind):** Uso exclusivo de classes semânticas nativas (`bg-background`, `text-foreground`, `border-border`, `bg-primary`). **Proibido** cores hardcoded (ex: `#fff`, `gray-500`).
* **5.4 Arquitetura Local (Static Export):** Sendo um app offline, `"use client"` será padrão nas telas interativas. Evite lógicas que dependam de servidor Node.js.
* **5.5 Assets e Imagens (⚠️ CRÍTICO):** Sem servidor para otimização, use a tag HTML nativa `<img />` ou o componente do Next com a prop `<Image unoptimized />`. Assets empacotados localmente.
* **5.6 Layout Desktop-First:** Esqueça mobile. Foco em telas grandes, grids estruturados, flexbox para painéis e suporte a atalhos de teclado. 
* **5.7 Composição de Classes:** Uso exclusivo do utilitário `cn()` (clsx + tailwind-merge) para estilos dinâmicos ou sobreposições.
* **5.8 Componentes (Composição > Props):** Priorize composição (`<Card><CardHeader/></Card>`) em vez de passar dezenas de props. Isole estados locais em subcomponentes para evitar re-render da tela toda.

#### 6. Integração e Dados (Preparação Plug & Play Tauri)

* **6.1 Desenvolvimento 100% Mockado:** App 100% navegável usando dados falsos. Zero chamadas reais de API nesta fase.
* **6.2 Isolamento Estrito (Service Layer):** NUNCA declare dados mockados ou lógicas de busca dentro do componente visual (UI). Todo acesso a dados passa por funções isoladas (ex: `src/services/items.ts`).
* **6.3 Assincronicidade (Simulação IPC):** Toda função de serviço deve usar `async/await` e incluir um delay simulado (ex: `await new Promise(r => setTimeout(r, 300))`) para imitar a ponte de comunicação do Tauri.
* **6.4 Contratos de Tipagem Rigorosa:** Crie `interfaces`/`types` exatos espelhando as futuras structs do Rust. O mock deve respeitar esse formato à risca.
* **6.5 Troca Indolor (Tauri Ready):** O componente visual apenas chama a função de serviço. No futuro, apenas a implementação do serviço mudará (trocando o mock pelo `invoke('comando')` do Tauri), mantendo a UI intocada.
* **6.6 Estados de Loading/Error:** Como os mocks simulam promessas, o frontend é obrigado a tratar e renderizar estados de carregamento (`isLoading`) e falhas (`isError`) desde o dia zero.

**Exemplo Base de Serviço:**
```typescript
// src/services/users.ts
import { User } from '@/types';
import { mockUsers } from '@/mocks/users';

export async function getUsers(): Promise<User[]> {
  // Futuro: return await invoke('get_users');
  await new Promise(res => setTimeout(res, 300));
  return mockUsers;
}
```