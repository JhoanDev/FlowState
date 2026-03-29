# Regras de Backend (Tauri v2 + Rust + SQLite)

## Arquitetura

- **Modular:** Código dividido em `commands/`, `database/`, `models/`, `state/`.
  O `main.rs` só inicializa plugins e registra comandos.
- **Estado:** Dados globais via `tauri::State` encapsulados em `Mutex`.
- **Async:** Comandos pesados (export/import, relatórios) devem ser `async fn`.

## Regras Invioláveis

1. **Zero Panics:** Nunca `.unwrap()` ou `.expect()` em `#[tauri::command]`.
   Sempre `Result<T, String>`.
2. **Serde camelCase:** Toda struct IPC usa
   `#[serde(rename_all = "camelCase")]`. Rust fica snake_case, frontend recebe
   camelCase.
3. **SQL Parametrizado:** Sempre queries parametrizadas. Zero concatenação de
   strings para SQL.
4. **Capabilities v2:** Todo novo comando precisa de permissão explícita em
   `src-tauri/capabilities/`.
5. **Migrations:** Schema gerenciado pelo sistema de migrations na
   inicialização.
