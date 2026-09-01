# Arquitetura executável do MVP

```mermaid
flowchart TD
  U[Usuário autenticado] --> UI[Dashboard React]
  UI --> API[Rotas API]
  API --> RL[Rate limit D1]
  API --> DB[(D1)]
  API --> R2[(R2: evidências)]
  API --> BCB[Banco Central]
  API --> NEWS[B3 e CVM]
  DB --> AUDIT[Auditoria]
```

## Fonte da verdade atual

- arquivo original: R2, retenção operacional de 90 dias;
- lote e hash: `import_batches`;
- posição normalizada: `positions`;
- snapshot: `portfolio_snapshots`;
- câmbio: `fx_rates` e referência gravada no lote;
- ações sensíveis: `audit_logs`;
- contadores de proteção: `rate_limit_counters`.

Posições e snapshots ainda representam um recorte de posição atual. O ledger de eventos e pernas descrito no README permanece necessário antes de histórico completo, TWR e XIRR.
