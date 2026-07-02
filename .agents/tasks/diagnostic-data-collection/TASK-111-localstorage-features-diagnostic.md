# TASK-111: local-settings + blur-for-sensitive + bug-template diagnostic

**Status**: DONE
**Type**: di-wiring

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Diagnostic callbacks для трёх localStorage-only legacy фич.

## Файлы

```
src/features/local-settings/          # diagnosticRegistration или init hook
src/features/blur-for-sensitive/      # registerBlurSensitiveFeatureInDI
src/features/bug-template/            # bootstrap hook
```

## Что сделать

1. `local-settings`: callback читает `useLocalSettingsStore.getState().settings`.
2. `blur-for-sensitive`: register in `registerBlurSensitiveFeatureInDI`, key `blurSensitive`.
3. `bug-template`: register in existing init, key `jira_helper_textarea_bug_template`.
4. Payload convention §5.3 для каждой (localStorage block, boardProperty null, runtime null).
5. Unit test per callback.

## Критерии приёмки

- [x] Три featureName по §5.4
- [x] Unit test per callback
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
- Референс: requirements §5.6

---

## Результаты

**Дата**: 2026-05-21

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- `local-settings`: `diagnosticRegistration.ts` — snapshot из `useLocalSettingsStore.getState().settings`, регистрация в `content.ts`
- `blur-for-sensitive`: `diagnosticRegistration.ts` + вызов из `registerBlurSensitiveFeatureInDI`; key `blurSensitive`
- `bug-template`: `diagnosticRegistration.ts` + регистрация в `content.ts`; key `jira_helper_textarea_bug_template` → `bugTemplate`
- Unit-тесты по 3 сценария на фичу (регистрация, payload §5.3, collect via DiagnosticModel)
- `content.ts`: `diagnosticModule.ensure` перенесён сразу после `registerLogger`, до blur DI (чтобы diagnostic inject работал)

**Проблемы и решения**:

- `registerBlurSensitiveFeatureInDI` вызывался до `diagnosticModule.ensure` — перенесли `registerLogger` + `diagnosticModule.ensure` выше blur registration в `content.ts`.
