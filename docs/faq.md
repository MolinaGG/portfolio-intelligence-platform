# Perguntas frequentes

## Produto

### A Evidaris compra ou vende investimentos?

Não. O MVP consolida informações, calcula valores e apresenta explicações. Ele não envia ordens, não movimenta dinheiro e não presta recomendação personalizada.

### Posso usar com mais de uma corretora?

Sim. A proposta é consolidar instituições diferentes. No MVP, a entrada funcional é o arquivo de posição exportado pela Área do Investidor B3.

### Os dados demonstrativos são reais?

Não. O arquivo em `demo/sample-data/` é totalmente artificial.

## Importação

### Quais formatos são aceitos?

XLSX, XLS e CSV, com no máximo 10 MB. O parser atual espera colunas equivalentes às da posição B3.

### Por que algumas linhas foram rejeitadas?

Uma linha precisa conter identificação do ativo e valor de mercado válido. Cabeçalho desconhecido, valor vazio ou número não reconhecido gera rejeição para evitar cálculo silenciosamente incorreto.

### O que acontece se eu importar o mesmo arquivo novamente?

O hash SHA-256 identifica a duplicidade e impede a criação de posições repetidas no mesmo workspace.

### Posso desfazer?

Sim. O rollback remove posições e snapshot derivados do lote, marca a importação como desfeita e registra a ação na auditoria.

### A Evidaris já lê notas e screenshots?

Ainda não no fluxo funcional. Notas, PDFs e screenshots estão no roadmap e deverão passar por staging, validação de confiança e confirmação do usuário.

## Câmbio e valores

### De onde vem o dólar?

Da série diária oficial de venda do Banco Central, com fallback para o serviço Olinda e para a última PTAX armazenada. A data e a fonte acompanham o lote.

### PTAX é a cotação que minha corretora usou?

Não necessariamente. PTAX é uma referência oficial. Câmbio efetivamente contratado, spread e IOF precisam ser importados ou informados para representar a experiência real.

### Por que o patrimônio aumentou sem rentabilidade?

Um aporte aumenta patrimônio, mas não é retorno. O MVP mantém essa distinção e não publica TWR/XIRR sem fluxos suficientes.

## Segurança e privacidade

### A Evidaris armazena senha?

Não. A autenticação é delegada ao provedor de identidade. O banco guarda a identidade externa vinculada ao usuário interno, não a senha.

### Quem pode ver minha carteira?

No beta, somente usuários explicitamente autorizados e membros do próprio workspace. Papéis de consultor/cliente ainda não estão liberados.

### Por quanto tempo o arquivo original fica guardado?

A regra aprovada para o beta é 90 dias. A exclusão automatizada e a política definitiva precisam ser validadas antes do lançamento público.

### Como exerço meus direitos da LGPD?

O processo está descrito em [Direitos dos titulares](legal/data-subject-rights.md). O canal oficial ainda será publicado depois da definição do domínio e responsável.

### Existe limite de requisições?

Sim. Consultas e operações sensíveis têm limites distintos por usuário, rota e janela de tempo. Excesso retorna HTTP `429` e é auditado.

## Suporte

### Como relatar um erro?

Registre: tela, horário de Brasília, ação realizada, mensagem exibida e resultado esperado. Não anexe dados financeiros reais em issues. Crie uma amostra artificial que reproduza o problema.
