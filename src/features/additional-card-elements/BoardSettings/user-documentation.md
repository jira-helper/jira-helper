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

# Пользовательская документация: Бейдж "Дней в колонке"

## 🇷🇺 Русский

### Обзор

Функция "Дней в колонке" показывает, сколько дней задача находится в текущей колонке доски. Это помогает быстро определять "застрявшие" задачи и настраивать цветовые пороги для выделения проблемных задач.

### Настройка функции

#### Шаг 1: Включение функции

1. Откройте настройки доски (Board Settings)
2. Найдите раздел **"Additional Card Elements"** (Дополнительные элементы карточек)
3. Убедитесь, что функция **"Включить показ дополнительных элементов"** включена
4. Найдите раздел **"Бейдж 'Дней в колонке'"**
5. Установите чекбокс **"Показывать бейдж с днями в колонке"**

#### Шаг 2: Выбор режима порогов

У вас есть два варианта настройки порогов:

**Глобальные пороги** (по умолчанию):
- Одинаковые пороги применяются ко всем колонкам
- Удобно, когда время в колонке имеет одинаковое значение для всех этапов работы

**Отдельные правила для каждой колонки**:
- Можно задать разные пороги для разных колонок
- Удобно, когда для разных этапов работы приемлемо разное время (например, тестирование — не более 3 дней, разработка — до 10 дней)

#### Шаг 3: Настройка глобальных порогов

Если выбран режим глобальных порогов:

1. **Порог желтого (Warning)**: Введите количество дней, после которого бейдж станет желтым
   - Оставьте пустым, если не хотите желтую подсветку
   - Минимальное значение: 1 день

2. **Порог красного (Danger)**: Введите количество дней, после которого бейдж станет красным
   - Оставьте пустым, если не хотите красную подсветку
   - Минимальное значение: 1 день

**Важно**: Если порог красного меньше или равен порогу желтого, появится предупреждение, но настройки можно сохранить.

#### Шаг 4: Настройка порогов по колонкам

Если выбран режим "Отдельные правила для каждой колонки":

1. Для каждой колонки из списка выбранных колонок отображается строка с настройками
2. В каждой строке можно задать:
   - **Порог желтого (Warning)**: Количество дней для желтой подсветки
   - **Порог красного (Danger)**: Количество дней для красной подсветки
3. Если колонка больше не существует на доске (была удалена или переименована):
   - Строка отображается с предупреждением
   - Появляется кнопка **"Удалить"** для очистки настроек этой колонки

### Отображение на карточках

#### Где отображается бейдж

**На доске**:
- Бейдж отображается в конце карточки (перед бейджем дедлайна, если он включен)
- Отображается только в выбранных колонках (из настроек "Выбор колонок")
- Отображается только если функция включена
- Стандартный счетчик дней Jira автоматически скрывается при включении функции

**В беклоге**:
- Бейдж не отображается (в беклоге нет колонок)

#### Как выглядит бейдж

- Формат текста:
  - `0 дней`: "<1 day in column" / "<1 дн. в колонке"
  - `1 день`: "1 day in column" / "1 дн. в колонке"
  - `2+ дня`: "X days in column" / "X дн. в колонке"

- Цветовая схема:
  - **Синий**: Пороги не заданы или количество дней меньше порога желтого
  - **Желтый**: Количество дней достигло или превысило порог желтого (но меньше порога красного)
  - **Красный**: Количество дней достигло или превысило порог красного

- При использовании порогов по колонкам:
  - Для каждой колонки используются свои пороги
  - Если для колонки пороги не заданы — бейдж всегда синий

### Примеры использования

#### Пример 1: Глобальные пороги

**Задача**: Подсвечивать задачи, которые находятся в колонке более 3 дней (желтый) или более 7 дней (красный)

**Настройки**:
- Включить бейдж: Да
- Отдельные правила для колонок: Нет
- Порог желтого: 3
- Порог красного: 7

#### Пример 2: Пороги по колонкам

**Задача**: Разные пороги для разных этапов работы
- Тестирование: желтый после 2 дней, красный после 4 дней
- Разработка: желтый после 5 дней, красный после 10 дней
- Code Review: желтый после 1 дня, красный после 3 дней

