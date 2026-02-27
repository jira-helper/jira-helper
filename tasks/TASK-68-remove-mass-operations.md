# TASK-68: Удалить массовые операции (чекбоксы, apply columns/swimlanes)

**Status**: DONE

**Parent**: [EPIC-8](./EPIC-8-person-limits-bugfixes.md)

---

## Описание

Массовые операции ("Apply columns for selected users", "Apply swimlanes for selected users")
признаны ненужными по результатам ручного тестирования. Удалить весь связанный код:
чекбоксы выбора в таблице, кнопки массового применения, store-методы.

## Файлы

```
src/person-limits/SettingsPage/
├── components/
│   ├── PersonalWipLimitContainer.tsx   # изменение — удалить кнопки mass apply
│   └── PersonalWipLimitTable.tsx       # изменение — удалить чекбоксы выбора
└── stores/
    └── settingsUIStore.ts              # изменение — удалить applyColumnsToSelected, applySwimlanesToSelected
```

## Что сделать

1. В `settingsUIStore.ts` удалить:
   - `applyColumnsToSelected` (строки 118-127)
   - `applySwimlanesToSelected` (строки 129-138)
   - Любое состояние selected items (если есть)
2. В `PersonalWipLimitTable.tsx` удалить:
   - Чекбоксы выбора строк (rowSelection)
3. В `PersonalWipLimitContainer.tsx` удалить:
   - Кнопки "Apply columns for selected users" (строки 341-365)
   - Кнопки "Apply swimlanes for selected users" (строки 431-455)
   - Связанные обработчики
4. Удалить тесты, связанные с массовыми операциями
5. Убедиться, что UI не сломался после удаления

## Критерии приёмки

- [ ] Нет чекбоксов выбора в таблице лимитов
- [ ] Нет кнопок "Apply columns/swimlanes for selected"
- [ ] Store не содержит методов массового применения
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`
- [ ] Нет мёртвого кода (типы, импорты)

## Зависимости

- Референс: `src/person-limits/SettingsPage/stores/settingsUIStore.ts` строки 118-138
- Референс: `src/person-limits/SettingsPage/components/PersonalWipLimitContainer.tsx` строки 341-365, 431-455
