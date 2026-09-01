# Desenvolvimento local

## Pré-requisitos

- Node.js `>=22.13.0`;
- npm compatível com o lockfile;
- bindings Cloudflare D1 (`DB`) e R2 (`BUCKET`) para os fluxos persistentes;
- acesso autorizado ao repositório privado.

## Instalação e validação

```bash
npm run install:ci
npm run lint
npm test
npm run dev
```

O ambiente local usa uma identidade artificial somente quando `NODE_ENV` não é `production`. Nunca habilite esse fallback em produção.

## Banco

As tabelas vivem em `db/schema.ts`; migrations ficam em `drizzle/`. Não edite uma migration já aplicada. Para nova mudança:

```bash
npm run db:generate
```

Revise o SQL, teste em uma base descartável e documente rollback ou irreversibilidade.

## Convenções

- domínio financeiro em `lib/`;
- persistência em `db/`;
- handlers em `app/api/`;
- telas em `app/` e componentes em `components/`;
- amostras somente artificiais em `demo/`;
- documentos em `docs/`;
- segredos nunca entram no Git.

Leia [CONTRIBUTING.md](../../CONTRIBUTING.md) antes de abrir uma alteração.
