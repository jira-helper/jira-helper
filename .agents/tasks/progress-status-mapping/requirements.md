# Requirements: Настройка маппинга статусов для прогресс-бара

**Feature folder**: `.agents/tasks/progress-status-mapping/`
**Связанный request**: [request.md](./request.md)
**Дата**: 2026-04-28
**Статус**: agreed
**Has UI**: yes

## 1. Цель и мотивация

Нужно добавить возможность настраивать, к какой нормализованной категории прогресса относится каждый Jira-статус, чтобы прогресс-бар корректно работал для команд с кастомными workflow.

Сейчас прогресс-бар определяет категорию задачи `To Do` / `In Progress` / `Done` на основе категории статуса из Jira API. Для статусов вроде `Ready for Release` Jira может возвращать категорию `To Do`, хотя для команды такая задача почти завершена. Из-за этого прогресс эпика, свимлейна или набора задач искажается.

Критерий успеха: пользователь может явно сопоставить Jira-статусы с buckets прогресса, и это сопоставление сохраняется между сессиями отдельно для gantt и sub-tasks progress.

## 2. Пользователи и контекст

- Роли / контекст использования: пользователи jira-helper, которые настраивают отображение прогресса под workflow своей команды.
- Страницы Jira и точки входа:
  - настройки gantt;
  - настройки sub-tasks progress / progress-bar.
- Источник запроса: GitHub issue #21 `Feature: Настроить маппинг статусов для прогресс-бара в jira-helper`.

## 3. Функциональные требования

1. Пользователь должен уметь настроить маппинг `status -> нормализованная категория прогресса`.
2. В первой реализации доступны только существующие buckets прогресса: `To Do`, `In Progress`, `Done`.
3. По умолчанию должны работать стандартные Jira-статусы `To Do`, `In Progress`, `Done`.
4. UI настройки должен быть доступен в двух местах:
  - в gantt settings;
  - в sub-tasks progress settings.
5. Настройки должны сохраняться между сессиями.
6. Хранение должно оставаться раздельным по текущим feature-паттернам:
  - sub-tasks progress хранит настройку в Jira board property;
  - gantt хранит настройку через текущий механизм localStorage.
7. Один status должен маппиться в один bucket прогресса без комбинированных правил.
8. Сопоставление статуса должно хранить `status id` как стабильный ключ маппинга; сохранённый `status name` допускается только как fallback/debug label.
9. UI должен поддерживать поиск/автокомплит по существующим статусам из Jira REST `/rest/api/2/status` через существующий `JiraService.getStatuses()`; сохранять можно только выбранный из подсказок статус с известным `status id`.
10. Если статус не найден в подсказках автокомплита, пользователь не может сохранить произвольный текст как статус, потому что имя статуса зависит от языка Jira и не является стабильным ключом.
11. UI должен переиспользовать существующий паттерн выбора статуса из gantt settings (`useGetStatuses()` + Ant Design `Select` с поиском) или вынести его в общий компонент. Для новой настройки `value` должен быть `status.id`, а label должен браться из актуального `JiraService.getStatuses()`.
12. В scope входит исправление существующего gantt date-mapping `statusTransition`: настройка должна сохранять и сравнивать status id из Jira changelog (`from` / `to`), а отображаемые имена (`fromString` / `toString`) использовать только как fallback/debug/compatibility metadata.

## 4. Сценарии (happy path + важные края)

### S1: Настройка маппинга для sub-tasks progress

- Given пользователь находится в настройках sub-tasks progress
- When пользователь добавляет или меняет сопоставление Jira-статуса с bucket `To Do`, `In Progress` или `Done`
- Then настройка сохраняется в Jira board property и используется для расчёта прогресса sub-tasks progress.

### S2: Настройка маппинга для gantt

- Given пользователь находится в настройках gantt
- When пользователь добавляет или меняет сопоставление Jira-статуса с bucket `To Do`, `In Progress` или `Done`
- Then настройка сохраняется через текущий механизм localStorage и используется для расчёта прогресса gantt.

### S3: Выбор статуса из автокомплита

- Given в настройке доступны существующие Jira-статусы
- When пользователь вводит часть имени статуса
- Then UI предлагает подходящие статусы, а выбранное сопоставление сохраняет `status id` и fallback/debug `status name`.

