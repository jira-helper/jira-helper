# TASK-43: Settings modal — стабильный layout строк quick/exclusion filters

**Status**: DONE
**Type**: bugfix / view
**Priority**: medium
**Parent**: [EPIC-1](./EPIC-1-gantt-chart.md)

---

## Описание

**Bug** ([report from chat](./request.md)): в `GanttSettingsModal` строка quick-filter «прыгает» при появлении сообщения о невалидном JQL. Action-кнопки (`↑`/`↓`/`✕`) уходят на новую строку или висят над/под основным рядом. То же ломалось и в exclusion filters.

**Root cause:**

- Строка строилась через `Space wrap align="start"` + action-кнопки с хардкодом `marginTop: 30` (компенсация высоты лейбла).
- Когда AntD Form рендерил под JQL-инпутом красное сообщение валидации (`.ant-form-item-explain-error`), высота инпута увеличивалась → у Space `align="start"` кнопки оставались на старой baseline → визуально «прыгали».

**Решение:**

- Action-кнопки обёрнуты в `<Form.Item label=" " colon={false} style={{ marginBottom: 0 }}>` — невидимый лейбл резервирует ту же высоту, что и у основного контрола, и AntD сам синхронизирует baseline.
- Хардкод `marginTop: 30` удалён.
- Применено симметрично для quick filters и exclusion filters.

## Файлы

```
src/features/gantt-chart/IssuePage/components/
├── GanttSettingsModal.tsx                     # action-buttons → Form.Item label=" "
└── GanttSettingsModal.stories.tsx             # +story `WithJqlValidationError` для визуальной проверки
```

## Что сделать (готово)

1. ✅ Обернуть action-кнопки строки `quickFilters` в `Form.Item label=" " colon={false} style={{ marginBottom: 0 }}`.
2. ✅ Сделать то же самое для строки `exclusionFilters`.
3. ✅ Удалить `marginTop: 30` у соответствующих `div`.
4. ✅ Storybook: `WithJqlValidationError` — пресет с двумя строками, у одной заведомо битый JQL (`((( totally broken`).

## Критерии приёмки

- [x] При появлении JQL-ошибки строка фильтра не «прыгает», action-кнопки остаются на baseline инпута.
- [x] Storybook story `WithJqlValidationError` визуально подтверждает фикс.
- [x] Юнит-тесты `GanttSettingsModal.test.tsx` проходят.
- [x] `npm run lint:eslint -- --fix` чистый по затронутым файлам.

## Зависимости

- Зависит от: [TASK-27](./TASK-27-gantt-settings-modal.md) (исходный модальный компонент).

---

## Результаты

**Дата**: 2026-04-21

**Агент**: Claude Opus 4.7 (parent)

**Статус**: VERIFICATION — визуально подтверждено в Storybook.

**Что сделано**:

- `GanttSettingsModal.tsx`: обёртка `<Form.Item label=" " colon={false}>` для action-buttons в строках quick/exclusion filters; убран `marginTop: 30`.
- `GanttSettingsModal.stories.tsx`: добавлена story `WithJqlValidationError` с заведомо невалидным JQL — открывается через `iframe.html?id=…&viewMode=story`, проверяется глазами.

**Проблемы и решения**:

**Проблема 1: Storybook не сразу показал новую story**

- Контекст: после добавления `WithJqlValidationError` карта историй не обновлялась в side-panel.
- Решение: подтверждён id story в `index.json`, перешли по прямой ссылке на iframe → preview подтянулся; сам код сторибука валидный.
