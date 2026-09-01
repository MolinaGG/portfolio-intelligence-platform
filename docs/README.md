# Documentação da Evidaris

Este diretório é o ponto de entrada para produto, demonstração, operação, segurança e documentos jurídicos do MVP.

| Preciso de… | Documento |
|---|---|
| testar todas as telas | [Mapa das telas demonstrativas](product/demo-screens.md) |
| aprender a usar a plataforma | [Guia de uso](user-guide.md) |
| responder uma dúvida comum | [FAQ](faq.md) |
| preparar o ambiente local | [Guia de desenvolvimento](development/getting-started.md) |
| entender a arquitetura | [Arquitetura do MVP](development/architecture.md) |
| fazer uma publicação | [Checklist de lançamento](operations/release-checklist.md) |
| conferir a implantação v0.8 | [Registro da implantação](operations/deployment-2026-09-01.md) |
| operar alertas e disponibilidade | [Observabilidade](operations/observability.md) |
| entender os controles de segurança | [Segurança do MVP](security/security-controls.md) |
| responder a um incidente | [Resposta a incidentes](security/incident-response.md) |
| consultar a revisão de pacotes | [Dependências](security/dependency-review.md) |
| consultar privacidade e LGPD | [Índice jurídico](legal/README.md) |

## Estrutura

```text
docs/
  product/       # telas, escopo e demonstrações
  development/   # instalação, arquitetura e contribuição
  operations/    # lançamento, monitoramento e rotinas
  security/      # controles, dependências e incidentes
  legal/         # modelos jurídicos e governança LGPD
demo/
  sample-data/   # arquivos artificiais para demonstração
brand/           # identidade visual e arquivos editáveis
```

O [README principal](../README.md) continua sendo a especificação ampla do produto. Estes guias transformam essa especificação em instruções operacionais.
