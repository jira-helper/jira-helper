# TASK-14-12: SettingsPageModification

**Epic**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)
**Status**: DONE
**Depends on**: TASK-14-4, TASK-14-7, TASK-14-10

---

## Цель

Создать `SettingsPageModification` — entry point для настроек WIP-лимитов на странице настроек доски.

---

## Файлы

| Файл | Действие |
|------|----------|
| `src/swimlane-wip-limits/SettingsPage/SettingsPageModification.ts` | Создание |
| `src/swimlane-wip-limits/SettingsPage/components/SettingsButton.tsx` | Создание |
| `src/swimlane-wip-limits/SettingsPage/index.ts` | Создание |

---

## Требуемые изменения

### 1. SettingsButton.tsx

```typescript
import React from 'react';
import { Button } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { settingsUIModelToken } from '../../tokens';
import { useDi } from '@/shared/di/react';

export const SettingsButton: React.FC = () => {
  const { useModel } = useDi(settingsUIModelToken);
  const uiModel = useModel();

  const handleClick = async () => {
    await uiModel.open();
  };

  return (
    <Button
      icon={<SettingOutlined />}
      onClick={handleClick}
      data-testid="swimlane-settings-button"
    >
      Configure WIP Limits
    </Button>
  );
};
```

### 2. SettingsPageModification.ts

```typescript
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { PageModification } from '@/shared/PageModification';
import { SettingsPage } from 'src/page-objects/SettingsPage';
import { DIProvider } from '@/shared/di/react';
import { SettingsButton } from './components/SettingsButton';
import { SettingsModal } from './components/SettingsModal';

export class SettingsPageModification extends PageModification<void, Element> {
  private root: Root | null = null;

  shouldApply(): boolean {
    const pageObject = SettingsPage.getSwimlaneLimitsSettingsTabPageObject();
    return pageObject.isCustomSwimlaneStrategy();
  }

  getModificationId(): string {
    return `swimlane-wip-limits-settings-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement('#ghx-swimlane-config');
  }

  async apply(): Promise<void> {
    const pageObject = SettingsPage.getSwimlaneLimitsSettingsTabPageObject();
    const container = pageObject.getConfigContainer();
    
    if (!container) return;
    
    // Создаём контейнер для React
    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-jh-swimlane-settings', 'true');
    container.appendChild(wrapper);
    
    this.root = createRoot(wrapper);
    this.root.render(
      <DIProvider container={this.container}>
        <SettingsButton />
        <SettingsModal />
      </DIProvider>
    );
  }

  onDestroy(): void {
    this.root?.unmount();
    this.root = null;
  }
}
```

### 3. index.ts

```typescript
export { SettingsPageModification } from './SettingsPageModification';
export { SettingsUIModel } from './models/SettingsUIModel';
export * from './components';
```

---

## Acceptance Criteria

- [ ] `SettingsButton` открывает модаль через `uiModel.open()`
- [ ] `SettingsPageModification` вставляет кнопку и модаль
- [ ] Использует `DIProvider` для DI контекста
- [ ] Cleanup в `onDestroy`
- [ ] `shouldApply()` проверяет custom swimlane strategy
- [ ] `npm run lint:eslint` проходит

---

## Контекст

Смотри:
- `src/swimlane/SwimlaneSettingsPopup.ts` — legacy реализация
- `src/column-limits/SettingsPage/index.ts` — пример

---

## Результаты

**Дата**: 2026-03-05

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `SettingsButton` с Ant Design Button
- Создан `SettingsPageModification` extends PageModification
- `shouldApply()` проверяет custom swimlane strategy
- Cleanup через sideEffects
- Добавлены тесты для SettingsButton и SettingsPageModification

**Проблемы и решения**:

**Проблема 1: JSX в .ts файле**

Контекст: ESLint/TypeScript не принимали JSX

Решение: Использован React.createElement вместо JSX

**Проблема 2: WithDi вместо DiProvider**

Контекст: В проекте используется WithDi

Решение: Использован WithDi из diContext
