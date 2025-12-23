# Additional Card Elements

Модуль для отображения дополнительных элементов на карточках задач в Jira.

---

# Общая архитектура

## Board Property

**Автосинхронизация**: При изменении настроек в сторе автоматически сохраняются в Board Property с throttling (5 секунд). При загрузке страницы настройки загружаются из Board Property.

**Реализация**:
- `loadAdditionalCardElementsBoardProperty` - загружает настройки при инициализации
- `autosyncStoreWithBoardProperty` - автоматически сохраняет изменения

```typescript
interface AdditionalCardElementsBoardProperty {
  enabled: boolean;
  columnsToTrack: string[];
  showInBacklog: boolean;
  
  issueLinks: IssueLinkConfig[];
  daysInColumn: DaysInColumnSettings;
  daysToDeadline: DaysToDeadlineSettings;
}
```

## Общие настройки (Settings UI)

- **Включение модуля**: Checkbox, связан с `enabled`. Если выключен - все элементы скрыты
- **Выбор колонок**: `Shared/ColumnsSelector`, связан с `columnsToTrack`
- **Показывать в беклоге**: Checkbox, связан с `showInBacklog`
- **Сброс настроек**: Button, сбрасывает на значения по умолчанию

## Общий компонент Badge

Универсальный бейдж для отображения информации на карточке.

**Props**: `text`, `color` (`blue` | `yellow` | `red`), `tooltip?`

---

# Фича: Issue Links

## User Story

Я хочу видеть на доске, с какой задачей связана каждая карточка. Как правило, это связь с задачей-проектом, привязанной через определенный тип связи.

**Кейсы**:
- Видеть все задачи, привязанные по связи `is Parent of`
- Видеть только задачи с типом Project по связи `is Parent of`
- Видеть задачи с типом Project в незавершенных статусах
- Видеть связи как на доске, так и в беклоге

## Типы данных

```typescript
interface IssueLinkConfig {
  name: string;
  linkType: { id: string; direction: 'inward' | 'outward' };
  color?: string;
  multilineSummary: boolean;
  trackAllTasks: boolean;
  issueSelector?: IssueSelector;
  trackAllLinkedTasks: boolean;
  linkedIssueSelector?: IssueSelector;
}
```

## Настройки (Settings UI)

При маунте загружаются типы связей через `useGetIssueLinkTypes`. Пока грузится - скелетон. Если пусто - сообщение об ошибке.

**Карточка одного IssueLink**:
- **Название**: Input в заголовке, связан с `name`, макс. 20 символов
- **Тип связи**: Dropdown, связан с `linkType` (id + direction)
- **Уникальные цвета**: Checkbox + ColorPicker, связан с `color`. Если `undefined` - уникальные цвета
- **Многострочность**: Checkbox, связан с `multilineSummary`
- **Для каких задач**: Checkbox "Все задачи" + `issueSelectorByAttributes`, связан с `trackAllTasks` и `issueSelector`
- **С какими задачами**: Checkbox "Все задачи" + `issueSelectorByAttributes`, связан с `trackAllLinkedTasks` и `linkedIssueSelector`

**Кнопка добавления**: Добавляет новый IssueLink с дефолтными параметрами

## Архитектура компонента

```
IssueLinkBadgesContainer(issueKey) → IssueLinkBadges(issueKey) → useGetIssueLinkBadgesData(issueKey) → IssueLinkBadge[]
```

- **Контейнер** (`IssueLinkBadgesContainer`): проверяет `enabled` и наличие `issueLinks`, передаёт `issueKey`
- **Компонент** (`IssueLinkBadges`): вызывает хук, рендерит список бейджей
- **Хук** (`useGetIssueLinkBadgesData`): получает данные issue, фильтрует связи по настройкам, вычисляет цвета
- **Бейдж** (`IssueLinkBadge`): отображает одну связь, клик открывает задачу

**Логика получения связей**:
1. Проверка задачи через `issueSelector` (если `trackAllTasks === false`)
2. Получение связей из `issue.fields.issuelinks` по `linkType.id` + `direction`
3. Фильтрация через `linkedIssueSelector` (если `trackAllLinkedTasks === false`)
4. Вычисление цвета: кастомный или автоматический по хешу

## Интеграция

### На доске
- **Контейнер**: `IssueLinkBadgesContainer` (position: `aftersummary`)
- **Условия**: `enabled=true`, колонка в `columnsToTrack`, есть настроенные `issueLinks`
- **Режим**: Вертикальный

