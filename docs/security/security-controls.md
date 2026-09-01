# Controles de segurança do MVP

## Implementados

- autenticação delegada; nenhuma senha no banco da Evidaris;
- isolamento lógico por `workspace_id` em registros financeiros;
- deduplicação de arquivos por SHA-256;
- rate limiting persistente no D1 por usuário, método, rota e janela;
- auditoria de provisionamento, importação, rollback, relatório, configurações, rendimentos, teses e primeiro bloqueio de limite;
- upload restrito a XLSX/XLS/CSV, máximo de 10 MB e nome higienizado no storage;
- respostas `429` com `Retry-After`;
- proteção contra CSV Formula Injection;
- timeout e fallback em fontes externas;
- segredos fora do repositório;
- Dependabot, CI e auditoria de dependências configurados.

## Antes do beta com convidados

- autenticação independente, MFA para administradores e recuperação de conta;
- e-mail e domínio verificados;
- headers CSP/HSTS no domínio final;
- expiração automática de arquivos no R2 e contadores D1;
- backups e restauração testada;
- observabilidade com alerta e redaction;
- revisão de permissões do hosting, D1, R2 e GitHub;
- varredura antimalware ou quarentena para documentos complexos;
- análise de autorização por rota e testes de acesso cruzado;
- rotação e inventário de segredos;
- avaliação de fornecedores e transferências internacionais.

## Limites atuais

| Operação | Limite |
|---|---:|
| leitura da carteira | 120/minuto |
| PTAX | 30/minuto |
| notícias | 20/10 minutos |
| importação | 10/15 minutos |
| rollback | 10/hora |
| relatório | 20/hora |
| demais escritas | 30/10 minutos |

Os valores são iniciais e devem ser ajustados com métricas, nunca removidos para ocultar um problema de performance.
