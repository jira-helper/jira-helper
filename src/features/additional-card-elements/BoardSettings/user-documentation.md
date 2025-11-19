# Пользовательская документация: Отображение связей между задачами

## 🇷🇺 Русский

### Обзор

Функция "Отображение связей между задачами" позволяет визуализировать связи между задачами прямо на карточках доски Jira. Связанные задачи отображаются в виде цветных бейджей под заголовком задачи, что помогает быстро понять контекст и зависимости между задачами.

### Настройка функции

#### Шаг 1: Включение функции

1. Откройте настройки доски (Board Settings)
2. Найдите раздел **"Additional Card Elements"** (Дополнительные элементы карточек)
3. Установите чекбокс **"Включить показ дополнительных элементов"**
4. Если чекбокс выключен, связи не будут отображаться на карточках

#### Шаг 2: Выбор колонок

1. В разделе **"Выбор колонок"** выберите колонки доски, в которых нужно показывать связи
2. Связи будут отображаться только в выбранных колонках
3. Если колонки не выбраны, связи не будут показываться на доске

#### Шаг 2.1: Показ в беклоге

1. В разделе **"Настройки колонок"** найдите чекбокс **"Показывать связи в беклоге"**
2. Установите чекбокс, если хотите видеть связи на карточках в беклоге
3. Связи в беклоге отображаются горизонтально (в ряд)
4. В беклоге не учитываются настройки колонок - связи показываются для всех задач, если функция включена

#### Шаг 3: Настройка конфигураций связей (Issue Links)

##### Добавление новой конфигурации

1. Нажмите кнопку **"Добавить конфигурацию связи"** (Add Link Configuration)
2. Появится новая карточка с настройками связи

##### Настройка конфигурации

**Название связи** (Link Name):
- Введите понятное название для конфигурации (например, "Родительские задачи")
- Максимальная длина: 20 символов
- Название отображается только в настройках, не на карточках

**Тип связи** (Link Type):
- Выберите тип связи из выпадающего списка
- Список автоматически загружается из вашего проекта Jira
- Примеры: "is Parent of", "relates to", "blocks", "is blocked by"

**Уникальные цвета для задач**:
- **Включено** (чекбокс отмечен): Каждая связанная задача получает автоматически сгенерированный уникальный цвет
- **Выключено** (чекбокс не отмечен): Все связанные задачи отображаются одним фиксированным цветом, который можно выбрать в ColorPicker

**Многострочное название** (Multiline Summary):
- **Включено**: Длинные названия задач переносятся на несколько строк
- **Выключено**: Длинные названия обрезаются троеточием, полное название видно при наведении мыши

**Задачи, для которых анализируем связи**:

- **"Учитывать все задачи"** (Track all tasks):
  - **Включено**: Связи анализируются для всех задач на доске
  - **Выключено**: Можно настроить фильтр для выбора конкретных задач

- **Фильтр задач** (отображается только если "Учитывать все задачи" выключено):
  - **Режим JQL**: Введите JQL запрос для фильтрации задач
    - Пример: `status = "In Progress"` - только задачи в статусе "In Progress"
    - Пример: `issueType = Project` - только задачи типа "Project"
  - **Режим "По полю"**: Выберите поле и значение
    - Пример: Поле "Issue Type" = "Project"
    - Пример: Поле "Labels" = "Business"

**Задачи, связи с которыми анализируем**:

- **"Учитывать все связанные задачи"** (Track all linked tasks):
  - **Включено**: Показываются все связанные задачи
  - **Выключено**: Можно настроить фильтр для выбора конкретных связанных задач

- **Фильтр связанных задач** (отображается только если "Учитывать все связанные задачи" выключено):
  - **Режим JQL**: Введите JQL запрос для фильтрации связанных задач
    - Пример: `status != Done` - только незавершенные задачи
    - Пример: `issueType = Project AND status != Done` - проекты в незавершенных статусах
  - **Режим "По полю"**: Выберите поле и значение для связанных задач

##### Удаление конфигурации

- Нажмите кнопку **"Удалить"** (Remove) в карточке конфигурации

### Отображение на карточках

#### Где отображаются связи

**На доске**:
- Связи отображаются под заголовком карточки
- Отображаются только в выбранных колонках
- Отображаются только если функция включена
- Отображаются только если задача подходит под условия из конфигурации
- Бейджи располагаются вертикально (друг под другом)

