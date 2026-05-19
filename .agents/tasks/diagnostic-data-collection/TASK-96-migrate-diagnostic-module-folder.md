# TASK-96: Migrate diagnostic → diagnostic-module folder

**Status**: TODO
**Type**: refactoring

**Parent**: [EPIC-7](./EPIC-7-diagnostic-data-collection.md)

---

## Описание

Механическая миграция legacy `src/features/diagnostic/` в `src/features/diagnostic-module/`. Логика `saveDiagnosticData` action не переносится — будет реализована в DiagnosticModel (TASK-98).

## Файлы

```
src/features/diagnostic-module/     # новая папка
├── BoardPage.ts                    # migrate
├── SettingsTab.tsx                 # migrate
├── JqlDebugDemo.tsx                # migrate
└── JqlDebugDemo.stories.tsx        # migrate (если есть)

src/content.ts                      # update imports
src/features/diagnostic/            # удалить после миграции
```

## Что сделать

1. Перенести файлы из `diagnostic/` в `diagnostic-module/` (кроме `actions/saveDiagnosticData.ts`).
2. Обновить relative imports внутри перенесённых файлов.
3. Обновить импорты в `content.ts` и других потребителях.
4. Удалить пустую папку `src/features/diagnostic/`.
5. Поведение export пока не менять — временно оставить legacy `createAction` до TASK-100.

## Критерии приёмки

- [ ] Папка `src/features/diagnostic/` удалена
- [ ] Extension собирается: `npm run build`
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Референс: [target-design.md](./target-design.md) Phase 0
