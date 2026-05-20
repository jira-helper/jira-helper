# TASK-100: SettingsTab export wiring

**Status**: DONE
**Type**: container

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Подключить export диагностики через `DiagnosticModel.saveDiagnosticData()` в SettingsTab. Удалить legacy `createAction` saveDiagnosticData.

## Файлы

```
src/features/diagnostic-module/
├── SettingsTab.tsx                      # update
└── actions/saveDiagnosticData.ts        # удалить (если остался после TASK-96)
```

## Что сделать

1. SettingsTab: `useDi()` + `di.inject(diagnosticModelToken)`.
2. Кнопка export: `onClick={() => model.saveDiagnosticData()}`.
3. Удалить import/usage `createAction` saveDiagnosticData.
4. v1 без debug UI для `registeredFeatures` (requirements §5.9).

## Критерии приёмки

- [ ] Export работает через DiagnosticModel
- [ ] Legacy action удалён
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-99](./TASK-99-diagnostic-module-di-wiring.md)
- Референс: [developer-guide.md](./developer-guide.md)
