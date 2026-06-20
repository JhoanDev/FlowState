# CLAUDE.md

Guidance for AI assistant in this repository.

## Regra Geral

**Nunca execute builds.** Não rode `npm run build`, `npm run tauri build`,
`cargo build --release`, nem `npx tauri build`. Apenas execute manualmente.

## Commands

```bash
# Frontend dev (mock data, no Tauri)
npm run dev

# Desktop app dev (Tauri + Next.js hot-reload)
npm run tauri dev

# Type check & lint
npx tsc --noEmit
npm run lint

# Builds (Dev use only)
npm run build
npm run tauri build
cd src-tauri && cargo check
```

## Architecture

Local-first desktop app: Tauri v2 (Rust backend) + Next.js (static export).
No server or cloud. Data resides in a single SQLite file.

```text
UI → services/*.ts → invokeTauri() → #[tauri::command] (Rust) → SQLite
```

- **Invariant:** UI never calls `invoke()` directly. Calls go through
  `services/tauri.ts → invokeTauri<T>()`.
- **Browser dev mode:** `invokeTauri` returns `null`; services fallback to
  `mocks/`. UI runs completely in browser without Tauri.
- **Next.js:** Configured with `output: 'export'`. Never use server-side
  features or Next.js image optimization (breaks static build).

## Frontend Rules

- **Use `"use client"`** on all pages/components (no SSR).
- **Semantic colors:** No hex/Tailwind colors. Use CSS variable classes
  (e.g., `bg-background`, `text-muted-foreground`, `border-border`).
- **Use `cn()`** (clsx + tailwind-merge) for all className merging.
- **Animations:** Clickable components use `<Button>` (`motion.button` wrapper
  with tap scale). Timers use `tabular-nums` and `<AnimatePresence>` per digit.
- **Mandatory states:** Handle loading (Skeleton) and errors explicitly.
- **Images:** Use native `<img />` or `<Image unoptimized />`.

## Backend Rules (Rust)

Commands in `src-tauri/src/commands/` (one file per domain).
`lib.rs` registers plugins, initializes DB via `setup()`, defines commands in
`generate_handler![]`. `main.rs` only calls `app_lib::run()`.

**Inviolable rules:**

1. **No panics:** commands return `Result<T, String>`. Never use `.unwrap()`
   or `.expect()`.
2. **IPC Structs:** `#[serde(rename_all = "camelCase")]` on all shared structs.
3. **Database:** SQL must use parameterized inputs (`rusqlite::params![]`).
4. **DB access:** Use `DbPool` (`Mutex<Connection>`). Lock with `.lock()`,
   propagate errors, release ASAP.

**Naming:**

- Output (to UI): `Serialize` + `rename_all = "camelCase"`.
- Input (from UI): `Deserialize` + `Input` suffix (e.g., `SaveSessionInput`).
- Relations/Refs: `*Ref` suffix (e.g., `SessionProjectRef`).

**Command Checklist:**

1. Struct in `models/domain.rs`
2. Fn in `commands/domain.rs` -> `Result<T, String>`
3. Register in `lib.rs`
4. Add method in `services/domain.ts` using `invokeTauri`
5. If new plugin: add cap in `src-tauri/capabilities/default.json`
6. Schema change: add migration to `migrations.rs`

## Database Schema

Managed via idempotent migrations.

```text
projects ──────< sessions >────── session_tags >────── tags
                                       │
weekly_goals                      settings (key-value)
```

- `sessions.status`: `ACTIVE → PAUSED → ACTIVE → COMPLETED / CANCELLED`
- `sessions.type`: `WORK` or `STUDY`
- Booleans: stored as `INTEGER` `0`/`1`. Convert on read.
- PRAGMAs: WAL mode and foreign keys enabled on open.

## Slash Commands

Use estes comandos para carregar contexto detalhado antes de trabalhar:

| Comando | Quando usar |
| :--- | :--- |
| `/context` | Ponto de partida para visão geral do produto e locais críticos. |
| `/frontend` | Trabalhar em `app/`, `components/`, `hooks/`, `services/`. |
| `/design` | Criar ou revisar UI, tokens de cores, tipografia e acessibilidade. |
| `/backend` | Trabalhar em `src-tauri/src/` — commands Rust, models, DbPool. |
| `/database` | Alterar schema, migrations e entender mapeamento TS↔SQLite. |
| `/deploy` | Bumpar versão, preparar release e sequência de build. |

Após mudanças significativas, atualize o skill correspondente somente se o
conteúdo ficou desatualizado (ex: novo command IPC, coluna no schema, novas
regras visuais ou padrão Rust). Não atualize por mudanças pontuais de código.

## Versioning & i18n

- **Version bump:** sync `package.json`, `src-tauri/Cargo.toml`, and
  `src-tauri/tauri.conf.json`. Follows SemVer.
- **i18n:** Locales in `locales/en.ts`, `locales/pt-BR.ts`. Setup in
  `lib/i18n.ts` and `providers/i18n-provider.tsx`. Do not hardcode strings.
