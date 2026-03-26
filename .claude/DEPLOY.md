# Regras de Deploy (CI/CD + Release)

## Runner

- Todas as builds Linux **devem rodar em Ubuntu 22.04** (`ubuntu-22.04`) para garantir compatibilidade com distribuições baseadas em Ubuntu 22+.
- macOS e Windows usam os runners padrão mais recentes.

## Versionamento

Antes de qualquer release, a versão deve ser atualizada nos **3 arquivos** simultaneamente:

| Arquivo                     | Campo     | Exemplo     |
|-----------------------------|-----------|-------------|
| `package.json`              | `version` | `"1.2.0"`   |
| `src-tauri/Cargo.toml`      | `version` | `"1.2.0"`   |
| `src-tauri/tauri.conf.json` | `version` | `"1.2.0"`   |

Seguir **SemVer** (`MAJOR.MINOR.PATCH`):
- `PATCH` — bugfixes, ajustes visuais
- `MINOR` — novas features, melhorias
- `MAJOR` — breaking changes no schema do banco ou na estrutura de dados

## Build

### Dependências do sistema (Ubuntu 22.04)

```bash
sudo apt-get update && sudo apt-get install -y \
  libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev \
  patchelf libgtk-3-dev libsoup-3.0-dev libjavascriptcoregtk-4.1-dev
```

### Sequência de build

```bash
npm ci                    # instalar dependências JS
npm run build             # gerar static export (Next.js → /out)
cd src-tauri && cargo build --release   # compilar binário Rust
npx tauri build           # empacotar (.deb, .AppImage, etc.)
```

## Artefatos

| Plataforma | Formato              | Path relativo                              |
|------------|----------------------|--------------------------------------------|
| Linux      | `.deb`, `.AppImage`  | `src-tauri/target/release/bundle/`         |
| macOS      | `.dmg`, `.app`       | `src-tauri/target/release/bundle/macos/`   |
| Windows    | `.msi`, `.exe`       | `src-tauri/target/release/bundle/nsis/`    |

## Checklist Pré-Release

1. Versão atualizada nos 3 arquivos
2. `cargo check` sem erros
3. `npm run build` sem erros
4. Testar import/export de banco entre versões
5. Tag git criada: `git tag v{version}`
