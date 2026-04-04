# TASK-14-1: Типы и интерфейсы

**Status**: TODO

**Parent**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)

---

## Описание

Создать базовые типы и интерфейсы для новой реализации swimlane. Это фундамент для всех остальных задач.

## Файлы

```
src/swimlane/v2/
├── stores/
│   └── types.ts                     # новый
└── pageObject/
    └── ISwimlanePageObject.ts       # новый
```

## Что сделать

### 1. Создать `stores/types.ts`

```typescript
/**
 * Настройки одного swimlane.
 * Хранятся в Jira Board Property.
 */
export interface SwimlaneSetting {
  /** WIP лимит. undefined = без лимита */
  limit?: number;
  /** Исключить из column WIP limits (expedite) */
  ignoreWipInColumns?: boolean;
  /** Типы задач для подсчёта. undefined/[] = все типы */
  includedIssueTypes?: string[];
}

/**
 * Все настройки swimlanes.
 * Ключ = swimlane ID.
 */
export type SwimlaneSettings = Record<string, SwimlaneSetting>;

/**
 * Информация о swimlane из Jira Board Config.
 */
export interface Swimlane {
  id: string;
  name: string;
}

/**
 * Состояние Property Store.
 */
export interface SwimlanePropertyState {
  data: SwimlaneSettings;
  state: 'initial' | 'loading' | 'loaded';
}

/**
 * Состояние UI Store (для Settings).
 */
export interface SwimlaneUIState {
  isModalOpen: boolean;
  swimlanes: Swimlane[];
  editingSettings: SwimlaneSettings;
}
```

### 2. Создать `pageObject/ISwimlanePageObject.ts`

```typescript
/**
 * PageObject для работы с DOM swimlane.
 * Инъектируется через DI для тестируемости.
 */
export interface ISwimlanePageObject {
  selectors: {
    swimlane: string;
    swimlaneHeader: string;
    swimlaneHeading: string;
    swimlaneDescription: string;
    swimlaneInnerHeader: string;
    columns: string;
    issue: string;
    stalker: string;
  };

  // === Queries (не мутируют DOM) ===
  
  /** Получить все swimlane элементы */
  getSwimlanes(): Element[];
  
  /** Получить ID swimlane из атрибута */
  getSwimlaneId(swimlane: Element): string | null;
  
  /** Получить header swimlane */
  getSwimlaneHeader(swimlane: Element): Element | null;
  
  /** Получить heading (для badge) */
  getSwimlaneHeading(swimlane: Element): Element | null;
  
  /** Получить все issues в swimlane */
  getIssuesInSwimlane(swimlane: Element): Element[];
  
  /** Получить тип issue из data-атрибута */
  getIssueType(issue: Element): string | null;
  
  /** Проверить, что issue в done-колонке */
  isDoneIssue(issue: Element): boolean;
  
  /** Проверить, что issue — subtask */
  isSubtask(issue: Element): boolean;
  
  /** Получить колонки в swimlane */
  getColumnsInSwimlane(swimlane: Element): Element[];
  
  /** Получить stalker (sticky header) */
  getStalker(): Element | null;
  
  /** Получить swimlane ID из stalker */
  getStalkerSwimlaneId(stalker: Element): string | null;

  // === Commands (мутируют DOM) ===
  
  /** Установить background color swimlane */
  setSwimlaneBackgroundColor(swimlane: Element, color: string): void;
  
  /** Установить color description */
  setDescriptionColor(swimlane: Element, color: string): void;
  
  /** Установить background inner header */
  setInnerHeaderBackgroundColor(swimlane: Element, color: string): void;
  
  /** Вставить badge HTML перед heading */
  insertBadgeBeforeHeading(heading: Element, html: string): void;
  
  /** Вставить stats HTML в header */
  insertStatsInHeader(header: Element, html: string): void;
  
  /** Проверить, есть ли уже badge */
  hasBadge(header: Element): boolean;
}
```

## Критерии приёмки

- [ ] Создан `stores/types.ts` с JSDoc комментариями
- [ ] Создан `pageObject/ISwimlanePageObject.ts` с CQS разделением
- [ ] Типы экспортируются через index.ts
- [ ] Нет ошибок TypeScript
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Референс типов: `src/swimlane/SwimlaneLimits.ts:9-14`
- Референс PageObject: `src/person-limits/BoardPage/pageObject/`