**В беклоге**:
- Связи отображаются в конце карточки
- Отображаются для всех задач (настройки колонок не учитываются)
- Отображаются только если функция включена и включен чекбокс "Показывать связи в беклоге"
- Отображаются только если задача подходит под условия из конфигурации
- Бейджи располагаются горизонтально (в ряд, с переносом при необходимости)

#### Как выглядят связи

- Каждая связанная задача отображается в виде цветного бейджа
- Цвет бейджа зависит от настроек:
  - Если в настройках указан фиксированный цвет - используется он
  - Если включены уникальные цвета - цвет генерируется автоматически на основе ключа и названия задачи
- На бейдже отображается название (summary) связанной задачи
- При клике на бейдж открывается связанная задача в новой вкладке

### Примеры использования

#### Пример 1: Показ всех родительских задач

**Задача**: Показать все задачи, которые являются родительскими для текущей задачи

**Настройки**:
- Название: "Родительские задачи"
- Тип связи: "is Parent of"
- Уникальные цвета: Включено
- Учитывать все задачи: Включено
- Учитывать все связанные задачи: Включено

#### Пример 2: Показ только проектов

**Задача**: Показать только задачи типа "Project", связанные с текущей задачей

**Настройки**:
- Название: "Проекты"
- Тип связи: "is Parent of"
- Уникальные цвета: Выключено, цвет: синий
- Учитывать все задачи: Включено
- Учитывать все связанные задачи: Выключено
- Фильтр связанных задач: Режим "По полю", Поле "Issue Type" = "Project"

#### Пример 3: Показ незавершенных проектов

**Задача**: Показать только незавершенные задачи типа "Project"

**Настройки**:
- Название: "Активные проекты"
- Тип связи: "is Parent of"
- Уникальные цвета: Включено
- Учитывать все задачи: Включено
- Учитывать все связанные задачи: Выключено
- Фильтр связанных задач: Режим JQL, запрос: `issueType = Project AND status != Done`

#### Пример 4: Комбинированный фильтр

**Задача**: Показать незавершенные проекты и задачи типа "Objective" с лейблом "Бизнес"

**Настройки**:
- Название: "Бизнес-задачи"
- Тип связи: "is Parent of"
- Уникальные цвета: Включено
- Учитывать все задачи: Включено
- Учитывать все связанные задачи: Выключено
- Фильтр связанных задач: Режим JQL, запрос: `(issueType = Project AND status != Done) OR (issueType = Objective AND labels = "Бизнес")`

### Советы и рекомендации

1. **Используйте понятные названия**: Названия конфигураций помогают быстро понять, какие связи отображаются
2. **Выбор колонок**: Не включайте отображение связей во всех колонках, если это не нужно. Это может замедлить загрузку доски
3. **Цвета**: Используйте фиксированные цвета для важных типов связей, чтобы они всегда были одинаковыми. Уникальные цвета полезны, когда нужно различать много разных связанных задач
4. **Многострочное отображение**: Включайте многострочное отображение, если названия задач часто длинные и важно видеть их полностью

---

## 🇬🇧 English

### Overview

The "Display Issue Links" feature allows you to visualize relationships between issues directly on Jira board cards. Linked issues are displayed as colored badges under the issue title, helping you quickly understand context and dependencies between issues.

### Setting Up the Feature

#### Step 1: Enabling the Feature

1. Open Board Settings
2. Find the **"Additional Card Elements"** section
3. Check the **"Enable additional card elements"** checkbox
4. If the checkbox is unchecked, links will not be displayed on cards

#### Step 2: Selecting Columns

1. In the **"Column Selection"** section, select the board columns where links should be displayed
2. Links will only be displayed in selected columns on the board
3. If no columns are selected, links will not be shown on the board

#### Step 2.1: Show in Backlog

1. In the **"Column Settings"** section, find the **"Show links in backlog"** checkbox
2. Check the box if you want to see links on cards in the backlog
3. Links in the backlog are displayed horizontally (in a row)
4. Column settings are not applied in the backlog - links are shown for all issues if the feature is enabled

#### Step 3: Configuring Issue Link Configurations

##### Adding a New Configuration

1. Click the **"Add Link Configuration"** button
2. A new card with link settings will appear

##### Configuring a Link

**Link Name**:
- Enter a clear name for the configuration (e.g., "Parent Tasks")
- Maximum length: 20 characters
- The name is only shown in settings, not on cards

**Link Type**:
- Select a link type from the dropdown list
- The list is automatically loaded from your Jira project
- Examples: "is Parent of", "relates to", "blocks", "is blocked by"

