# Release Notes - Version 2.28.0

## 🇷🇺 RU

### ✨ Новый функционал: Отображение связей между задачами на карточках
Новый функционал, который позволяет визуализировать связи между задачами прямо на карточках доски Jira. Теперь вы можете видеть связанные задачи в виде цветных бейджей под заголовком задачи.

#### Основные возможности:

- **Настройка отображения связей**: Создавайте конфигурации для отображения различных типов связей между задачами
- **Гибкая фильтрация**: Настраивайте, для каких задач анализировать связи и какие связанные задачи показывать
- **Цветовая индикация**: Используйте фиксированные цвета или автоматически генерируемые уникальные цвета для каждой связанной задачи
- **Выбор колонок**: Указывайте, в каких колонках доски показывать связи
- **Многострочное отображение**: Настройте перенос длинных названий задач на несколько строк

#### Как использовать:

1. Откройте настройки доски (Board Settings)
2. Найдите раздел "Additional Card Elements"
3. Включите функцию отображения связей
4. Выберите колонки, в которых нужно показывать связи
5. Добавьте конфигурации связей (Issue Links) с нужными параметрами
6. Настройте фильтры для задач и связанных задач при необходимости

#### Примеры использования:

- Отображение всех родительских задач для текущей задачи
- Показ только задач типа "Project", связанных с текущей задачей
- Фильтрация по статусам: показывать только незавершенные связанные задачи
- Комбинированные фильтры: например, задачи типа "Project" в незавершенных статусах или задачи типа "Objective" с определенным лейблом

---

## 🇬🇧 English

### ✨ New Feature: Display Issue Links on Cards

New feature that allows you to visualize relationships between issues directly on Jira board cards. You can now see linked issues as colored badges on each card.

#### Key Features:

- **Link Configuration**: Create configurations to display different types of issue relationships
- **Flexible Filtering**: Configure which issues to analyze links for and which linked issues to display
- **Color Coding**: Use fixed colors or automatically generated unique colors for each linked issue
- **Column Selection**: Specify which board columns should display links
- **Multiline Display**: Configure wrapping of long issue summaries across multiple lines

#### How to Use:

1. Open Board Settings
2. Find the "Additional Card Elements" section
3. Enable the link display feature
4. Select columns where links should be displayed
5. Add link configurations (Issue Links) with desired parameters
6. Configure filters for source and linked issues if needed

#### Use Cases:

- Display all parent issues for the current issue
- Show only "Project" type issues linked to the current issue
- Status filtering: show only incomplete linked issues
- Combined filters: e.g., "Project" type issues in incomplete statuses or "Objective" type issues with specific labels
