# Checklist de lançamento do MVP

## Código e dados

- [x] importação demonstrativa B3 → banco → BRL/USD;
- [x] PTAX redundante e fallback manual;
- [x] notícias B3/CVM;
- [x] rate limiting e auditoria inicial;
- [x] limite/higienização de upload;
- [ ] amostras reais anonimizadas de três instituições;
- [ ] teste de acesso cruzado entre dois workspaces;
- [ ] job de retenção de R2 e limpeza de rate limit;
- [ ] backup e restauração D1/R2 testados.

## Identidade e comunicação

- [ ] domínio oficial;
- [ ] autenticação independente e MFA administrativo;
- [ ] recuperação de conta;
- [ ] domínio/e-mail transacional;
- [ ] canal de suporte e privacidade.

## Jurídico e fornecedores

- [x] minutas de Termos, Privacidade, direitos e retenção;
- [ ] identificação do controlador e contatos;
- [ ] revisão jurídica e aprovação das versões vigentes;
- [ ] inventário final de operadores, regiões e transferências;
- [ ] licença comercial de notícias e dados de mercado;
- [ ] avaliação de IA antes de enviar documento financeiro.

## Operação

- [ ] monitoramento e alertas com responsável;
- [ ] runbook de incidente ensaiado;
- [ ] métricas de ativação e importação definidas;
- [ ] grupo inicial de 10–20 convidados;
- [ ] canal de feedback sem dados financeiros;
- [ ] rollback de versão testado.

## Critério de go/no-go

Não abrir publicamente se houver acesso cruzado, divergência silenciosa, ausência de canal LGPD, vulnerabilidade crítica conhecida, backup não testado ou fornecedor sem condições de uso compatíveis.
