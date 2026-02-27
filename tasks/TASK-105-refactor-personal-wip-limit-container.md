# TASK-105: Рефакторинг PersonalWipLimitContainer

**Status**: TODO

**Parent**: [EPIC-11](./EPIC-11-column-limits-swimlane-selector.md)

---

## Описание

Заменить inline код swimlane selector (~50 строк) на shared `SwimlaneSelector` компонент.

## Что сделать

### 1. Заменить inline код

**Файл**: `src/person-limits/SettingsPage/components/PersonalWipLimitContainer.tsx`

```tsx
// BEFORE: ~50 строк inline Checkbox + Checkbox.Group (строки 356-420)

// AFTER:
import { SwimlaneSelector } from 'src/shared/components/SwimlaneSelector';

<Form.Item label="Swimlanes" name="swimlanes">
  <SwimlaneSelector
    swimlanes={swimlanes}
    value={swimlanesValue}
    onChange={(ids) => {
      form.setFieldValue('swimlanes', ids);
      setSwimlanesValue(ids);
      handleFormChange('swimlanes', ids);
    }}
    label={null}  // Form.Item уже имеет label
  />
</Form.Item>
```

### 2. Удалить неиспользуемые state переменные

- `showSwimlanesList` — теперь внутри SwimlaneSelector
- Связанные `setShowSwimlanesList` вызовы

### 3. Проверить тесты

- `PersonalWipLimitContainer.cy.tsx` должны проходить
- BDD тесты person-limits должны проходить

## Критерии приёмки

- [ ] Inline код заменён на `<SwimlaneSelector />`
- [ ] Удалены неиспользуемые state переменные
- [ ] Все существующие тесты проходят
- [ ] Lint проходит

## Зависимости

- Зависит от: TASK-104 (shared component)
