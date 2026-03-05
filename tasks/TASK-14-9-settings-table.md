# TASK-14-9: SwimlaneSettingRow + SwimlaneLimitsTable

**Epic**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)
**Status**: DONE
**Depends on**: TASK-14-2, TASK-14-3

---

## Цель

Создать React-компоненты для таблицы настроек swimlane с интеграцией `ColumnSelectorContainer`.

---

## Файлы

| Файл | Действие |
|------|----------|
| `src/swimlane-wip-limits/SettingsPage/components/SwimlaneSettingRow.tsx` | Создание |
| `src/swimlane-wip-limits/SettingsPage/components/SwimlaneSettingRow.stories.tsx` | Создание |
| `src/swimlane-wip-limits/SettingsPage/components/SwimlaneLimitsTable.tsx` | Создание |
| `src/swimlane-wip-limits/SettingsPage/components/SwimlaneLimitsTable.stories.tsx` | Создание |
| `src/swimlane-wip-limits/SettingsPage/components/index.ts` | Создание |

---

## Требуемые изменения

### 1. SwimlaneSettingRow.tsx

Строка настроек одного swimlane с выбором колонок:

```typescript
import React from 'react';
import { InputNumber, Collapse } from 'antd';
import { ColumnSelectorContainer } from 'src/shared/components/ColumnSelector';
import type { SwimlaneSetting, Swimlane } from '../../types';

export interface SwimlaneSettingRowProps {
  swimlane: Swimlane;
  setting: SwimlaneSetting;
  onChange: (update: Partial<SwimlaneSetting>) => void;
  disabled?: boolean;
}

export const SwimlaneSettingRow: React.FC<SwimlaneSettingRowProps> = ({
  swimlane,
  setting,
  onChange,
  disabled,
}) => {
  const handleLimitChange = (value: number | null) => {
    onChange({ limit: value ?? undefined });
  };

  const handleColumnsChange = (columns: { name: string; enabled: boolean }[]) => {
    const enabledColumns = columns.filter(c => c.enabled).map(c => c.name);
    onChange({ columns: enabledColumns });
  };

  return (
    <Collapse.Panel 
      header={swimlane.name} 
      key={swimlane.id}
      data-testid={`swimlane-row-${swimlane.id}`}
    >
      <div style={{ marginBottom: 16 }}>
        <label>Max issues: </label>
        <InputNumber
          min={0}
          value={setting.limit}
          onChange={handleLimitChange}
          disabled={disabled}
          data-testid="limit-input"
        />
      </div>
      
      <ColumnSelectorContainer
        columnsToTrack={setting.columns}
        onUpdate={handleColumnsChange}
        loading={disabled}
        title="Columns to count"
        description="Select columns to include in issue count"
        testIdPrefix={`swimlane-${swimlane.id}-columns`}
      />
    </Collapse.Panel>
  );
};
```

### 2. SwimlaneLimitsTable.tsx

Таблица всех swimlanes:

```typescript
import React from 'react';
import { Collapse, Empty } from 'antd';
import { SwimlaneSettingRow } from './SwimlaneSettingRow';
import type { SwimlaneSettings, Swimlane, SwimlaneSetting } from '../../types';

export interface SwimlaneLimitsTableProps {
  swimlanes: Swimlane[];
  settings: SwimlaneSettings;
  onChange: (swimlaneId: string, update: Partial<SwimlaneSetting>) => void;
  disabled?: boolean;
}

export const SwimlaneLimitsTable: React.FC<SwimlaneLimitsTableProps> = ({
  swimlanes,
  settings,
  onChange,
  disabled,
}) => {
  if (swimlanes.length === 0) {
    return <Empty description="No swimlanes configured" />;
  }

  return (
    <Collapse accordion data-testid="swimlane-limits-table">
      {swimlanes.map(swimlane => (
        <SwimlaneSettingRow
          key={swimlane.id}
          swimlane={swimlane}
          setting={settings[swimlane.id] ?? { columns: [] }}
          onChange={update => onChange(swimlane.id, update)}
          disabled={disabled}
        />
      ))}
    </Collapse>
  );
};
```

### 3. Storybook

- Empty state
- Single swimlane
- Multiple swimlanes
- With selected columns
- Disabled state

---

## Acceptance Criteria

- [ ] `SwimlaneSettingRow` интегрирует `ColumnSelectorContainer`
- [ ] `SwimlaneLimitsTable` отображает все swimlanes
- [ ] Empty state когда нет swimlanes
- [ ] Storybook с 5+ stories
- [ ] `data-testid` атрибуты для тестов
- [ ] `npm run lint:eslint` проходит

---

## Контекст

Смотри:
- `tasks/target-design-swimlane-v2.md` — спецификация компонентов
- `src/shared/components/ColumnSelector.tsx` — API ColumnSelectorContainer

---

## Результаты

**Дата**: 2026-03-05

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `SwimlaneSettingRow` с InputNumber для лимита и ColumnSelectorContainer
- Создан `SwimlaneLimitsTable` с Collapse accordion и Empty state
- 4 stories для SwimlaneSettingRow, 5 stories для SwimlaneLimitsTable
- DI декоратор с BoardPagePageObjectMock для Storybook

**Проблемы и решения**:

**Проблема 1: Collapse.Panel вне Collapse**

Контекст: SwimlaneSettingRow возвращает Collapse.Panel

Решение: Декоратор в stories оборачивает в Collapse accordion
