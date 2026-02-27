# TASK-42: Все компоненты wiplimit-on-cells должны использовать antd

## Описание

Заменить все AUI-элементы на antd компоненты внутри `wiplimit-on-cells` Settings Page.

## Scope

### RangeForm (`src/wiplimit-on-cells/SettingsPage/components/RangeForm/`)
- `<input>` → `<Input>` из antd
- `<select>` → `<Select>` из antd
- `<input type="checkbox">` → `<Checkbox>` из antd
- `<button>` → `<Button>` из antd

### RangeTable (`src/wiplimit-on-cells/SettingsPage/components/RangeTable/`)
- `<table className="aui aui-table-list">` → `<Table>` из antd
- `<input>` для inline editing → `<Input>` из antd
- `<input type="checkbox">` → `<Checkbox>` из antd
- Badge ячеек → `<Tag>` из antd

### SettingsModal (`src/wiplimit-on-cells/SettingsPage/components/SettingsModal/`)
- Уже использует antd Modal — проверить кнопки внутри

## Требования

1. Использовать компоненты из `antd`
2. Сохранить data-testid для тестов
3. Обновить Cypress тесты если нужны другие селекторы
4. Обновить Storybook stories

## Acceptance Criteria

- [ ] Все формы используют antd Input/Select/Checkbox
- [ ] Таблица использует antd Table или стилизованную таблицу
- [ ] Все кнопки используют antd Button
- [ ] Cypress тесты проходят
- [ ] ESLint без ошибок
