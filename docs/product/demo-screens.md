# Telas demonstrativas do MVP

**Ambiente privado:** https://evidaris-beta.guilhermemolinasolan.chatgpt.site

O acesso exige autenticação autorizada. Dados demonstrativos são artificiais e não representam recomendação ou carteira real.

## Roteiro rápido

1. Entre no ambiente privado.
2. Na tela **Visão geral**, clique em **Usar exemplo**.
3. Confirme que a importação cria patrimônio em BRL e USD.
4. Percorra as dez áreas abaixo.
5. Em **Importações**, teste o rollback somente com dados demonstrativos.

## Mapa das telas

| Tela | O que demonstra | Ação recomendada | Estado do MVP |
|---|---|---|---|
| Visão geral | patrimônio, PTAX, distribuição e maiores posições | importar o exemplo e alternar BRL/USD | funcional |
| Minha carteira | posição consolidada e evidência por ativo | abrir uma linha da carteira | funcional |
| Importações | lotes, câmbio, duplicidade e rollback | importar o mesmo arquivo duas vezes e desfazer | funcional |
| Performance | snapshots patrimoniais sem alegar rentabilidade | criar pelo menos dois snapshots | parcial e metodologicamente sinalizado |
| Rendimentos | dividendos, JCP, juros e cupons | cadastrar um rendimento artificial | funcional/manual |
| Concentração | limites por ativo, classe e instituição | verificar alertas após o exemplo | funcional/inicial |
| Minha tese | critérios definidos pelo próprio usuário | registrar uma tese artificial | funcional/manual |
| Relatórios | demonstrativo PDF e exportação CSV | baixar os dois formatos | funcional |
| Notícias | publicações atuais da B3 e CVM | abrir a notícia original | funcional |
| Configurações | moeda-base, câmbio e privacidade | alternar BRL/USD | funcional/inicial |
| Assistente Evidaris | posição e comportamento do futuro chat | abrir o botão flutuante | simulação, sem IA conectada |

## Onde o código das telas está

| Camada | Localização |
|---|---|
| composição das telas e interações | `app/dashboard.tsx` |
| estilos responsivos | `app/globals.css` |
| entrada e layout | `app/page.tsx`, `app/layout.tsx` |
| componentes reutilizáveis | `components/ui/` |
| APIs da demonstração | `app/api/` |
| banco e tabelas | `db/schema.ts`, `drizzle/` |
| importador B3 | `lib/b3-import.ts` |
| PTAX e notícias | `lib/ptax.ts`, `lib/news.ts` |
| relatório PDF | `lib/pdf-report.ts` |

## Dados de demonstração

Use [posicao-b3-exemplo.csv](../../demo/sample-data/posicao-b3-exemplo.csv). O mesmo conjunto está disponível pelo botão **Usar exemplo**.

Não envie prints, notas ou arquivos reais em gravações, apresentações ou issues. Para relatar erro, use um arquivo artificial que reproduza o formato.
