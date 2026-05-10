# Swimlane Histogram

| | |
|---|---|
| Где настраивается | No configuration required |
| Где видно | Board (detail view) |
| Settings apply to | Not required |

## Цель

Показать распределение задач по колонкам внутри каждого swimlane в виде компактной столбчатой диаграммы рядом с названием swimlane.

<div class="feature-mockup">
  <div class="mockup-board">
    <div class="mockup-swimlane-header">Team Frontend <span style="display:inline-flex;gap:2px;align-items:flex-end;height:16px;margin-left:8px;"><span style="background:#4c9aff;width:8px;height:12px;border-radius:2px 2px 0 0"></span><span style="background:#4c9aff;width:8px;height:6px;border-radius:2px 2px 0 0"></span><span style="background:#36b37e;width:8px;height:8px;border-radius:2px 2px 0 0"></span><span style="background:#ff5630;width:8px;height:14px;border-radius:2px 2px 0 0;background:#ff5630"></span><span style="font-size:0.6rem;color:#5e6c84">8</span></span></div>
  </div>
</div>

## Как настроить

### Where to find settings

No configuration required. The histogram appears automatically on supported board views (Scrum/Kanban) when swimlanes are enabled.

### How to configure

There are no settings to configure for this feature.

## Как использовать

- Рядом с названием каждого swimlane отображается горизонтальный ряд узких столбцов — по одному на каждую колонку доски.
- Высота столбца отражает долю задач этой колонки среди всех задач swimlane: чем выше столбец, тем больше задач в этой колонке.
- При наведении курсора (или фокусе) на столбец появляется всплывающая подсказка с названием колонки и количеством задач в ней.
- Цвета столбцов нейтрально-серые: светлые «заполнители» для пустых колонок, тёмные — для колонок с задачами.
- График обновляется автоматически при изменениях на доске.

## Сценарии использования

1. **Быстрая оценка распределения** — сразу видно, в каких колонках скопилось больше всего задач по каждому swimlane.
2. **Выявление узких мест** — swimlane с неравномерным распределением (например, все задачи в одной колонке) сигнализирует о потенциальной проблеме в потоке.
3. **Сравнение swimlanes** — визуальное сравнение гистограмм разных swimlanes помогает оценить равномерность загрузки команд или направлений.

## Устранение неполадок

- **Диаграмма не отображается**: убедитесь, что вы находитесь на детальном виде доски (Scrum/Kanban), а не на упрощённом или альтернативном виде, и что включены swimlanes.
- **Пустые столбцы не видны**: для пустых колонок используются очень светлые серые столбцы-заполнители — возможно, они сливаются с фоном при определённых настройках темы.

## См. также

- [Card Colors](/docs/features/board-visualization/card-colors)
- [Additional Card Elements — Days in Column](/docs/features/card-information/days-in-column)
