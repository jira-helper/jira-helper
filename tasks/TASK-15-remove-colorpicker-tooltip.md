# TASK-15: Удалить ColorPickerTooltip из index.ts

**Status**: TODO

**Parent**: [EPIC-1](./EPIC-1-fix-closing-group-limits.md)

**Target Design**: [target-design.md](./target-design.md)

**Depends on**: [TASK-14](./TASK-14-create-colorpicker-button.md)

---

## Описание

Интегрировать `ColorPickerButton` в форму и удалить использование legacy `ColorPickerTooltip`.

## Файлы для изменения

1. `src/column-limits/SettingsPage/ColumnLimitsForm.tsx` — использовать `ColorPickerButton`
2. `src/column-limits/SettingsPage/components/SettingsModalContainer.tsx` — убрать `onColorChange` placeholder

## Что сделать

### 1. Обновить `ColumnLimitsForm.tsx`

Заменить кнопку "Change color" на `ColorPickerButton`:

```typescript
import { ColorPickerButton } from './components/ColorPickerButton';

// В компоненте ColumnGroup:
<ColorPickerButton
  groupId={group.id}
  currentColor={group.customHexColor}
  onColorChange={(color) => onColorChange(group.id, color)}
/>
```

### 2. Обновить props `ColumnLimitsFormProps`

Изменить сигнатуру:

```typescript
// БЫЛО
onColorChange: (groupId: string) => void;

// СТАЛО
onColorChange: (groupId: string, color: string) => void;
```

### 3. Обновить `SettingsModalContainer.tsx`

```typescript
const handleColorChange = (groupId: string, color: string) => {
  actions.setGroupColor(groupId, color);
};
```

### 4. Обновить `ColumnLimitsContainer.tsx`

Если он используется — обновить обработчик `onColorChange`.

### 5. Проверить, что ColorPickerTooltip не используется

```bash
grep -r "ColorPickerTooltip" src/column-limits/
```

Если есть использования — удалить их.

## Критерии приёмки

- [ ] `ColorPickerButton` интегрирован в `ColumnLimitsForm`
- [ ] `onColorChange` принимает `(groupId, color)` вместо `(groupId)`
- [ ] При выборе цвета он сохраняется в store
- [ ] Цвет группы отображается корректно
- [ ] Нет использований `ColorPickerTooltip` в `column-limits/`
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- src/column-limits/`

## Проблемы с линтером

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