### S4: Статус не найден в автокомплите

- Given нужного статуса нет в подсказках автокомплита
- When пользователь вводит текст в поле поиска
- Then UI не сохраняет произвольный текст как статус.
- And пользователь видит, что для сохранения нужно выбрать статус из найденных вариантов.

### S5: Стандартные статусы без ручной настройки

- Given пользователь не задавал кастомный маппинг
- When прогресс рассчитывается для стандартных Jira-статусов `To Do`, `In Progress`, `Done`
- Then они должны попадать в соответствующие buckets прогресса по умолчанию.

## 5. Данные и миграции

- Источник истины данных:
  - для sub-tasks progress: Jira board property;
  - для gantt: текущий механизм localStorage.
- Источник значений для автокомплита: существующий Jira API endpoint `/rest/api/2/status`, доступный в проекте как `JiraService.getStatuses()` и возвращающий `JiraStatus[]` с `id`, `name`, `statusCategory`.
- Референс существующего UI: выбор статуса в `GanttSettingsModal` для `statusTransition` уже использует `useGetStatuses()` и searchable Ant Design `Select`; для этой фичи его нужно адаптировать/переиспользовать с сохранением `status.id` вместо `status.name`.
- Jira changelog для изменения `status` возвращает `from` / `to` как id статусов и `fromString` / `toString` как отображаемые имена; gantt-расчёты и новые настройки не должны строиться на имени статуса.
- Для UI можно дополнительно подсвечивать статусы, уже встреченные в текущем контексте, но сохраняемый вариант всё равно должен приходить из списка Jira statuses и иметь `id`.
- Формат записи маппинга: связь `status id -> bucket`, где `status id` является стабильным ключом, а сохранённый `status name` хранится только как fallback/debug metadata.
- Точка истины для отображаемого имени статуса в UI — актуальные данные из `JiraService.getStatuses()`. Если список Jira statuses ещё не загружен или сохранённый `statusId` больше не найден, UI может показать сохранённый `statusName` как fallback.
- Расчёт прогресса сопоставляет статус только по `status id`.
- Имя статуса не используется для сопоставления, потому что оно может отличаться в разных языках Jira.
- Миграции / совместимость: добавить новый optional-блок настроек без обязательной миграции существующих сохранённых данных.
- Поведение для уже сохранённых настроек gantt или sub-tasks progress: существующие настройки продолжают работать, отсутствие нового блока означает дефолтное сопоставление Jira-статусов.

## 6. Нефункциональные требования

- Тестирование (уровень): определить на этапе проектирования; целевой набор — Vitest для логики маппинга/расчёта, Storybook для визуального состояния UI, Cypress component happy path для настройки маппинга.
- Производительность: UI автокомплита и расчёт прогресса не должны заметно замедлять работу доски или настроек; конкретные ограничения TBD.
- Доступность: настройки должны быть доступны для работы с клавиатуры и иметь понятные подписи; детали TBD.
- Ошибки сохранения board property / localStorage не нужно показывать отдельным пользовательским UI в рамках этой задачи.

## 7. Вне scope

- Кастомные новые сегменты прогресса кроме `To Do`, `In Progress`, `Done`.
- Авто-анализ или авто-определение Jira workflow.
- Автоматическое построение маппинга по workflow.
- Правила по issue type.
- Правила по link type / типам связей.
- Комбинированные правила и другие измерения кроме одного `status`.
- Единое общее хранилище настроек для gantt и sub-tasks progress.

## 8. Открытые вопросы

Нет.

## 9. Черновик критериев приёмки (для EPIC / BDD)

- В sub-tasks progress settings пользователь может сопоставить Jira-статус с bucket `To Do`, `In Progress` или `Done`.
- В gantt settings пользователь может сопоставить Jira-статус с bucket `To Do`, `In Progress` или `Done`.
- Sub-tasks progress сохраняет маппинг в Jira board property и восстанавливает его после перезагрузки.
- Gantt сохраняет маппинг через текущий localStorage-механизм и восстанавливает его после перезагрузки.
- Для стандартных статусов `To Do`, `In Progress`, `Done` работает дефолтное сопоставление.
- Статус можно выбрать из автокомплита существующих статусов.
- Если статуса нет в автокомплите, произвольный текст нельзя сохранить как статус без `status id`.
- Маппинг влияет только на связь `status -> To Do / In Progress / Done` и не добавляет кастомные сегменты, авто-workflow или правила по issue/link type.

