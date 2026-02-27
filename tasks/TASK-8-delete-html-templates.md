# TASK-8: Удалить htmlTemplates.tsx

**Status**: DONE

**Parent**: [EPIC-2](./EPIC-2-person-limits-react-migration.md)

---

## Описание

Удалить `htmlTemplates.tsx` и `htmlTemplates.test.tsx` — все зависимости от этих файлов к этому моменту должны быть удалены. Проверить что нигде не осталось импортов.

## Файлы

```
src/person-limits/SettingsPage/
├── htmlTemplates.tsx       # удалить
└── htmlTemplates.test.tsx  # удалить
```

## Что сделать

1. Убедиться, что нет импортов из `htmlTemplates`:
   - `index.tsx` — не должен импортировать (TASK-6)
   - `PersonalWipLimitContainer.tsx` — импортирует из `constants` (TASK-1)
   - `PersonalWipLimitTable.tsx` — импортирует из `constants` (TASK-1)
   - `PersonLimitsSettings.stories.tsx` — не импортирует (TASK-7)

2. Удалить `htmlTemplates.tsx`

3. Удалить `htmlTemplates.test.tsx`

4. Проверить билд и тесты

## Критерии приёмки

- [x] `htmlTemplates.tsx` удалён
- [x] `htmlTemplates.test.tsx` удалён
- [x] Нет импортов из `htmlTemplates` во всём проекте (в модуле `person-limits`)
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-extract-constants.md), [TASK-6](./TASK-6-refactor-index-tsx.md), [TASK-7](./TASK-7-rewrite-stories.md)
- Блокирует: [TASK-9](./TASK-9-verification.md)

---

## Результаты

**Дата**: 2026-02-11

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

- Удалён файл `src/person-limits/SettingsPage/htmlTemplates.tsx`
- Удалён файл `src/person-limits/SettingsPage/htmlTemplates.test.tsx`
- Проверены все файлы модуля `person-limits` — импортов из `htmlTemplates` не найдено
- Все файлы используют импорты из `constants.ts` вместо `htmlTemplates.tsx`
