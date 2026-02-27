# EPIC-5: UI Polish для wiplimit-on-cells

## Описание

Доработка UI компонентов wiplimit-on-cells: переход на antd и исправление багов.

## Задачи

| # | Задача | Описание | Статус |
|---|--------|----------|--------|
| 41 | [TASK-41](./TASK-41-settings-buttons-antd.md) | Кнопки Settings Page → antd Button | DONE |
| 42 | [TASK-42](./TASK-42-wiplimit-cells-antd-components.md) | Все компоненты wiplimit-on-cells → antd | DONE |
| 43 | [TASK-43](./TASK-43-fix-wiplimit-modal-close.md) | Исправить Cancel и крестик модала | DONE |
| 44 | [TASK-44](./TASK-44-settings-buttons-inline.md) | Кнопки Settings Page в строку | DONE |

## Порядок выполнения

```
TASK-43 (bugfix) ──────────────────────> Критический баг, первый приоритет
TASK-41 (buttons antd) ────────────────> Независимая задача
TASK-42 (all components antd) ─────────> Зависит от TASK-41 (можно параллельно)
```

**Рекомендация:** Начать с TASK-43 (баг), затем TASK-41 и TASK-42.

## Acceptance Criteria

- [x] Модал корректно закрывается по Cancel и крестику
- [x] Все кнопки Settings Page используют antd
- [x] Все компоненты wiplimit-on-cells используют antd
- [x] Кнопки Settings Page расположены в строку
- [x] Все тесты проходят
