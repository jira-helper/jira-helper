# TASK-161: FieldLimitsList (Container)

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Создать Container-компонент — список badges с лимитами. Подписывается на BoardRuntimeModel через DI и рендерит FieldLimitBadge для каждого активного лимита.

## Файлы

```
src/features/field-limits/BoardPage/components/
└── FieldLimitsList.tsx    # новый
```

## Что сделать

1. Создать `FieldLimitsList` — Container-компонент:
   - Получить `boardRuntimeModelToken` через `useDi().inject()`
   - Использовать `useModel()` для реактивной подписки на stats и settings

2. Рендер:
   - Контейнер с `display: inline-flex` (как legacy `.fieldLimitsList`)
   - Для каждого limitKey в `settings.limits`:
     - Получить stats через `model.getLimitStats(limitKey)`
     - Передать в `FieldLimitBadge`:
       - `visualValue` из settings
       - `current` / `limit` из stats
       - `badgeColor` через `model.getBadgeColor(limitKey)`
       - `bkgColor` из settings
       - `tooltip` — сформировать из stats + settings

3. Стили контейнера — перенести из legacy `.fieldLimitsList` (inline-flex, margin, border-left)

## Критерии приёмки

- [ ] Получает данные через DI (useDi + useModel)
- [ ] Рендерит FieldLimitBadge для каждого лимита
- [ ] Обновляется реактивно при изменении stats
- [ ] Визуально совпадает с legacy layout
- [ ] Нет бизнес-логики в компоненте
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-159](./TASK-159-field-limits-board-runtime-model.md), [TASK-160](./TASK-160-field-limits-badge.md)
- Legacy код: `src/field-limits/BoardPage/index.ts:132-202` (applyLimitsList)

---

## Результаты

**Дата**: 2025-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `FieldLimitsList.tsx` — Container-компонент:
  - Получает данные через DI (useDi + boardRuntimeModelToken + useModel)
  - Рендерит FieldLimitBadge для каждого лимита
  - Формирует tooltip в формате `current: X\nlimit: Y\nfield name: Z\nfield value: W`
  - Inline styles: inline-flex, border-left, margin-left, padding-left
- Создан `FieldLimitsList.test.tsx` — 5 тестов (null при пустых limits, рендер badges, формат tooltip)

**Проблемы и решения**:

- Antd Tooltip не устанавливает `title` на DOM-элемент — тесты проверяют отображаемые значения (current/limit, visualValue)
