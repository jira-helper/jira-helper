# TASK-14-8: LimitBadge Component

**Epic**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)
**Status**: DONE
**Depends on**: TASK-14-3

---

## Цель

Создать React-компонент `LimitBadge` для отображения WIP-лимита swimlane с использованием Ant Design.

---

## Файлы

| Файл | Действие |
|------|----------|
| `src/swimlane-wip-limits/BoardPage/components/LimitBadge/LimitBadge.tsx` | Создание |
| `src/swimlane-wip-limits/BoardPage/components/LimitBadge/LimitBadge.module.css` | Создание |
| `src/swimlane-wip-limits/BoardPage/components/LimitBadge/LimitBadge.stories.tsx` | Создание |
| `src/swimlane-wip-limits/BoardPage/components/LimitBadge/index.ts` | Создание |
| `src/swimlane-wip-limits/BoardPage/components/index.ts` | Создание |

---

## Требуемые изменения

### 1. LimitBadge.tsx

```typescript
import React from 'react';
import { Badge, Tooltip } from 'antd';
import styles from './LimitBadge.module.css';

export interface LimitBadgeProps {
  count: number;
  limit: number;
  exceeded: boolean;
}

export const LimitBadge: React.FC<LimitBadgeProps> = ({ 
  count, 
  limit, 
  exceeded 
}) => (
  <Tooltip title="Issues / Max. issues">
    <span className={styles.badge} data-testid="limit-badge">
      <Badge 
        count={`${count}/${limit}`}
        style={{ 
          backgroundColor: exceeded ? '#ff4d4f' : '#52c41a',
          fontWeight: 500,
        }}
        showZero
      />
    </span>
  </Tooltip>
);
```

### 2. LimitBadge.module.css

```css
.badge {
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
}
```

### 3. Storybook

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { LimitBadge } from './LimitBadge';

const meta: Meta<typeof LimitBadge> = {
  title: 'Swimlane WIP Limits/LimitBadge',
  component: LimitBadge,
};

export default meta;
type Story = StoryObj<typeof LimitBadge>;

export const Normal: Story = {
  args: {
    count: 3,
    limit: 5,
    exceeded: false,
  },
};

export const Exceeded: Story = {
  args: {
    count: 7,
    limit: 5,
    exceeded: true,
  },
};

export const AtLimit: Story = {
  args: {
    count: 5,
    limit: 5,
    exceeded: false,
  },
};

export const Empty: Story = {
  args: {
    count: 0,
    limit: 5,
    exceeded: false,
  },
};
```

---

## Acceptance Criteria

- [ ] Компонент использует Ant Design Badge и Tooltip
- [ ] Зелёный цвет когда `exceeded: false`
- [ ] Красный цвет когда `exceeded: true`
- [ ] Storybook с 4+ stories
- [ ] `data-testid="limit-badge"` для тестов
- [ ] `npm run lint:eslint` проходит

---

## Контекст

Смотри:
- `tasks/target-design-swimlane-v2.md` — спецификация компонента
- `src/column-limits/BoardPage/components/` — пример структуры

---

## Результаты

**Дата**: 2026-03-05

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `LimitBadge` компонент с Ant Design Badge и Tooltip
- Зелёный цвет при `exceeded: false`, красный при `exceeded: true`
- CSS module для стилей
- 4 Storybook stories (Normal, Exceeded, AtLimit, Empty)
- Barrel exports

**Проблемы и решения**:

Проблем не было.
