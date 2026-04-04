# TASK-156: SettingsModal (Container)

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Создать Container-компонент модального окна настроек. Подписывается на SettingsUIModel через DI, собирает LimitForm и LimitsTable, управляет сохранением/отменой.

## Файлы

```
src/features/field-limits/SettingsPage/components/
└── SettingsModal.tsx    # новый
```

## Что сделать

1. Создать `SettingsModal` — Container-компонент:
   - Получить `settingsUIModelToken` через `useDi().inject()`
   - Использовать `useModel()` для реактивной подписки на state
   - Использовать `model` для вызова actions (save, close, addLimit, etc.)

2. Структура:
   - `antd Modal` — `open={snap.isOpen}`, `onOk → save()`, `onCancel → close()`
   - `Spin` — при `isLoading`
   - `Alert` — при `error`
   - `LimitForm` — передать данные из SettingsUIModel
   - `LimitsTable` — передать draft.limits и callbacks

3. Управлять локальным state `selectedKeys` для чекбоксов таблицы

4. Маппинг callbacks:
   - `onAdd` → `model.addLimit(input)`
   - `onEdit` → `model.updateLimit(editingLimitKey, input)`
   - `onDelete` → `model.deleteLimit(key)`
   - `onColorChange` → `model.setLimitColor(key, color)`
   - `onApplyColumns` → `model.applyColumnsToSelected(selectedKeys, columnIds)`
   - `onApplySwimlanes` → `model.applySwimlanesToSelected(selectedKeys, swimlaneIds)`

## Критерии приёмки

- [ ] Получает модель через DI (useDi)
- [ ] Все данные из SettingsUIModel передаются в дочерние View
- [ ] Save/Close через модель
- [ ] Спиннер при загрузке, алерт при ошибке
- [ ] Нет бизнес-логики в компоненте
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-152](./TASK-152-field-limits-settings-ui-model.md), [TASK-154](./TASK-154-field-limits-limit-form.md), [TASK-155](./TASK-155-field-limits-limits-table.md)
- Референс: `src/swimlane-wip-limits/SettingsPage/components/SettingsModal.tsx`

---

## Результаты

**Дата**: 2025-03-13

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

Создан `src/features/field-limits/SettingsPage/components/SettingsModal.tsx` — Container-компонент модального окна настроек Field WIP Limits. Получает модель через DI (settingsUIModelToken), подписывается на state через useModel(), передаёт все данные в LimitForm и LimitsTable. Локальный state selectedKeys для row selection. Save/Close/Cancel через модель. Спиннер при isLoading, Alert при error. npm test и lint проходят.