**Настройки**:
- Включить бейдж: Да
- Отдельные правила для колонок: Да
- Тестирование: Warning = 2, Danger = 4
- Разработка: Warning = 5, Danger = 10
- Code Review: Warning = 1, Danger = 3

### Советы и рекомендации

1. **Выбор режима**: Используйте глобальные пороги для простых случаев, пороги по колонкам — когда разные этапы требуют разного времени
2. **Настройка порогов**: Начните с консервативных значений и корректируйте на основе реальных данных
3. **Удаление колонок**: Если колонка была удалена, не забудьте удалить её настройки, чтобы не засорять конфигурацию

---

## 🇬🇧 English

### Overview

The "Days in Column" feature shows how many days an issue has been in the current board column. This helps quickly identify "stuck" issues and configure color thresholds to highlight problematic issues.

### Setting Up the Feature

#### Step 1: Enabling the Feature

1. Open Board Settings
2. Find the **"Additional Card Elements"** section
3. Make sure **"Enable additional card elements"** is checked
4. Find the **"Days in Column Badge"** section
5. Check the **"Show days in column badge"** checkbox

#### Step 2: Choosing Threshold Mode

You have two options for configuring thresholds:

**Global Thresholds** (default):
- Same thresholds apply to all columns
- Useful when time in column has the same meaning for all workflow stages

**Per-Column Rules**:
- Different thresholds can be set for different columns
- Useful when different workflow stages have different acceptable timeframes (e.g., testing — max 3 days, development — up to 10 days)

#### Step 3: Configuring Global Thresholds

If global thresholds mode is selected:

1. **Warning (yellow) threshold**: Enter the number of days after which the badge becomes yellow
   - Leave empty if you don't want yellow highlighting
   - Minimum value: 1 day

2. **Danger (red) threshold**: Enter the number of days after which the badge becomes red
   - Leave empty if you don't want red highlighting
   - Minimum value: 1 day

**Note**: If the danger threshold is less than or equal to the warning threshold, a warning will appear, but settings can still be saved.

#### Step 4: Configuring Per-Column Thresholds

If "Use separate rules for each column" mode is selected:

1. For each column from the selected columns list, a row with settings is displayed
2. In each row you can set:
   - **Warning (yellow) threshold**: Number of days for yellow highlighting
   - **Danger (red) threshold**: Number of days for red highlighting
3. If a column no longer exists on the board (was deleted or renamed):
   - The row is displayed with a warning
   - A **"Remove"** button appears to clear settings for that column

### Display on Cards

#### Where the Badge Is Displayed

**On the Board**:
- Badge is displayed at the end of the card (before the deadline badge if enabled)
- Only shown in selected columns (from "Column Selection" settings)
- Only shown if the feature is enabled
- Default Jira days counter is automatically hidden when the feature is enabled

**In the Backlog**:
- Badge is not displayed (backlog has no columns)

#### How the Badge Looks

- Text format:
  - `0 days`: "<1 day in column"
  - `1 day`: "1 day in column"
  - `2+ days`: "X days in column"

- Color scheme:
  - **Blue**: Thresholds not set or days count is below warning threshold
  - **Yellow**: Days count reached or exceeded warning threshold (but below danger threshold)
  - **Red**: Days count reached or exceeded danger threshold

- When using per-column thresholds:
  - Each column uses its own thresholds
  - If thresholds are not set for a column — badge is always blue

### Usage Examples

#### Example 1: Global Thresholds

**Goal**: Highlight issues that have been in a column for more than 3 days (yellow) or more than 7 days (red)

**Settings**:
- Enable badge: Yes
- Use separate rules for columns: No
- Warning threshold: 3
- Danger threshold: 7

#### Example 2: Per-Column Thresholds

**Goal**: Different thresholds for different workflow stages
- Testing: yellow after 2 days, red after 4 days
- Development: yellow after 5 days, red after 10 days
- Code Review: yellow after 1 day, red after 3 days

**Settings**:
- Enable badge: Yes
- Use separate rules for columns: Yes
- Testing: Warning = 2, Danger = 4
- Development: Warning = 5, Danger = 10
- Code Review: Warning = 1, Danger = 3

### Tips and Recommendations

