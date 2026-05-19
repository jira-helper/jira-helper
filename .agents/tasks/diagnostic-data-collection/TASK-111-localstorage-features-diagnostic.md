# TASK-111: local-settings + blur-for-sensitive + bug-template diagnostic

**Status**: TODO
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

- [ ] Три featureName по §5.4
- [ ] Unit test per callback
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
- Референс: requirements §5.6
