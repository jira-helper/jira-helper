# TASK-66: Убрать displayName, показывать логин в таблице

**Status**: DONE

**Parent**: [EPIC-8](./EPIC-8-person-limits-bugfixes.md)

---

## Описание

При редактировании лимита и изменении имени — displayName в таблице не обновляется.
Решение: убрать концепцию displayName полностью. В таблице показывать тот же логин (person name), который ввёл пользователь. Это упрощает логику и убирает рассинхрон.

## Root Cause

В `PersonalWipLimitTable.tsx` колонка таблицы использует `dataIndex: ['person', 'displayName']` (строка 35).
При редактировании обновляется `name`, но `displayName` может не пересчитываться.

## Файлы

```
src/person-limits/
├── SettingsPage/
│   └── components/
│       └── PersonalWipLimitTable.tsx      # изменение — показывать name вместо displayName
├── property/
│   └── types.ts                           # изменение — убрать displayName из типа
└── SettingsPage/
    ├── stores/settingsUIStore.ts           # изменение — убрать displayName из логики
    └── actions/                            # проверить использование displayName
```

## Что сделать

1. В `PersonalWipLimitTable.tsx` изменить `dataIndex` с `['person', 'displayName']` на `['person', 'name']`
2. В `property/types.ts` убрать поле `displayName` из типа Person (или пометить deprecated)
3. Убрать любую логику формирования displayName из store/actions
4. Проверить, что сохранение/загрузка работает без displayName
5. Убедиться, что обратная совместимость не ломается (старые данные с displayName игнорируются)

## Критерии приёмки

- [ ] В таблице лимитов отображается логин (name), а не displayName
- [ ] При редактировании имени — таблица сразу обновляется
- [ ] Старые сохранённые данные с displayName загружаются без ошибок
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Референс: `src/person-limits/SettingsPage/components/PersonalWipLimitTable.tsx` строка 35
- Референс: `src/person-limits/property/types.ts` строки 11-15