1. **Mode Selection**: Use global thresholds for simple cases, per-column thresholds when different stages require different timeframes
2. **Threshold Configuration**: Start with conservative values and adjust based on real data
3. **Removing Columns**: If a column was deleted, remember to remove its settings to keep configuration clean

---

# Пользовательская документация: Бейдж "Дней до дедлайна"

## 🇷🇺 Русский

### Обзор

Функция "Дней до дедлайна" показывает, сколько дней осталось до дедлайна задачи. Это помогает быстро определять задачи с приближающимся или пропущенным дедлайном.

### Настройка функции

#### Шаг 1: Включение функции

1. Откройте настройки доски (Board Settings)
2. Найдите раздел **"Additional Card Elements"** (Дополнительные элементы карточек)
3. Убедитесь, что функция **"Включить показ дополнительных элементов"** включена
4. Найдите раздел **"Бейдж 'Дней до дедлайна'"**
5. Установите чекбокс **"Показывать бейдж с днями до дедлайна"**

#### Шаг 2: Выбор поля с дедлайном

1. В выпадающем списке **"Выбор поля"** выберите поле, которое содержит дату дедлайна
2. Доступны поля типов: `date`, `datetime`, `string`
3. Если поле не выбрано, бейдж не отображается
4. Список полей автоматически загружается из вашего проекта Jira

#### Шаг 3: Режим отображения

Выберите, когда показывать бейдж:

**Всегда** (по умолчанию):
- Бейдж показывается всегда, если у задачи есть дедлайн

**Менее X дней или просрочено**:
- Бейдж показывается только если:
  - Дедлайн просрочен (прошло больше дней, чем указано в дедлайне), ИЛИ
  - Осталось меньше или равно X дней до дедлайна
- Появляется дополнительное поле для ввода количества дней (X)
- Если поле не заполнено — показывается только просроченное

**Только просрочено**:
- Бейдж показывается только если дедлайн уже пропущен
- Порог желтого (Warning) не применяется в этом режиме

#### Шаг 4: Настройка порога желтого

1. **Порог желтого (Warning)**: Введите количество дней, при котором бейдж станет желтым
   - Оставьте пустым, если не хотите желтую подсветку
   - Минимальное значение: 0 дней
   - **Важно**: "Сегодня" (0 дней) и "Завтра" (1 день) всегда желтые, независимо от порога

### Отображение на карточках

#### Где отображается бейдж

**На доске**:
- Бейдж отображается в конце карточки (после бейджа "Дней в колонке", если он включен)
- Отображается только в выбранных колонках (из настроек "Выбор колонок")
- Отображается только если функция включена и поле дедлайна выбрано

**В беклоге**:
- Бейдж не отображается

#### Как выглядит бейдж

- Формат текста (с эмодзи ⏰ для визуального отличия):
  - Просрочено: "⏰ Просрочено на X дн." / "⏰ X days overdue"
  - Сегодня (0 дней): "⏰ Сегодня!" / "⏰ Due today!" — красный текст на желтом фоне
  - Завтра (1 день): "⏰ Завтра" / "⏰ Due tomorrow" — желтый фон
  - Осталось дней: "⏰ X дн." / "⏰ X days left"

- Цветовая схема:
  - **Красный**: Дедлайн просрочен (всегда, независимо от настроек)
  - **Желтый**: "Сегодня" (0 дней) или "Завтра" (1 день) — всегда, независимо от настроек
  - **Желтый**: Порог желтого задан и осталось дней ≤ порога
  - **Синий**: Остальные случаи

### Примеры использования

#### Пример 1: Всегда показывать дедлайн

**Задача**: Видеть дедлайн для всех задач с установленным дедлайном

**Настройки**:
- Включить бейдж: Да
- Поле дедлайна: "Due Date"
- Режим отображения: Всегда
- Порог желтого: 3

#### Пример 2: Показывать только приближающиеся дедлайны

**Задача**: Показывать бейдж только если до дедлайна осталось 5 дней или меньше, или если дедлайн просрочен

**Настройки**:
- Включить бейдж: Да
- Поле дедлайна: "Due Date"
- Режим отображения: Менее X дней или просрочено
- Порог отображения: 5
- Порог желтого: 3

#### Пример 3: Только просроченные

**Задача**: Показывать бейдж только для просроченных задач

