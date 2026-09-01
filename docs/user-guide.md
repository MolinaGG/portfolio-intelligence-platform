# Guia de uso da Evidaris

## 1. Entrar

Abra o ambiente autorizado e use o método de autenticação disponível. A versão controlada utiliza a identidade do hosting; a autenticação independente será ativada após domínio e credenciais próprias.

Cada usuário recebe um workspace separado. Nunca compartilhe o acesso pessoal.

## 2. Importar uma posição da B3

1. Na Área do Investidor B3, exporte a posição em XLSX, XLS ou CSV.
2. Na Evidaris, abra **Importações** e selecione **Nova importação**.
3. Escolha o arquivo, com limite de 10 MB.
4. Confira a PTAX preenchida automaticamente.
5. Se a fonte oficial estiver indisponível, marque a substituição manual e informe USD/BRL.
6. Selecione **Validar e importar**.
7. Confira quantidade de posições reconhecidas, rejeições, patrimônio e instituições.

A Evidaris calcula o hash do arquivo para impedir duplicidade. O original é guardado como evidência pelo período operacional de 90 dias definido para o beta.

## 3. Conferir a carteira

Em **Minha carteira**, selecione um ativo para ver classe, instituição, conta, quantidade, preço, valor e confiança da leitura. Divergências nunca devem ser corrigidas silenciosamente: registre o arquivo e o resultado observado para investigação.

## 4. Alternar moeda

Use o seletor BRL/USD no cabeçalho. A conversão utiliza a PTAX registrada no lote mais recente, não uma cotação em tempo real de negociação.

## 5. Desfazer uma importação

Em **Importações**, selecione **Desfazer e ver impacto**. Leia o impacto estimado e confirme apenas se deseja remover as posições daquele lote. O lote permanece no histórico como `ROLLED_BACK`, preservando auditoria.

## 6. Performance

A tela apresenta snapshots observados. Enquanto não houver movimentações e fluxos suficientes, a plataforma não chama a variação patrimonial de TWR ou XIRR. Aportes e retiradas podem alterar o patrimônio sem representar retorno.

## 7. Rendimentos e teses

- **Rendimentos:** registre dividendos, JCP, juros ou cupons que ainda não vieram de uma importação.
- **Minha tese:** registre objetivo, horizonte, razão de compra, critérios de aumento/redução/saída e risco principal.

Esses campos são declarações do usuário; a Evidaris não os transforma em recomendação.

## 8. Relatórios

Abra **Relatórios** para baixar PDF ou CSV. O arquivo contém a última posição importada, câmbio utilizado e aviso metodológico. Planilhas exportadas recebem proteção contra fórmulas iniciadas por `=`, `+`, `-` ou `@`.

## 9. Notícias

A aba consulta B3 e CVM e sempre direciona à publicação original. Notícias são informativas, não personalizadas e não constituem recomendação.

## 10. Segurança e privacidade

- use somente sua conta;
- não publique arquivos reais em issues ou chats;
- confirme instituição, quantidade e valor após cada carga;
- use dados artificiais ao demonstrar a plataforma;
- reporte acesso indevido ou divergência imediatamente pelo futuro canal de privacidade/suporte, ainda pendente de domínio.

Consulte também o [FAQ](faq.md), a [Política de Privacidade em revisão](legal/privacy-policy.md) e os [Termos de Uso em revisão](legal/terms-of-use.md).
