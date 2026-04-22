# TASK-28: CopyFromDialog view

**Status**: VERIFICATION
**Type**: view

**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

Модалка выбора источника для «Copy from…» (FR-10, S11).

## Файлы

```
src/features/gantt-chart/SettingsModal/components/
├── CopyFromDialog.tsx
└── CopyFromDialog.test.tsx
```

## Что сделать

1. **TDD:** выбор scope, Cancel/Copy.
2. Реализовать `CopyFromDialogProps` из [target-design.md](./target-design.md).

## Критерии приёмки

- [ ] Отображает список `scopeKeys` из модели.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-types-and-tokens.md)

---

## Результаты

_(заполняется по завершении)_
