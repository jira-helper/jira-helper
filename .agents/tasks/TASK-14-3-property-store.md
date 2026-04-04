# TASK-14-3: Valtio Property Store

**Status**: TODO

**Parent**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)

---

## Описание

Создать Valtio store для хранения swimlane settings (данные из Jira Board Property).

## Файлы

```
src/swimlane/v2/stores/
├── types.ts                           # из TASK-14-1
├── swimlanePropertyStore.ts           # новый
├── swimlanePropertyStore.test.ts      # новый
└── index.ts                           # новый
```

## Что сделать

### 1. Создать `swimlanePropertyStore.ts`

```typescript
import { proxy } from 'valtio';
import type { SwimlaneSettings, SwimlanePropertyState } from './types';

const initialState: SwimlanePropertyState = {
  data: {},
  state: 'initial',
};

/**
 * Property Store для swimlane settings.
 * Хранит данные из Jira Board Property.
 */
export const swimlanePropertyStore = proxy<SwimlanePropertyState>({
  ...initialState,
});

/**
 * Actions для Property Store.
 * Вынесены отдельно для CQS (Commands).
 */
export const swimlanePropertyActions = {
  setData: (data: SwimlaneSettings) => {
    swimlanePropertyStore.data = data;
    swimlanePropertyStore.state = 'loaded';
  },

  setState: (state: SwimlanePropertyState['state']) => {
    swimlanePropertyStore.state = state;
  },

  updateSwimlane: (id: string, updates: Partial<SwimlaneSettings[string]>) => {
    swimlanePropertyStore.data[id] = {
      ...swimlanePropertyStore.data[id],
      ...updates,
    };
  },

  deleteSwimlane: (id: string) => {
    delete swimlanePropertyStore.data[id];
  },

  reset: () => {
    swimlanePropertyStore.data = {};
    swimlanePropertyStore.state = 'initial';
  },
};

/**
 * Для тестов — получить начальное состояние.
 */
export const getInitialPropertyState = (): SwimlanePropertyState => ({
  ...initialState,
  data: {},
});
```

### 2. Создать тесты `swimlanePropertyStore.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { snapshot } from 'valtio';
import {
  swimlanePropertyStore,
  swimlanePropertyActions,
  getInitialPropertyState,
} from './swimlanePropertyStore';

describe('swimlanePropertyStore', () => {
  beforeEach(() => {
    const initial = getInitialPropertyState();
    swimlanePropertyStore.data = initial.data;
    swimlanePropertyStore.state = initial.state;
  });

  describe('setData', () => {
    it('should set data and change state to loaded', () => {
      swimlanePropertyActions.setData({ swim1: { limit: 5 } });

      const snap = snapshot(swimlanePropertyStore);
      expect(snap.data.swim1?.limit).toBe(5);
      expect(snap.state).toBe('loaded');
    });
  });

  describe('updateSwimlane', () => {
    it('should update specific swimlane', () => {
      swimlanePropertyActions.setData({ swim1: { limit: 5 } });
      swimlanePropertyActions.updateSwimlane('swim1', { limit: 10 });

      const snap = snapshot(swimlanePropertyStore);
      expect(snap.data.swim1?.limit).toBe(10);
    });

    it('should create swimlane if not exists', () => {
      swimlanePropertyActions.updateSwimlane('swim2', { limit: 3 });

      const snap = snapshot(swimlanePropertyStore);
      expect(snap.data.swim2?.limit).toBe(3);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      swimlanePropertyActions.setData({ swim1: { limit: 5 } });
      swimlanePropertyActions.reset();

      const snap = snapshot(swimlanePropertyStore);
      expect(snap.data).toEqual({});
      expect(snap.state).toBe('initial');
    });
  });
});
```

## Критерии приёмки

- [ ] Store создан с Valtio proxy
- [ ] Actions вынесены отдельно (CQS)
- [ ] `getInitialPropertyState()` для тестов
- [ ] Unit тесты покрывают все actions
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: TASK-14-1 (types)
- Референс Zustand: `src/person-limits/SettingsPage/stores/settingsUIStore.ts`
