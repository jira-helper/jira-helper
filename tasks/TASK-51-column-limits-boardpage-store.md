# TASK-51: Создать runtimeStore для BoardPage

**Status**: DONE

**Parent**: [EPIC-6](./EPIC-6-column-limits-modernization.md)

---

## Описание

Создать Zustand store для хранения runtime-состояния BoardPage: рассчитанная статистика групп, CSS селекторы, настройки свимлейнов. Store позволяет React-компонентам подписываться на изменения без прямой связи с DOM.

## Файлы

```
src/column-limits/BoardPage/
├── stores/
│   ├── runtimeStore.ts        # новый
│   ├── runtimeStore.types.ts  # новый
│   ├── runtimeStore.test.ts   # новый
│   └── index.ts               # новый
```

## Что сделать

1. Определить типы в `runtimeStore.types.ts`:

```typescript
interface GroupStats {
  groupId: string;
  groupName: string;
  columns: string[];
  currentCount: number;
  limit: number;
  isOverLimit: boolean;
  color: string;
}

interface RuntimeData {
  groupStats: GroupStats[];
  cssNotIssueSubTask: string;
  ignoredSwimlanes: string[];
}

interface RuntimeActions {
  setGroupStats: (stats: GroupStats[]) => void;
  setCssNotIssueSubTask: (css: string) => void;
  setIgnoredSwimlanes: (ids: string[]) => void;
  reset: () => void;
}
```

2. Создать store `useColumnLimitsRuntimeStore` по образцу person-limits

3. Написать unit-тесты для store actions

## Критерии приёмки

- [x] Store создан с правильной типизацией
- [x] Все actions работают корректно
- [x] reset() возвращает initial state
- [x] Unit-тесты покрывают все actions
- [x] Тесты проходят: `npm test`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: концептуально готов к началу
- Референс: `src/person-limits/BoardPage/stores/runtimeStore.ts`

---

## Результаты

**Дата**: 2026-02-16

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

```
Создан runtimeStore для BoardPage column-limits:
- runtimeStore.types.ts: типы GroupStats, RuntimeData, RuntimeActions, RuntimeStoreState с JSDoc комментариями
- runtimeStore.ts: Zustand store с immer для иммутабельных обновлений, getInitialState для тестов
- runtimeStore.test.ts: 12 unit-тестов покрывающих все actions (initial state, setGroupStats, setCssNotIssueSubTask, setIgnoredSwimlanes, reset)
- index.ts: экспорты store, типов и утилит

Все тесты проходят (12/12), линтер без ошибок.
```

**Проблемы и решения**:

```
Нет проблем. Реализация следует паттерну person-limits с использованием immer для иммутабельных обновлений.
```
