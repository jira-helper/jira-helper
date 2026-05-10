# Issue Links Display

| | |
|---|---|
| Где настраивается | «Board Settings» → «Additional Card Elements» → «Issue Links» |
| Где видно | Board (detail view + backlog) |
| Settings apply to | For the whole team ||

## Цель

Отображать связанные задачи прямо на карточках доски в виде цветных бейджей под заголовком (summary) задачи, чтобы быстро видеть контекст и зависимости.

<div class="feature-mockup">
  <div class="mockup-board">
    <div class="mockup-columns">
      <div class="mockup-col"><div class="mockup-col-header">In Progress</div>
        <div class="mockup-card">TASK-99 API <div class="mockup-link-chip blocks">← PROJ-12</div><div class="mockup-link-chip relates">→ PROJ-34</div></div>
        <div class="mockup-card">TASK-101 <div class="mockup-link-chip blocks">← PROJ-13</div></div>
      </div>
    </div>
  </div>
</div>

## Как настроить

### Where to find settings

1. Откройте доску, затем **«Jira Helper»** → настройки доски.
2. Перейдите на вкладку **«Additional Card Elements»**.

### How to configure

- **Enable the feature**: включите главный переключатель **«Enable additional card elements»**.
- **Choose columns**: выберите колонки, в которых должны отображаться бейджи связей, в секции **«Column Selection»**.
- **Show links in backlog**: включите опцию, чтобы связи отображались и на карточках бэклога.
- **Add a link configuration**: нажмите **«Add Link Configuration»** и настройте правило:
  - **«Link Name»** — название конфигурации (до 20 символов, видно только в настройках).
  - **«Link Type»** — тип связи (например, «is Parent of», «blocks», «relates to»).
  - **«Unique Colors»** — включено: каждой связанной задаче назначается уникальный цвет; выключено: фиксированный цвет для всех.
  - **«Multiline Summary»** — включено: длинные названия переносятся на несколько строк.
  - **«Track all tasks»** — для каких задач анализировать связи (все или по JQL/фильтру).
  - **«Track all linked tasks»** — какие связанные задачи показывать (все или по JQL/фильтру).
- **Add multiple configurations**: при необходимости добавьте несколько конфигураций для разных типов связей.

## Как использовать

**На доске**:
- Бейджи отображаются вертикально под заголовком карточки в выбранных колонках.
- При клике на бейдж связанная задача открывается в новой вкладке.
- Цвет бейджа зависит от настроек: фиксированный или автоматически сгенерированный.

**В бэклоге**:
- При включённой опции **«Show links in backlog»** бейджи отображаются горизонтально (в ряд) в конце карточки.
- Настройки колонок в бэклоге не учитываются — связи показываются для всех задач.

## Сценарии использования

1. **Показ родительских задач** — настроить связь «is Parent of», видеть проект или эпик, к которому относится задача.
2. **Фильтрация по типу задачи** — показывать только связанные задачи типа «Project» с фильтром по JQL: `issueType = Project`.
3. **Фильтрация по статусу** — показывать только незавершённые связанные задачи: `status != Done`.
4. **Комбинированный фильтр** — `(issueType = Project AND status != Done) OR (issueType = Objective AND labels = "Business")`.

## Устранение неполадок

- **Бейджи не отображаются**: проверьте, что главный переключатель включён, выбраны колонки на доске и добавлена хотя бы одна конфигурация связей.
- **Связанные задачи не находятся**: убедитесь, что тип связи выбран корректно и задача действительно связана по этому типу.
- **Цвета не применяются**: при включённых уникальных цветах цвет генерируется автоматически; для фиксированного цвета выберите его в «ColorPicker».

## См. также

- [Days in Column](/docs/features/card-information/days-in-column)
- [Days to Deadline](/docs/features/card-information/days-to-deadline)
