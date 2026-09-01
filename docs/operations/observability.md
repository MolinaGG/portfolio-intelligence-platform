# Observabilidade

## Eventos mínimos

- autenticação/provisionamento;
- importação iniciada, concluída, rejeitada e desfeita;
- latência e falha da PTAX;
- latência, fonte e vazio de notícias;
- geração de PDF/CSV;
- resposta `401`, `403`, `413`, `415`, `429` e `5xx`;
- falha de migration, R2 ou D1;
- exclusão por retenção e restauração de backup.

## Regras de log

- usar JSON estruturado no provedor definitivo;
- incluir `request_id`, rota, método, versão e duração;
- não registrar conteúdo do arquivo, carteira, token, e-mail completo ou cabeçalho de autenticação;
- usar hash rotacionável quando correlação for indispensável;
- separar auditoria de negócio de log técnico;
- proteger acesso e definir retenção.

## Alertas iniciais

| Sinal | Gatilho inicial |
|---|---|
| erro geral | taxa de 5xx > 2% por 5 min |
| PTAX | nenhuma fonte disponível e cache ausente |
| notícias | ambas as fontes vazias em duas consultas consecutivas |
| importação | falhas > 10% em 15 min, excluindo arquivo inválido conhecido |
| segurança | repetição de 429 ou 401 anormal por identidade/rota |
| storage | erro ao preservar ou excluir evidência |

Os limiares devem ser recalibrados após o beta. Alerta precisa ter responsável, canal e ação; métrica sem resposta definida não basta.
