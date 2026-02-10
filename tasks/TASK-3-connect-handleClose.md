# TASK-3: Подключить handleClose к onCancel

**Status**: TODO

**Parent**: [EPIC-1](./EPIC-1-fix-closing-group-limits.md)

**Target Design**: [target-design.md](./target-design.md)

**Depends on**: [TASK-2](./TASK-2-add-handleClose.md)

---

## Описание

Заменить пустой обработчик `onCancel: () => {}` на `onCancel: this.handleClose`.

## Файл

`src/column-limits/SettingsPage/index.ts`

## Что сделать

1. Найти строку 112 в методе `openGroupSettingsPopup`
2. Заменить `onCancel: () => {},` на `onCancel: this.handleClose,`

## Изменения

**Строка 112:**

```typescript
// БЫЛО
onCancel: () => {},

// СТАЛО
onCancel: this.handleClose,
```

## Критерии приёмки

- [ ] `onCancel` использует `this.handleClose`
- [ ] При нажатии Cancel модалка закрывается
- [ ] Изменения не сохраняются при Cancel
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- src/column-limits/SettingsPage/index.ts`

## Проблемы с линтером

Если возникли ошибки линтера, которые непонятно как исправить — записать их здесь:

```
(место для записи ошибок)
```

---

## Результаты

**Дата**: 2026-02-10

**Агент**: Coder

**Статус**: COMPLETED

**Комментарии**:

```
Обработчик onCancel в методе openGroupSettingsPopup заменен с пустого () => {} на this.handleClose.
```
