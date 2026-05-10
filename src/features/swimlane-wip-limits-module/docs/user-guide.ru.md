# Лимиты WIP по swimlane

| | |
|---|---|
| Где настраивается | Настройки доски → Swimlanes → **«Настроить WIP-лимиты»** |
| Где видно | Доска (детальный вид) |
| Настройки действуют | Для всей команды |

## Цель

Задать отдельный лимит незавершённой работы для каждой строки swimlane. Возможна фильтрация по типам задач для каждой дорожки. Дополняет групповые лимиты по колонкам, создавая многоуровневый контроль WIP.


<div class="feature-mockup">
  <div class="mockup-board">
    <div class="mockup-swimlane">
      <div class="mockup-swimlane-header">Team Frontend <span class="mockup-wip-badge mockup-wip-badge--green">2/5</span></div>
      <div class="mockup-columns">
        <div class="mockup-col"><div class="mockup-col-header">To Do</div><div class="mockup-card">TASK-101</div></div>
        <div class="mockup-col"><div class="mockup-col-header">In Progress</div><div class="mockup-card">TASK-99</div></div>
        <div class="mockup-col"><div class="mockup-col-header">Done</div><div class="mockup-card">TASK-90</div></div>
      </div>
    </div>
    <div class="mockup-swimlane">
      <div class="mockup-swimlane-header">Team Backend <span class="mockup-wip-badge mockup-wip-badge--red">4/3</span></div>
      <div class="mockup-columns">
        <div class="mockup-col"><div class="mockup-col-header">To Do</div><div class="mockup-card">TASK-201</div></div>
        <div class="mockup-col"><div class="mockup-col-header">In Progress</div><div class="mockup-card mockup-card--warn">TASK-199</div><div class="mockup-card mockup-card--warn">TASK-198</div></div>
        <div class="mockup-col"><div class="mockup-col-header">Done</div></div>
      </div>
    </div>
  </div>
</div>

## Как настроить

### Где найти настройки

1. Откройте **«Настройки доски»**.
2. Перейдите на вкладку **«Swimlanes»**.
3. В стандартном элементе Jira установите стратегию swimlane в **«Custom»**.
4. Нажмите **«Настроить WIP-лимиты»**.

### Как настроить

В модальном окне для каждой swimlane доски доступна настройка:

- **«Лимит»** — числовой порог незавершённой работы для дорожки.
- **«Типы задач»** — сузьте учёт до конкретных типов (Bug, Task, Story и т.д.).

Нажмите **«ОК»**, чтобы сохранить все изменения, или **«Отмена»**, чтобы отменить.

## Как использовать

- Если у swimlane задан лимит, в её заголовке отображается бейдж **счётчик / лимит**.
- При превышении лимита заголовок дорожки **подсвечивается** красным.
- Дорожки без активного лимита ведут себя как обычные swimlane в Jira.
- Завершённые задачи исключаются из подсчёта; учёт подзадач соответствует общим настройкам доски, как и в других WIP-функциях.

## Сценарии использования

- «Хочу задать отдельный WIP-лимит для каждой дорожки.»
- «Хочу, чтобы в конкретной swimlane считались только баги.»
- «Хочу сразу видеть, какие дорожки перегружены.»

## См. также

- [Групповые лимиты WIP по колонкам](/docs/features/wip-limits/column-limits)
- [Персональные лимиты WIP](/docs/features/wip-limits/personal-limits)
- [Лимиты WIP по значениям полей](/docs/features/wip-limits/field-limits)
- [Общие настройки](/docs/settings)
