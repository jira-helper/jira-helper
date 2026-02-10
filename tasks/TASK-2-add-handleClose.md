# TASK-2: Добавить метод handleClose

**Status**: TODO

**Parent**: [EPIC-1](./EPIC-1-fix-closing-group-limits.md)

**Target Design**: [target-design.md](./target-design.md)

---

## Описание

Добавить метод `handleClose` в класс `SettingsWIPLimits`, который будет закрывать модалку при нажатии Cancel.

## Файл

`src/column-limits/SettingsPage/index.ts`

## Что сделать

1. Найти метод `handleSubmit` (строка ~177)
2. Добавить после него метод `handleClose`

## Код для добавления

После метода `handleSubmit` добавить:

```typescript
handleClose = (unmountPopup: () => void): void => {
  if (this.columnLimitsFormRoot) {
    this.columnLimitsFormRoot.unmount();
    this.columnLimitsFormRoot = null;
  }
  unmountPopup();
};
```

## Референс

`src/person-limits/SettingsPage/index.tsx` строки 140-143:

```typescript
handleClose = async (unmountPopup: Function): Promise<void> => {
  initFromProperty();
  unmountPopup();
};
```

## Критерии приёмки

- [ ] Метод `handleClose` добавлен в класс `SettingsWIPLimits`
- [ ] React root очищается при закрытии (`columnLimitsFormRoot.unmount()`)
- [ ] Вызывается `unmountPopup()` для закрытия модалки
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- src/column-limits/SettingsPage/index.ts`

## Проблемы с линтером

Если возникли ошибки линтера, которые непонятно как исправить — записать их здесь:

```
(место для записи ошибок)
```

---

## Результаты

**Дата**: 

**Агент**: 

**Статус**: 

**Комментарии**:

```
(место для комментариев агента)
```
