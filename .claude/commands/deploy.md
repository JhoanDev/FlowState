# Deploy & Release Rules

Diretrizes para versionamento, build de produção e deploy do FlowState.

## 1. Regra Geral

**Nunca execute builds.** Apenas o desenvolvedor roda manualmente. Não execute
`npm run build`, `npm run tauri build` ou `cargo build --release`.

## 2. Versionamento (3 Arquivos em Sync)

Toda alteração de versão deve atualizar os 3 arquivos simultaneamente:

- `package.json` → `version`
- `src-tauri/Cargo.toml` → `version`
- `src-tauri/tauri.conf.json` → `version`

**SemVer:**

- `PATCH`: bugfixes e pequenos ajustes visuais.
- `MINOR`: novas features e melhorias.
- `MAJOR`: quebras de compatibilidade no DB/schema ou estrutura.

## 3. GitHub Pages (Web Preview)

- O deploy do preview web é hospedado no **GitHub Pages**.
- Como roda puramente no navegador (sem Tauri), o backend retorna `null` e o
  frontend carrega **obrigatoriamente os dados mockados** (`mocks/`).
- Build web: execute `npm run build` e faça o deploy da pasta `/out`.

## 4. Dependências do Sistema & Build (Referência)

Ubuntu 22.04 / Pop!_OS:

```bash
sudo apt-get update && sudo apt-get install -y \
  libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev \
  patchelf libgtk-3-dev libsoup-3.0-dev libjavascriptcoregtk-4.1-dev
```

Comandos de Build:

```bash
npm ci                                    # Dependências JS
npm run build                             # Static export (Next.js -> /out)
cd src-tauri && cargo build --release     # Compila Rust
npx tauri build                           # Empacota desktop (.deb, .AppImage)
```

## 5. Artefatos de Build

| Plataforma | Formato | Path Relativo |
| :--- | :--- | :--- |
| Linux | `.deb`, `.AppImage` | `src-tauri/target/release/bundle/` |
| macOS | `.dmg`, `.app` | `src-tauri/target/release/bundle/macos/` |
| Windows | `.msi`, `.exe` | `src-tauri/target/release/bundle/nsis/` |

## 6. Checklist Pré-Release

1. Versão atualizada nos 3 arquivos
2. `cargo check` e `npx tsc --noEmit` sem erros
3. `npm run lint` sem erros
4. Testar migração e import/export do banco
5. Tag git criada: `git tag v{version}`

## 7. Ícones & CI

- **Geração de Ícones:** `tauri icon public/flowstate-mark-light.svg`
- **CI Runners:** Linux deve rodar obrigatoriamente no `ubuntu-22.04`
  (compatibilidade). macOS/Windows usam runners mais recentes.
