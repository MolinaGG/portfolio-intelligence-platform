# Revisão de dependências

## Processo

```bash
npm ci
npm run lint
npm test
npm run security:audit
npm outdated
```

Dependabot verifica npm e GitHub Actions semanalmente. O CI bloqueia vulnerabilidade crítica conhecida; achados altos devem possuir correção, mitigação documentada, responsável e prazo antes do lançamento público.

## Critérios

- pacote possui manutenção e licença compatível;
- versão está fixada no lockfile com integridade;
- dependência é realmente necessária;
- parser de arquivo é tratado como superfície não confiável;
- atualização passa por testes de importação, relatório e build;
- exceção nunca é permanente ou sem responsável.

## Registro da revisão de 01/09/2026

| Comando | Resultado | Ação |
|---|---|---|
| `npm audit --omit=dev` | **0 vulnerabilidades** após correções | repetir no CI e em cada release |
| `npm outdated` | 26 pacotes possuíam alguma versão mais recente | atualizar por compatibilidade e risco, sem salto automático de major |

### Ações executadas

- Next.js atualizado de 16.2.6 para 16.3.4 para corrigir advisories de segurança;
- React e React DOM alinhados em 19.2.8;
- `@hookform/resolvers` atualizado e `fast-uri` fixado em 3.1.5;
- pacote SheetJS antigo do registro npm removido;
- SheetJS 0.20.3 obtido diretamente do canal oficial e fixado no lockfile;
- limite de 10 MB, allowlist de formato e rate limit mantidos porque todo parser continua sendo uma superfície não confiável.

O tarball oficial validado possui SHA-256 `8dc73fc3b00203e72d176e85b50938627c7b086e607c682e8d3c22c02bb99fe8`. A URL e a integridade ficam fixadas no `package-lock.json`.