**Unique Colors for Tasks**:
- **Enabled** (checkbox checked): Each linked issue gets an automatically generated unique color
- **Disabled** (checkbox unchecked): All linked issues are displayed with one fixed color that you can select in the ColorPicker

**Multiline Summary**:
- **Enabled**: Long issue summaries wrap across multiple lines
- **Disabled**: Long summaries are truncated with ellipsis, full name visible on hover

**Tasks to Analyze Links For**:

- **"Track all tasks"**:
  - **Enabled**: Links are analyzed for all tasks on the board
  - **Disabled**: You can configure a filter to select specific tasks

- **Task Filter** (shown only if "Track all tasks" is disabled):
  - **JQL Mode**: Enter a JQL query to filter tasks
    - Example: `status = "In Progress"` - only tasks in "In Progress" status
    - Example: `issueType = Project` - only "Project" type issues
  - **Field Mode**: Select a field and value
    - Example: Field "Issue Type" = "Project"
    - Example: Field "Labels" = "Business"

**Linked Tasks to Display**:

- **"Track all linked tasks"**:
  - **Enabled**: All linked tasks are shown
  - **Disabled**: You can configure a filter to select specific linked tasks

- **Linked Task Filter** (shown only if "Track all linked tasks" is disabled):
  - **JQL Mode**: Enter a JQL query to filter linked tasks
    - Example: `status != Done` - only incomplete tasks
    - Example: `issueType = Project AND status != Done` - projects in incomplete statuses
  - **Field Mode**: Select a field and value for linked tasks

##### Removing a Configuration

- Click the **"Remove"** button in the configuration card

### Display on Cards

#### Where Links Are Displayed

**On the Board**:
- Links are displayed under the card title
- Only shown in selected columns
- Only shown if the feature is enabled
- Only shown if the issue matches the configuration conditions
- Badges are arranged vertically (one below another)

**In the Backlog**:
- Links are displayed at the end of the card
- Shown for all issues (column settings are not applied)
- Only shown if the feature is enabled and "Show links in backlog" checkbox is checked
- Only shown if the issue matches the configuration conditions
- Badges are arranged horizontally (in a row, wrapping when needed)

#### How Links Look

- Each linked issue is displayed as a colored badge
- Badge color depends on settings:
  - If a fixed color is specified in settings - it is used
  - If unique colors are enabled - color is automatically generated based on issue key and summary
- The badge displays the summary of the linked issue
- Clicking the badge opens the linked issue in a new tab

### Usage Examples

#### Example 1: Show All Parent Tasks

**Goal**: Display all tasks that are parents of the current task

**Settings**:
- Name: "Parent Tasks"
- Link Type: "is Parent of"
- Unique Colors: Enabled
- Track all tasks: Enabled
- Track all linked tasks: Enabled

#### Example 2: Show Only Projects

**Goal**: Display only "Project" type issues linked to the current task

**Settings**:
- Name: "Projects"
- Link Type: "is Parent of"
- Unique Colors: Disabled, color: blue
- Track all tasks: Enabled
- Track all linked tasks: Disabled
- Linked Task Filter: Field Mode, Field "Issue Type" = "Project"

#### Example 3: Show Incomplete Projects

**Goal**: Display only incomplete "Project" type issues

**Settings**:
- Name: "Active Projects"
- Link Type: "is Parent of"
- Unique Colors: Enabled
- Track all tasks: Enabled
- Track all linked tasks: Disabled
- Linked Task Filter: JQL Mode, query: `issueType = Project AND status != Done`

#### Example 4: Combined Filter

**Goal**: Show incomplete projects and "Objective" type issues with "Business" label

**Settings**:
- Name: "Business Tasks"
- Link Type: "is Parent of"
- Unique Colors: Enabled
- Track all tasks: Enabled
- Track all linked tasks: Disabled
- Linked Task Filter: JQL Mode, query: `(issueType = Project AND status != Done) OR (issueType = Objective AND labels = "Business")`

### Tips and Recommendations

1. **Use Clear Names**: Configuration names help quickly understand which links are displayed
2. **Column Selection**: Don't enable link display in all columns if not needed. This can slow down board loading
3. **Colors**: Use fixed colors for important link types so they're always the same. Unique colors are useful when you need to distinguish many different linked issues
4. **Multiline Display**: Enable multiline display if issue summaries are often long and it's important to see them fully
