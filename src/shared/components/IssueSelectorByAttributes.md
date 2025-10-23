# IssueSelectorByAttributes

Компонент используется для написания условий, под которые должны попадать Issue для выбора. Позволяет пользователю настроить фильтрацию задач по различным критериям.

## Режимы выбора

### 1. По полю (Field Mode)
- Пользователь выбирает поле из доступного списка полей Jira
- Указывает конкретное значение поля для фильтрации
- Поддерживает поиск по названию поля с фильтрацией
- Пример: поле "Priority" = "High"

### 2. По JQL (JQL Mode)  
- Пользователь вводит JQL запрос в текстовое поле
- Используется кастомный JQL-парсер `shared/jql/simpleJqlParser`
- Валидация JQL в реальном времени с отображением ошибок
- Поддержка сложных логических операций

## Структура компонента

### Props Interface
```typescript
interface IssueSelectorByAttributesProps {
  value: IssueSelector;
  onChange: (selector: IssueSelector) => void;
  fields: Array<{ id: string; name: string }>;
  mode?: 'field' | 'jql';
  placeholder?: string;
  disabled?: boolean;
  testIdPrefix?: string;
}
```

### Типы данных
```typescript
interface IssueSelector {
  mode: 'field' | 'jql';
  fieldId?: string;    // ID поля для режима 'field'
  value?: string;       // Значение поля для режима 'field'  
  jql?: string;         // JQL запрос для режима 'jql'
}
```

## Функциональность

### Переключение режимов
- Select компонент для выбора между "Field value" и "JQL"
- Автоматическое сохранение состояния при переключении
- Очистка неактивных полей при смене режима

### Режим "По полю"
- **Select поля**: Поиск и выбор из списка доступных полей Jira
- **Input значения**: Ввод конкретного значения для фильтрации
- **Валидация**: Проверка корректности выбранного поля и значения

### Режим "По JQL"
- **Input для JQL**: Многострочное поле для ввода JQL запроса
- **Валидация в реальном времени**: Парсинг JQL с отображением ошибок
- **Подсказки**: Информационный тултип с примерами JQL
- **Визуальная индикация**: Красная рамка и иконка ошибки при невалидном JQL

### Поддерживаемый JQL синтаксис
- **Операторы сравнения**: `=`, `!=`, `in`, `not in`, `~` (contains), `!~` (not contains)
- **Логические операторы**: `AND`, `OR`, `NOT`
- **Группировка**: Скобки `(...)`
- **Кавычки**: Поддержка `"Issue Size" = "Some Value"`
- **Специальные ключевые слова**: `EMPTY`, `is`, `is not`
- **Массивы**: `labels in (bug, urgent)`
- **Регистронезависимость**: Поля и операторы

### Примеры поддерживаемого JQL
```
project = THF
status != Done  
labels in (bug, urgent)
"Issue Size" = "Large"
Field1 = value AND Field2 != other
(Field1 = a OR Field2 = b) AND Field2 != c
Field1 is EMPTY
summary ~ win
```
