# Resposta a incidentes

## Severidade

| Nível | Exemplo | Resposta inicial desejada |
|---|---|---:|
| SEV-1 | exposição de carteira, acesso cruzado ou credencial de produção | imediata |
| SEV-2 | alteração indevida, perda de evidência, indisponibilidade total | até 1 hora |
| SEV-3 | degradação de fonte, erro isolado sem exposição | mesmo dia útil |

## Fluxo

1. **Detectar e registrar:** horário, componente, versão e evidência mínima.
2. **Conter:** revogar chave, limitar acesso, desligar feature ou restaurar versão segura.
3. **Preservar:** logs e hashes necessários sem ampliar a cópia de dados pessoais.
4. **Avaliar:** confidencialidade, integridade, disponibilidade, autenticidade, titulares e alcance.
5. **Comunicar:** responsáveis internos, fornecedor e, quando aplicável, titulares e ANPD.
6. **Recuperar:** validar dados, restaurar serviço e monitorar recorrência.
7. **Aprender:** causa raiz, ações, responsável e prazo; nenhum culpado individual como substituto de correção sistêmica.

Incidente com risco ou dano relevante deve seguir a Resolução CD/ANPD nº 15/2024 e avaliação jurídica. Referência: [ANPD — Comunicação de Incidente](https://www.gov.br/anpd/pt-br/assuntos/comunicacao-de-incidentes-de-seguranca-cis).

## Checklist de contenção

- [ ] congelar deploys não relacionados;
- [ ] identificar workspaces/rotas afetados;
- [ ] revogar segredos ou sessões comprometidas;
- [ ] verificar auditoria e integridade do banco;
- [ ] impedir novas importações se houver risco de corrupção;
- [ ] designar líder e registrador do incidente;
- [ ] preparar comunicação factual, sem especulação;
- [ ] testar correção em dados artificiais;
- [ ] registrar post-mortem.
