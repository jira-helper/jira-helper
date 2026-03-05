# TASK-14-15: Histogram Component

**Epic**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)
**Status**: DONE
**Depends on**: TASK-14-13

---

## Цель

Создать React-компонент `Histogram` для отображения распределения задач по колонкам в swimlane.

---

## Файлы

| Файл | Действие |
|------|----------|
| `src/swimlane-histogram/components/Histogram/Histogram.tsx` | Создание |
| `src/swimlane-histogram/components/Histogram/Histogram.module.css` | Создание |
| `src/swimlane-histogram/components/Histogram/Histogram.stories.tsx` | Создание |
| `src/swimlane-histogram/components/Histogram/index.ts` | Создание |
| `src/swimlane-histogram/components/index.ts` | Создание |

---

## Требуемые изменения

### 1. Histogram.tsx

```typescript
import React from 'react';
import { Tooltip } from 'antd';
import styles from './Histogram.module.css';
import type { SwimlaneHistogram } from '../../types';

export interface HistogramProps {
  data: SwimlaneHistogram;
}

export const Histogram: React.FC<HistogramProps> = ({ data }) => {
  const maxCount = Math.max(...data.columns.map(c => c.issueCount), 1);
  
  return (
    <div className={styles.wrapper} data-testid="histogram">
      {data.columns.map((column, index) => {
        const heightPercent = (column.issueCount / maxCount) * 100;
        const hasIssues = column.issueCount > 0;
        
        return (
          <Tooltip
            key={index}
            title={`${column.columnName}: ${column.issueCount}`}
          >
            <div
              className={styles.column}
              style={{ backgroundColor: hasIssues ? '#999' : '#eee' }}
              data-testid={`histogram-column-${index}`}
            >
              <div
                className={styles.bar}
                style={{ height: `${heightPercent}%` }}
              />
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
};
```

### 2. Histogram.module.css

```css
.wrapper {
  display: flex;
  gap: 2px;
  align-items: flex-end;
  height: 20px;
  margin-right: 8px;
}

.column {
  width: 8px;
  height: 100%;
  display: flex;
  align-items: flex-end;
  border-radius: 2px;
}

.bar {
  width: 100%;
  background-color: #666;
  border-radius: 2px;
  min-height: 2px;
}
```

### 3. Storybook

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Histogram } from './Histogram';

const meta: Meta<typeof Histogram> = {
  title: 'Swimlane Histogram/Histogram',
  component: Histogram,
};

export default meta;
type Story = StoryObj<typeof Histogram>;

export const Normal: Story = {
  args: {
    data: {
      swimlaneId: 'swim-1',
      totalIssues: 15,
      columns: [
        { columnName: 'To Do', issueCount: 5 },
        { columnName: 'In Progress', issueCount: 8 },
        { columnName: 'Review', issueCount: 2 },
        { columnName: 'Done', issueCount: 0 },
      ],
    },
  },
};

export const Empty: Story = {
  args: {
    data: {
      swimlaneId: 'swim-1',
      totalIssues: 0,
      columns: [
        { columnName: 'To Do', issueCount: 0 },
        { columnName: 'In Progress', issueCount: 0 },
        { columnName: 'Done', issueCount: 0 },
      ],
    },
  },
};

export const SingleColumn: Story = {
  args: {
    data: {
      swimlaneId: 'swim-1',
      totalIssues: 10,
      columns: [
        { columnName: 'All', issueCount: 10 },
      ],
    },
  },
};

export const ManyColumns: Story = {
  args: {
    data: {
      swimlaneId: 'swim-1',
      totalIssues: 30,
      columns: [
        { columnName: 'Backlog', issueCount: 10 },
        { columnName: 'To Do', issueCount: 5 },
        { columnName: 'In Progress', issueCount: 8 },
        { columnName: 'Review', issueCount: 4 },
        { columnName: 'Testing', issueCount: 2 },
        { columnName: 'Done', issueCount: 1 },
      ],
    },
  },
};
```

---

## Acceptance Criteria

- [ ] Компонент отображает бары пропорционально количеству задач
- [ ] Tooltip показывает "Column: N"
- [ ] Пустые колонки светло-серые (#eee)
- [ ] Заполненные колонки тёмно-серые (#999)
- [ ] Storybook с 4+ stories
- [ ] `data-testid` атрибуты для тестов
- [ ] `npm run lint:eslint` проходит

---

## Контекст

Смотри:
- `src/swimlane/SwimlaneStats.ts` — legacy стили
- `src/swimlane/styles.module.css` — legacy CSS

---

## Результаты

**Дата**: 2026-03-05

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `Histogram` компонент с Ant Design Tooltip
- Бары пропорциональны issueCount
- CSS module для стилей
- 4 Storybook stories + 6 Cypress тестов

**Проблемы и решения**:

**Проблема 1: Tooltip рендерится в body**

Контекст: Ant Design Tooltip рендерится в body, не внутри компонента

Решение: Используется trigger('mouseover') и cy.get('body').contains()