### В беклоге
- **Контейнер**: `IssueLinkBadgesBacklogContainer` (в `.ghx-end`)
- **Условия**: `enabled=true`, `showInBacklog=true`, есть настроенные `issueLinks`
- **Режим**: Горизонтальный

## Тестирование

**Unit тесты**: Логика цветов, фильтрация связей, формирование ссылок
**Storybook**: Цвет из конфига / вычисленный, короткий / длинный Summary

---

# Фича: Days in Column

## User Story

Я хочу видеть, сколько дней задача находится в текущей колонке, чтобы быстро определять "застрявшие" задачи и настроить цветовые пороги для выделения проблемных задач.

## Типы данных

```typescript
interface DaysInColumnSettings {
  enabled: boolean;
  warningThreshold?: number; // undefined = не подсвечивать желтым
  dangerThreshold?: number;  // undefined = не подсвечивать красным
}
```

## Настройки (Settings UI)

- **Включение**: Checkbox, связан с `daysInColumn.enabled`
- **Порог желтого**: InputNumber (placeholder: "Не задано", min: 1), связан с `warningThreshold`
- **Порог красного**: InputNumber (placeholder: "Не задано", min: 1), связан с `dangerThreshold`
- **Валидация**: Alert если `dangerThreshold <= warningThreshold`. Сохранение НЕ блокируется

## Архитектура компонента

```
CardStatusBadgesContainer(issueKey) → DaysInColumnBadge(issueKey) → useGetDaysInColumnData(issueKey) → Badge
```

- **Контейнер** (`CardStatusBadgesContainer`): проверяет `enabled` и `daysInColumn.enabled`, передаёт `issueKey`
- **Компонент** (`DaysInColumnBadge`): вызывает хук, рендерит Badge или null
- **Хук** (`useGetDaysInColumnData`): парсит дни из DOM (`.ghx-days`), получает настройки из store, вызывает pure-функции для цвета и текста
- **Pure-функции**: `getDaysInColumnColor(days, settings)`, `formatDaysInColumn(days)`

**Получение данных**: Парсинг элемента `.ghx-days` на карточке, извлечение числа из `data-tooltip`

**Цветовая схема**:
- Синий: пороги не заданы или `days < warningThreshold`
- Желтый: `warningThreshold` задан и `days >= warningThreshold`
- Красный: `dangerThreshold` задан и `days >= dangerThreshold`

**Формат текста**:
- `days === 0`: "<1 дн. в колонке" / "<1 day in column"
- `days >= 1`: "X дн. в колонке" / "X day(s) in column"

**Скрытие стандартных точек**: При включении фичи вызывается `BoardPagePageObject.hideDaysInColumn()`, который добавляет CSS правило для скрытия `.ghx-days` элементов

## Интеграция

### На доске
- **Контейнер**: `CardStatusBadgesContainer` (position: `beforeend`)
- **Условия**: `enabled=true`, `daysInColumn.enabled=true`, колонка в `columnsToTrack`
- **Порядок**: Первый бейдж в контейнере

### В беклоге
- **НЕ отображается** (в беклоге нет колонок)

## Тестирование

**Unit тесты**: Всегда синий без порогов, цвета с порогами, работа при `danger < warning`, парсинг из DOM
**Storybook**: Различные комбинации дней и порогов

---

# Фича: Days to Deadline

## User Story

Я хочу видеть, сколько дней осталось до дедлайна задачи, чтобы быстро определять задачи с приближающимся или пропущенным дедлайном. Хочу выбрать поле с датой дедлайна.

## Типы данных

```typescript
type DaysToDeadlineDisplayMode = 'always' | 'lessThanOrOverdue' | 'overdueOnly';

interface DaysToDeadlineSettings {
  enabled: boolean;
  fieldId?: string;                    // undefined = поле не выбрано
  displayMode?: DaysToDeadlineDisplayMode; // По умолчанию 'always'
  displayThreshold?: number;           // Для режима 'lessThanOrOverdue'
  warningThreshold?: number;           // undefined = только красный при просрочке
}
```

## Настройки (Settings UI)

- **Включение**: Checkbox, связан с `daysToDeadline.enabled`
- **Выбор поля**: Dropdown, загружает поля через `useGetFields`, фильтрует типы `date`, `datetime`, `string`. Связан с `fieldId`. Placeholder: "Выберите поле". Бейдж не отображается, пока поле не выбрано
- **Режим отображения**: Radio.Group с опциями:
  - `always` - "Всегда" (по умолчанию)
  - `lessThanOrOverdue` - "Менее Х дней или просрочено"
  - `overdueOnly` - "Только просрочено"
