# Issue Condition Checks

| | |
|---|---|
| Где настраивается | «Board Settings» → «Additional Card Elements» → «Issue Condition Checks» |
| Где видно | Board (detail view) |
| Settings apply to | For the whole team ||

## Purpose

Отображать на карточках настраиваемые иконки-бейджи, когда задача (или связанные с ней подзадачи) удовлетворяет заданному JQL-условию. Позволяет быстро замечать важные состояния задач без открытия каждой из них.


<div class="feature-mockup">
  <div class="mockup-board">
    <div class="mockup-columns">
      <div class="mockup-col"><div class="mockup-col-header">In Progress</div>
        <div class="mockup-card"><span class="mockup-icon mockup-icon--warn">⚠</span> TASK-99 No reviewer</div>
        <div class="mockup-card"><span class="mockup-icon mockup-icon--ok">✓</span> TASK-101 All checks passed</div>
        <div class="mockup-card"><span class="mockup-icon mockup-icon--info">i</span> TASK-88 Needs estimation</div>
      </div>
    </div>
  </div>
</div>

## How to configure

### Where to find settings

1. Откройте доску, затем **«Jira Helper»** → настройки доски.
2. Перейдите на вкладку **«Additional Card Elements»**.

### How to configure

- **Enable the feature**: включите главный переключатель **«Enable additional card elements»**.
- **Choose columns**: выберите колонки для отображения бейджей в секции **«Column Selection»**.
- **Add a condition check**: в секции **«Issue Condition Checks»** нажмите **«Add Condition Check»** и настройте правило:
  - **«Name»** — название проверки (обязательно).
  - **«Tooltip Text»** — текст всплывающей подсказки при наведении на иконку (обязательно).
  - **«Mode»** — режим проверки:
    - **«Simple»** — проверяется только сама задача по JQL.
    - **«With Subtasks»** — задача проверяется по одному JQL, её подзадачи — по другому.
  - **«JQL»** — JQL-запрос для проверки задачи (или `issueJql` в режиме withSubtasks).
  - **«Subtask JQL»** — JQL-запрос для проверки подзадач (только в режиме withSubtasks).
  - **«Subtask Match Mode»** — **«any»** (хотя бы одна подзадача) или **«all»** (все подзадачи).
  - **«Subtask Sources»** — какие подзадачи учитывать: прямые подзадачи, дочерние задачи эпика, связанные задачи.
  - **«Icon»** — выбор иконки из набора (⚠️, ✅, 🔥, 🚀 и др.).
  - **«Color»** — цвет фона бейджа (опционально).
  - **«Animation»** — анимация иконки (**«None»**, **«Pulse»**, **«Breathe»**, **«Blink»**, **«Blink Fast»**, **«Shake»**).

## How to use

- Бейджи-иконки отображаются в нижней части карточки в выбранных колонках.
- При наведении на иконку показывается tooltip с текстом из настроек правила.
- При включённой анимации иконка привлекает дополнительное внимание (пульсация, мигание, покачивание).
- Если в настройках указан цвет фона, бейдж отображается на цветной подложке.
- В режиме **«With Subtasks»** можно настроить, чтобы условие проверялось не только для самой задачи, но и для её подзадач, дочерних задач эпика или связанных задач.
- В бэклоге бейджи не отображаются.

## Usage scenarios

1. **Блокирующие задачи** — иконка 🛑 с JQL `status = Blocked`, анимация Blink.
2. **Высокий приоритет** — иконка 🔥 с JQL `priority = Highest`.
3. **Задачи без исполнителя** — иконка ⚠️ с JQL `assignee is EMPTY`, жёлтый фон.
4. **Просроченные подзадачи** — режим withSubtasks, `subtaskJql: duedate < now()`, иконка ⏰, match mode `any`.
5. **Все подзадачи завершены** — режим withSubtasks, `subtaskJql: status = Done`, match mode `all`, иконка ✅.

## Troubleshooting

- **Иконка не отображается**: проверьте, что правило включено («Enabled»), JQL корректен, и задача действительно удовлетворяет условию.
- **JQL не работает**: используйте простые условия для проверки. JQL валидируется при вводе — ошибка подсвечивается в настройках.
- **Подзадачи не учитываются**: в режиме withSubtasks убедитесь, что выбраны нужные источники (Subtask Sources) и задача действительно имеет подзадачи.
- **Анимация не видна**: некоторые анимации (например, Breathe) малозаметны — попробуйте Blink или Shake для более явного эффекта.

## See also

- [Days in Column](/docs/features/card-information/days-in-column)
- [Days to Deadline](/docs/features/card-information/days-to-deadline)
- [Issue Links Display](/docs/features/card-information/issue-links-display)
