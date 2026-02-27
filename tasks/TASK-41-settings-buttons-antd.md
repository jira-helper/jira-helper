# TASK-41: Кнопки Settings Page должны использовать antd

## Описание

Заменить AUI-кнопки на antd Button во всех Settings Page entry points для единообразия UI.

## Scope

Заменить `<button className="aui-button">` на `<Button>` из antd в:

1. `src/wiplimit-on-cells/SettingsPage/components/SettingsButton/SettingsButton.tsx`
2. `src/person-limits/SettingsPage/components/SettingsButton/SettingsButton.tsx`
3. `src/column-limits/SettingsPage/components/SettingsButton/SettingsButton.tsx`

## Требования

1. Использовать `import { Button } from 'antd'`
2. Сохранить ID кнопок для обратной совместимости
3. Обновить Storybook stories если нужно

## Acceptance Criteria

- [ ] Все 3 кнопки используют antd Button
- [ ] Внешний вид соответствует Jira UI
- [ ] Существующие тесты проходят
- [ ] ESLint без ошибок