- **Порог отображения**: InputNumber (появляется только при режиме `lessThanOrOverdue`), связан с `displayThreshold`. Если не задан - показывается только просроченное
- **Порог желтого**: InputNumber (placeholder: "Не задано", min: 0), связан с `warningThreshold`

## Архитектура компонента

```
CardStatusBadgesContainer(issueKey) → DaysToDeadlineBadge(issueKey) → useGetDaysToDeadlineData(issueKey) → Badge
```

- **Контейнер** (`CardStatusBadgesContainer`): проверяет `enabled` и `daysToDeadline.enabled`, передаёт `issueKey`
- **Компонент** (`DaysToDeadlineBadge`): вызывает хук, рендерит Badge или null
- **Хук** (`useGetDaysToDeadlineData`): загружает данные issue через `fetchJiraIssue`, извлекает значение поля `fieldId`, вычисляет дни, проверяет режим отображения, вычисляет цвет
- **Pure-функции**: `calculateDaysRemaining(date)`, `getDaysToDeadlineColor(days, settings)`, `formatDaysToDeadline(days)`

**Логика отображения по режимам**:
- `always`: бейдж отображается всегда (если есть дедлайн)
- `overdueOnly`: бейдж отображается только если `days < 0` (просрочено)
- `lessThanOrOverdue`: бейдж отображается если `days < 0` (просрочено) ИЛИ `days <= displayThreshold`. Если `displayThreshold` не задан - показывается только просроченное

**Цветовая схема**:
- Красный: `days < 0` (просрочено) — всегда, независимо от настроек
- Желтый: `days === 0` (сегодня) или `days === 1` (завтра) — всегда, независимо от настроек
- Желтый: `warningThreshold` задан и `days <= warningThreshold`
- Синий: остальные случаи

**Формат текста** (с эмодзи ⏰ для визуального отличия от Days in Column):
- `days < 0`: "⏰ Просрочено на X дн." / "⏰ X days overdue"
- `days === 0`: "⏰ Сегодня!" / "⏰ Due today!"
- `days === 1`: "⏰ Завтра" / "⏰ Due tomorrow"
- `days > 1`: "⏰ X дн." / "⏰ X days left"

**Условия НЕ отображения**: 
- Поле не выбрано
- Значение пустое или не удалось распарсить дату
- Режим `overdueOnly` и задача не просрочена
- Режим `lessThanOrOverdue` и дней осталось больше порога (и не просрочено)

## Интеграция

### На доске
- **Контейнер**: `CardStatusBadgesContainer` (position: `beforeend`)
- **Условия**: `enabled=true`, `daysToDeadline.enabled=true`, `fieldId` задан, колонка в `columnsToTrack`
- **Порядок**: Второй бейдж в контейнере (после DaysInColumn)

### В беклоге
- **НЕ отображается** (в беклоге показываются только Issue Links)

## Тестирование

**Unit тесты**: Красный при просрочке, синий/желтый по порогам, расчёт дней, парсинг дат
**Storybook**: Различные комбинации дней до дедлайна и порогов, просрочка, без дедлайна

---

# Контейнеры интеграции

## IssueLinkBadgesContainer (Board Page)

- **Расположение**: position: `aftersummary`
- **Содержимое**: Только Issue Links
- **Условия**: `enabled=true`, колонка в `columnsToTrack`, есть `issueLinks`

## CardStatusBadgesContainer (Board Page)

- **Расположение**: position: `beforeend`
- **Содержимое**: DaysInColumnBadge + DaysToDeadlineBadge
- **Условия**: `enabled=true`, колонка в `columnsToTrack`, хотя бы одна фича включена

## IssueLinkBadgesBacklogContainer (Backlog Page)

- **Расположение**: в `.ghx-end`
- **Содержимое**: Только Issue Links (горизонтальный режим)
- **Условия**: `enabled=true`, `showInBacklog=true`, есть `issueLinks`
- **Важно**: В беклоге отображаются **только Issue Links**

## Интеграция в страницы

**Board Page** (`AdditionalCardElementsBoardPage`):
1. Загружает настройки и настраивает автосинхронизацию
2. Подписывается на карточки через `BoardPagePageObject.listenCards`
3. Для каждой карточки прикрепляет `IssueLinkBadgesContainer` (aftersummary) и `CardStatusBadgesContainer` (beforeend)

**Backlog Page** (`AdditionalCardElementsBoardBacklogPage`):
1. Загружает настройки
2. Подписывается на карточки через `BoardBacklogPagePageObject.listenCards`
3. Для каждой карточки прикрепляет только `IssueLinkBadgesBacklogContainer` (в `.ghx-end`)
