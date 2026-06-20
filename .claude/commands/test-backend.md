# Backend Testing — Rust + SQLite (in-memory)

Diretrizes para escrever e rodar testes unitários no backend Rust do FlowState.
Testes apenas no Rust. Sem testes frontend.

## Como rodar

```bash
# Da raiz do projeto
rtk cargo test --manifest-path src-tauri/Cargo.toml

# Filtrar por módulo/função
rtk cargo test --manifest-path src-tauri/Cargo.toml sessions::tests
```

## Padrão obrigatório: Inner Function

`#[tauri::command]` recebe `State<'_, DbPool>` — não é instanciável em testes.
**A regra:** extraia a lógica em funções privadas que recebem `&Connection`.
O command é só um wrapper fino que faz lock e delega.

```rust
// Função interna — testável diretamente
fn insert_session(conn: &Connection, input: SaveSessionInput) -> Result<Session, String> {
    conn.execute(INSERT_SQL, params![...])?;
    let id = conn.last_insert_rowid();
    // ...retorna Session
}

// Command — wrapper fino, não testado diretamente
#[tauri::command]
pub fn save_session(db: State<'_, DbPool>, session: SaveSessionInput) -> Result<Session, String> {
    let conn = db.0.lock().map_err(|e| format!("Lock error: {e}"))?;
    insert_session(&conn, session)
}
```

## Helper de setup (copie em cada arquivo de testes)

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::Connection;
    use crate::database::migrations;

    fn setup() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("PRAGMA foreign_keys=ON;").unwrap();
        conn.execute_batch(migrations::CREATE_TABLES).unwrap();
        conn
    }
```

## O que testar

| Prioridade | O que | Exemplo |
| :--- | :--- | :--- |
| Alta | CRUD básico | insert retorna entidade com ID correto |
| Alta | FK / integridade | deletar projeto não quebra sessão (SET NULL) |
| Alta | Constraints do schema | `status` inválido retorna `Err` |
| Média | Valores de borda | `duration_seconds = 0`, `rating = NULL` |
| Baixa | Migrations | `CREATE_TABLES` é idempotente (roda 2x sem erro) |

## O que NÃO testar

- `#[tauri::command]` diretamente (precisa de Tauri runtime)
- Lógica de UI / frontend
- Funções que só fazem `lock()` e delegam

## Exemplo completo (sessions.rs)

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::Connection;
    use crate::database::migrations;
    use crate::models::session::SaveSessionInput;

    fn setup() -> Connection {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("PRAGMA foreign_keys=ON;").unwrap();
        conn.execute_batch(migrations::CREATE_TABLES).unwrap();
        conn
    }

    fn default_input() -> SaveSessionInput {
        SaveSessionInput {
            session_type: "WORK".into(),
            project_id: None,
            timer_mode: "PROGRESSIVE".into(),
            status: "COMPLETED".into(),
            planned_duration_seconds: Some(1500),
            duration_seconds: 1500,
            started_at: "2024-01-01T10:00:00".into(),
            finished_at: Some("2024-01-01T10:25:00".into()),
            rating: None,
            notes: "".into(),
        }
    }

    #[test]
    fn insert_session_returns_entity_with_id() {
        let conn = setup();
        let result = insert_session(&conn, default_input());
        assert!(result.is_ok());
        let session = result.unwrap();
        assert!(session.id > 0);
        assert_eq!(session.session_type, "WORK");
        assert_eq!(session.duration_seconds, 1500);
    }

    #[test]
    fn invalid_status_fails() {
        let conn = setup();
        let mut input = default_input();
        input.status = "INVALID".into();
        assert!(insert_session(&conn, input).is_err());
    }

    #[test]
    fn migrations_are_idempotent() {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch("PRAGMA foreign_keys=ON;").unwrap();
        // Roda duas vezes — não deve retornar erro
        conn.execute_batch(migrations::CREATE_TABLES).unwrap();
        conn.execute_batch(migrations::CREATE_TABLES).unwrap();
    }
}
```

## Checklist ao adicionar um command novo

1. Extraia a lógica em `fn <nome>_inner(conn: &Connection, ...) -> Result<T, String>`
2. Command chama `<nome>_inner` após lock
3. Adicione `#[cfg(test)] mod tests { ... }` no mesmo arquivo
4. Cubra: caminho feliz, constraint inválida, FK se relevante
5. Rode `rtk cargo test --manifest-path src-tauri/Cargo.toml` antes de commitar
