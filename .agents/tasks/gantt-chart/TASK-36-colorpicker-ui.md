# TASK-36: Заменить Select палитрой на antd ColorPicker

**Статус**: VERIFICATION
**Тип**: bugfix
**Приоритет**: high

## Описание
В модалке настроек Ганта выбор цвета для color rules реализован через Select с preset палитрой из 7 цветов. Нужно заменить на antd `ColorPicker` для произвольного выбора цвета.

## Файлы
- `src/features/gantt-chart/IssuePage/components/GanttSettingsModal.tsx`

## Критерии приёмки
- [ ] Вместо `<Select>` для цвета используется `<ColorPicker>` из antd
- [ ] Значение хранится как hex-строка (#RRGGBB)
- [ ] Удалены preset color options и связанные i18n тексты
- [ ] Тесты проходят
- [ ] ESLint: `npm run lint:eslint -- --fix`
