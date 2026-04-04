# TASK-160: FieldLimitBadge (View) + stories

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Создать View-компонент для одного badge лимита. Отображает визуальное имя, счётчик текущее/лимит и цветовую индикацию (зелёный/жёлтый/красный). Заменяет legacy HTML templates из `src/field-limits/BoardPage/htmlTemplates.ts`.

## Файлы

```
src/features/field-limits/BoardPage/components/
├── FieldLimitBadge.tsx            # новый
├── FieldLimitBadge.module.css     # новый
└── FieldLimitBadge.stories.tsx    # новый
```

## Что сделать

1. Создать `FieldLimitBadge` — чистый View:

```tsx
export interface FieldLimitBadgeProps {
  visualValue: string;
  current: number;
  limit: number;
  badgeColor: string;
  bkgColor?: string;
  tooltip: string;
}
```

2. Визуальная структура (из legacy):
   - Блок с `visualValue` текстом
   - Круглый badge сверху с `current/limit`
   - Цвет badge: `badgeColor` (OVER_WIP_LIMITS / ON_THE_LIMIT / BELOW_THE_LIMIT)
   - Фон блока: `bkgColor` (кастомный цвет) или дефолтный `#3366ff`
   - antd `Tooltip` с текстом: "current: N, limit: N, field name: X, field value: Y"

3. CSS стили — перенести из `src/field-limits/BoardPage/styles.module.css` (fieldLimitsItem, limitStats)

4. Storybook stories:
   - BelowLimit (current < limit, зелёный)
   - OnLimit (current === limit, жёлтый)
   - OverLimit (current > limit, красный)
   - WithCustomColor (кастомный bkgColor)

## Критерии приёмки

- [ ] Визуально воспроизводит legacy badge
- [ ] Использует antd Tooltip
- [ ] Цветовая индикация работает для всех 3 состояний
- [ ] Storybook stories работают
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: нет (чистый View)
- Legacy код: `src/field-limits/BoardPage/htmlTemplates.ts`, `src/field-limits/BoardPage/styles.module.css`

---

## Результаты

**Дата**: 2025-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `FieldLimitBadge.module.css` — стили badge и stats circle
- Создан `FieldLimitBadge.tsx` — View-компонент с Tooltip, visualValue, current/limit, badgeColor, bkgColor
- Создан `FieldLimitBadge.stories.tsx` — BelowLimit, OnLimit, OverLimit, WithCustomColor
- `npm test` — 757 passed
- `npm run lint:eslint -- --fix` — без ошибок

**Проблемы и решения**:

Нет
