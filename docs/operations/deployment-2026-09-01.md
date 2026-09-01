# Registro de implantação — beta controlado v0.8

## Identificação

- data: 1º de setembro de 2026;
- ambiente: produção com acesso privado;
- versão do Sites: 5;
- URL: `https://evidaris-beta.guilhermemolinasolan.chatgpt.site`;
- commit GitHub: `09fb22410546f5f4f7aabdf545353af9c5160dd1`;
- commit do repositório de publicação: `a8ab661c4689f095b86b62206fb97982653ebd1a`.

## Evidências verificadas

- deployment concluído com status `succeeded`;
- acesso mantido somente para o proprietário;
- página inicial renderizada sem erro visual;
- D1 disponível com todas as tabelas esperadas;
- migration `0002_security_controls.sql` aplicada;
- `rate_limit_counters` recebendo contadores reais por rota e janela;
- cotação USD/BRL persistida em `fx_rates`: `5,1816`, fonte `BCB_SGS_PTAX`, referência de 31/08/2026;
- nenhum erro de Worker encontrado nos 15 minutos posteriores à publicação;
- validação prévia: lint, build, 14 testes automatizados e auditoria de dependências aprovados.

## Validação manual recomendada

O proprietário deve executar, autenticado, o roteiro de `docs/product/demo-screens.md`, com atenção especial a:

1. abrir Notícias e confirmar títulos e links da B3/CVM;
2. importar o CSV demonstrativo;
3. alternar entre BRL e USD;
4. gerar PDF e CSV;
5. desfazer a importação e confirmar a restauração da carteira;
6. conferir a experiência em celular.

## Pendências que não bloqueiam o beta privado

- domínio e e-mail transacional;
- amostras anonimizadas de três instituições;
- teste de isolamento com um segundo workspace;
- backup/restauração ensaiados;
- limpeza programada de documentos e contadores expirados;
- revisão jurídica das minutas e preenchimento dos dados do controlador;
- observabilidade externa e alertas operacionais;
- autenticação independente e MFA antes de uma abertura pública.

Este registro não representa aprovação para lançamento público. O critério de go/no-go continua definido em `docs/operations/release-checklist.md`.