## 10. UI Design

UI-решение согласовано после просмотра текущих Storybook stories настроек и временных mockup stories.

### Gantt settings

- Разместить блок `Status progress mapping` в модалке `GanttSettingsModal`.
- Вставить блок на таб `Bars` сразу после секций `Start of bar` и `End of bar`.
- Ниже блока оставить существующие секции `Bar tooltip fields` и `Bar colors`.
- Формат строки: searchable select Jira status + select progress bucket (`To Do`, `In Progress`, `Done`) + remove action.
- Кнопка добавления: `+ Add status mapping`.
- Select статуса должен использовать `status.id` как value и актуальный `status.name` из `JiraService.getStatuses()` как label; сохранённое имя можно показывать только fallback.

### Sub-tasks progress settings

- Разместить блок `Status progress mapping` на странице `BoardSettingsTabContent`.
- Вставить блок после `Counting settings` и перед `Task grouping`.
- Формат строки такой же, как в gantt: searchable select Jira status + select progress bucket + remove action.
- Кнопка добавления: `+ Add status mapping`.
- Select статуса должен использовать `status.id` как value и актуальный `status.name` из `JiraService.getStatuses()` как label; сохранённое имя можно показывать только fallback.

### Temporary Storybook Mockup

- Для согласования были созданы временные stories:
  - `GanttChart / IssuePage / GanttSettingsModal / Status Mapping Placement Mockup`
  - `SubTasksProgress / BoardSettings / BoardSettingsTabContent / Status Mapping Placement Mockup`
- Пользователь подтвердил выбранное размещение.
- Временные mockup stories не являются частью production design и должны быть удалены из кода после фиксации решения в requirements.

### JSX Mockup Reference

Код ниже фиксирует утверждённый UI-концепт. Это reference для проектирования и реализации, а не production-код.

```tsx
const statusOptions = jiraStatuses.map(status => ({
  value: status.id,
  label: status.name,
}));

const bucketOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'inProgress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const StatusProgressMappingRow = ({ value, onChange, onRemove }) => (
  <div className="jh-status-progress-mapping-row">
    <Select
      showSearch
      optionFilterProp="label"
      value={value.statusId}
      options={statusOptions}
      placeholder="Select Jira status"
      onChange={(statusId, option) =>
        onChange({
          ...value,
          statusId,
          statusName: option.label, // fallback/debug only; current UI label comes from Jira statuses by statusId
        })
      }
    />
    <Select
      value={value.bucket}
      options={bucketOptions}
      onChange={bucket => onChange({ ...value, bucket })}
    />
    <Button aria-label="Remove status mapping" onClick={onRemove}>
      x
    </Button>
  </div>
);

const StatusProgressMappingSection = ({ value, onChange }) => (
  <section>
    <SectionHeading
      hint="Override Jira status category for progress calculation. Status id is saved; current name comes from Jira, saved name is fallback/debug only."
    >
      Status progress mapping
    </SectionHeading>

    {value.map(row => (
      <StatusProgressMappingRow
        key={row.statusId}
        value={row}
        onChange={nextRow => updateRow(row.statusId, nextRow)}
        onRemove={() => removeRow(row.statusId)}
      />
    ))}

    <Button block type="dashed" onClick={addEmptyRow}>
      + Add status mapping
    </Button>
  </section>
);
```

Применение в `GanttSettingsModal`:

```tsx
const barsTab = (
  <>
    <DateMappingsSection listName="startMappings" />
    <DateMappingsSection listName="endMappings" />

    <StatusProgressMappingSection
      value={statusProgressMapping}
      onChange={setStatusProgressMapping}
    />

    <TooltipFieldsSection />
    <ColorRulesSection />
  </>
);
```

Применение в `BoardSettingsTabContent`:

```tsx
<>
  <ColumnsSettingsContainer />
  <CountSettings />

  <StatusProgressMappingContainer />

  <GroupingSettings />
</>
```