**Настройки**:
- Включить бейдж: Да
- Поле дедлайна: "Due Date"
- Режим отображения: Только просрочено
- Порог желтого: не применяется

### Советы и рекомендации

1. **Выбор поля**: Убедитесь, что выбранное поле действительно содержит даты дедлайнов в вашем проекте
2. **Режим отображения**: Используйте "Менее X дней" для фокуса на приближающихся дедлайнах, "Только просрочено" — для отслеживания проблемных задач
3. **Порог желтого**: Учитывайте, что "Сегодня" и "Завтра" всегда желтые, независимо от порога

---

## 🇬🇧 English

### Overview

The "Days to Deadline" feature shows how many days are left until an issue's deadline. This helps quickly identify issues with approaching or missed deadlines.

### Setting Up the Feature

#### Step 1: Enabling the Feature

1. Open Board Settings
2. Find the **"Additional Card Elements"** section
3. Make sure **"Enable additional card elements"** is checked
4. Find the **"Days to Deadline Badge"** section
5. Check the **"Show days to deadline badge"** checkbox

#### Step 2: Selecting Deadline Field

1. In the **"Field Selection"** dropdown, select the field that contains the deadline date
2. Available field types: `date`, `datetime`, `string`
3. If no field is selected, the badge is not displayed
4. Field list is automatically loaded from your Jira project

#### Step 3: Display Mode

Choose when to show the badge:

**Always** (default):
- Badge is always shown if the issue has a deadline

**Less than X days or overdue**:
- Badge is shown only if:
  - Deadline is overdue (more days have passed than specified in deadline), OR
  - Less than or equal to X days remain until deadline
- An additional field appears for entering the number of days (X)
- If the field is not filled — only overdue issues are shown

**Overdue only**:
- Badge is shown only if the deadline has already been missed
- Warning (yellow) threshold is not applied in this mode

#### Step 4: Configuring Warning Threshold

1. **Warning (yellow) threshold**: Enter the number of days at which the badge becomes yellow
   - Leave empty if you don't want yellow highlighting
   - Minimum value: 0 days
   - **Note**: "Today" (0 days) and "Tomorrow" (1 day) are always yellow, regardless of threshold

### Display on Cards

#### Where the Badge Is Displayed

**On the Board**:
- Badge is displayed at the end of the card (after "Days in Column" badge if enabled)
- Only shown in selected columns (from "Column Selection" settings)
- Only shown if the feature is enabled and deadline field is selected

**In the Backlog**:
- Badge is not displayed

#### How the Badge Looks

- Text format (with ⏰ emoji for visual distinction):
  - Overdue: "⏰ X days overdue"
  - Today (0 days): "⏰ Due today!" — red text on yellow background
  - Tomorrow (1 day): "⏰ Due tomorrow" — yellow background
  - Days remaining: "⏰ X days left"

- Color scheme:
  - **Red**: Deadline is overdue (always, regardless of settings)
  - **Yellow**: "Today" (0 days) or "Tomorrow" (1 day) — always, regardless of settings
  - **Yellow**: Warning threshold is set and days remaining ≤ threshold
  - **Blue**: Other cases

### Usage Examples

#### Example 1: Always Show Deadline

**Goal**: See deadline for all issues with a set deadline

**Settings**:
- Enable badge: Yes
- Deadline field: "Due Date"
- Display mode: Always
- Warning threshold: 3

#### Example 2: Show Only Approaching Deadlines

**Goal**: Show badge only if 5 days or less remain until deadline, or if deadline is overdue

**Settings**:
- Enable badge: Yes
- Deadline field: "Due Date"
- Display mode: Less than X days or overdue
- Display threshold: 5
- Warning threshold: 3

#### Example 3: Overdue Only

**Goal**: Show badge only for overdue issues

**Settings**:
- Enable badge: Yes
- Deadline field: "Due Date"
- Display mode: Overdue only
- Warning threshold: not applicable

### Tips and Recommendations

1. **Field Selection**: Make sure the selected field actually contains deadline dates in your project
2. **Display Mode**: Use "Less than X days" to focus on approaching deadlines, "Overdue only" — to track problematic issues
3. **Warning Threshold**: Keep in mind that "Today" and "Tomorrow" are always yellow, regardless of threshold

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
