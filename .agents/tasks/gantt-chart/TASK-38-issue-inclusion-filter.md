# TASK-38: Фильтрация задач по типу связи не работает (FR-5)

**Статус**: VERIFICATION
**Тип**: bugfix
**Приоритет**: high

## Описание
`computeBars` не фильтрует задачи по `includeSubtasks`, `includeEpicChildren`, `includeIssueLinks`. Все загруженные задачи отображаются на ганте независимо от настроек включения.

Нужно:
1. Добавить `rootIssueKey` параметр в `computeBars` для определения связи
2. Классифицировать каждую задачу: subtask (parent=root), epic child (Epic Link=root), issue link (остальные)
3. Фильтровать по `includeSubtasks`, `includeEpicChildren`, `includeIssueLinks`
4. Для issue links — фильтровать по `issueLinkTypesToInclude` если массив не пуст

## Файлы
- `src/features/gantt-chart/utils/computeBars.ts`
- `src/features/gantt-chart/utils/computeBars.test.ts`
- `src/features/gantt-chart/models/GanttDataModel.ts`

## Критерии приёмки
- [ ] При `includeSubtasks=false` прямые подзадачи не показываются
- [ ] При `includeEpicChildren=false` дочерние эпика не показываются
- [ ] При `includeIssueLinks=false` связанные задачи не показываются
- [ ] Тесты на каждый кейс
- [ ] ESLint + тесты
