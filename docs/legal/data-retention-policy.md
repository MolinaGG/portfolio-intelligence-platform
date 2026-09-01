# Política de retenção e descarte — proposta

| Categoria | Proposta do beta | Evento de início | Destino |
|---|---:|---|---|
| arquivo original importado | 90 dias | upload confirmado | exclusão do objeto, preservando hash e auditoria necessária |
| linha normalizada e posição | enquanto conta estiver ativa e finalidade existir | importação | exportação e eliminação/anonimização conforme solicitação e obrigação |
| lote, hash e evidência de decisão | prazo a validar | importação | retenção mínima necessária à rastreabilidade |
| auditoria de segurança | prazo a validar juridicamente | evento | arquivo protegido e descarte controlado |
| rate limit | até 48 horas operacionalmente | janela encerrada | limpeza automática/agendada |
| backup | prazo e ciclo a definir com provedor | criação | expiração automática e restauração restrita |
| suporte e direitos | prazo a validar | encerramento | eliminação ou retenção legal |

## Regras

- retenção não significa acesso irrestrito;
- documentos arquivados permanecem protegidos e auditáveis;
- exclusão do original não apaga automaticamente fatos financeiros derivados cuja retenção seja legítima;
- legal hold suspende descarte somente com justificativa registrada;
- toda rotina de descarte deve produzir contagem, horário, escopo e resultado, sem copiar o conteúdo excluído para logs.

Antes do lançamento, implementar job de exclusão do R2 e limpeza de contadores expirados, com teste de restauração e descarte.
