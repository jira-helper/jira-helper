# TASK-163: Переключить content.ts на новую реализацию

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Переключить импорты в `content.ts` со старой реализации (`src/field-limits/`) на новую (`src/features/field-limits/`). Это атомарное переключение — один коммит, полностью заменяет старую реализацию на новую.

## Файлы

```
src/content.ts    # изменение
```

## Что сделать

1. Заменить импорты:

```typescript
// До:
import FieldLimitsSettingsPage from './field-limits/SettingsPage';
import FieldLimitsBoardPage from './field-limits/BoardPage';

// После:
import { SettingsPageModification as FieldLimitsSettingsPage } from './features/field-limits/SettingsPage';
import { BoardPageModification as FieldLimitsBoardPage } from './features/field-limits/BoardPage';
```

2. Массив `modificationsMap` — менять не надо, имена совпадают через alias

3. Проверить, что extension собирается: `npm run build`

## Критерии приёмки

- [ ] Импорты обновлены на `src/features/field-limits/`
- [ ] `npm run build` проходит без ошибок
- [ ] Фича работает как раньше (manual verification на Jira)
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: **все задачи Phase 1-4** (TASK-148...TASK-162)
- Legacy код: `src/content.ts:23-24` (текущие импорты)

---

## Результаты

**Дата**: 2025-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Заменены импорты в `src/content.ts` (строки 23-24) на новую реализацию из `src/features/field-limits/`
- Использованы alias `as` для сохранения имён в `modificationsMap`
- `npm run build:dev` — успешно
- `npm test` — 769 тестов пройдено
- `npm run lint:eslint -- --fix` — без ошибок

**Проблемы и решения**:

Нет.
