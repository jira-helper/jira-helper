# TASK-32: Удалить legacy-файлы

**Status**: TODO

**Parent**: [EPIC-3](./EPIC-3-wiplimit-on-cells-refactoring.md)

---

## Описание

Удалить файлы, которые заменены новой архитектурой: `table.ts` (заменён React `RangeTable`), HTML-шаблоны из `constants.ts` (заменены React-компонентами), старые entry points (заменены `BoardPage/index.ts` и `SettingsPage/index.ts`).

## Файлы

```
src/wiplimit-on-cells/
├── table.ts                        # удалить — заменён RangeTable + settingsUIStore
├── WipLimitOnCells.ts              # удалить — заменён BoardPage/index.ts
├── WiplimitOnCellsSettingsPopup.ts # удалить — заменён SettingsPage/index.ts
└── constants.ts                    # изменение — убрать HTML-шаблоны, оставить settingsJiraDOM если нужны
```

## Что сделать

1. Удалить `table.ts` — вся логика в `settingsUIStore.ts` + `RangeTable` компонентах
2. Удалить `WipLimitOnCells.ts` — заменён `BoardPage/index.ts`
3. Удалить `WiplimitOnCellsSettingsPopup.ts` — заменён `SettingsPage/index.ts`
4. Обновить `constants.ts`:
   - Убрать `settingsEditWipLimitOnCells()` — заменён `SettingsButton.tsx`
   - Убрать `ClearDataButton()` — заменён кнопкой в `SettingsModal.tsx`
   - Убрать `RangeName()` — заменён `RangeForm.tsx`
   - Убрать `cellsAdd()` — заменён `RangeForm.tsx`
   - Оставить `settingsJiraDOM` если используется где-то, иначе удалить весь файл
5. Обновить импорты в `src/content.ts`
6. Проверить что нет broken imports

## Критерии приёмки

- [ ] Все legacy-файлы удалены
- [ ] Нет broken imports
- [ ] Расширение собирается: `npm run build`
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-25](./TASK-25-refactor-board-index.md), [TASK-31](./TASK-31-refactor-settings-index.md)
- Все новые файлы должны быть на месте и работать
