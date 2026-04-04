# TASK-62: Рефакторинг renderWipLimitCells на createAction

**Status**: DONE

**Parent**: [EPIC-7](./EPIC-7-wiplimit-cells-di-consistency.md)

---

## Описание

Перевести `renderWipLimitCells` с обычной функции на `createAction`, чтобы зависимости (PageObject) инжектились через DI, а не передавались параметрами. Консистентность с `person-limits` и `column-limits`.

## Файлы

```
src/wiplimit-on-cells/BoardPage/
├── actions/
│   └── renderWipLimitCells.ts   # изменение
└── index.ts                      # изменение (вызов action)
```

## Текущий код (до)

```typescript
// renderWipLimitCells.ts
export function renderWipLimitCells(
  ranges: WipLimitRange[],
  pageObject: IWipLimitCellsBoardPageObject,  // ← Передаётся параметром
  cssSelectorOfIssues: string,
  shouldCountIssue: ShouldCountIssueFn
): void { ... }

// index.ts
renderWipLimitCells(settings, pageObject, cssSelectorOfIssues, this.shouldCountIssue.bind(this));
```

## Целевой код (после)

```typescript
// renderWipLimitCells.ts
import { createAction } from 'src/shared/action';
import { wipLimitCellsBoardPageObjectToken } from '../pageObject';
import { useWipLimitCellsRuntimeStore } from '../stores';

export const renderWipLimitCells = createAction({
  name: 'renderWipLimitCells',
  handler(ranges: WipLimitRange[], shouldCountIssue: ShouldCountIssueFn) {
    const pageObject = this.di.inject(wipLimitCellsBoardPageObjectToken);
    const { cssSelectorOfIssues } = useWipLimitCellsRuntimeStore.getState();
    // ... существующая логика
  },
});

// index.ts
renderWipLimitCells(settings, this.shouldCountIssue.bind(this));
```

## Что сделать

1. Рефакторинг `renderWipLimitCells` на `createAction`
2. Инжектить `pageObject` через `wipLimitCellsBoardPageObjectToken`
3. Получать `cssSelectorOfIssues` из `runtimeStore` (уже там хранится)
4. Обновить вызов в `index.ts`
5. Обновить Cypress тесты — зарегистрировать DI токены
6. Запустить тесты

## Критерии приёмки

- [x] `renderWipLimitCells` использует `createAction`
- [x] PageObject инжектится через DI токен
- [x] cssSelectorOfIssues берётся из runtimeStore
- [x] Cypress тесты проходят: `npx cypress run --component --spec "src/wiplimit-on-cells/BoardPage/**"`
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Референс: `src/column-limits/BoardPage/actions/applyLimits.ts`
- Референс: `src/person-limits/BoardPage/actions/applyLimits.ts`

---

## Результаты

**Дата**: 2026-02-16

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

```
Выполнен рефакторинг renderWipLimitCells на createAction с DI:

1. ✅ renderWipLimitCells.ts переведён на createAction
   - PageObject инжектится через wipLimitCellsBoardPageObjectToken
   - cssSelectorOfIssues получается из useWipLimitCellsRuntimeStore

2. ✅ index.ts обновлён
   - Убрана передача pageObject и cssSelectorOfIssues параметрами
   - Вызов упрощён: renderWipLimitCells(settings, this.shouldCountIssue.bind(this))

3. ✅ Cypress тесты обновлены
   - Добавлена регистрация DI токенов в beforeEach
   - Добавлена регистрация logger через registerLogger
   - PageObject регистрируется в globalContainer
   - cssSelectorOfIssues устанавливается в runtimeStore
   - Все вызовы renderWipLimitCells обновлены на новую сигнатуру

4. ✅ Все тесты проходят (20/20)
5. ✅ Build проходит успешно
6. ✅ Нет ошибок линтера
```

**Проблемы и решения**:

```
1. Проблема: Неправильные отступы в handler функции
   Решение: Исправлены отступы внутри handler для правильной структуры createAction

2. Проблема: Использование setState в тестах (не существует в zustand)
   Решение: Заменено на actions.reset() для сброса store

3. Проблема: Типы pageObject в helper функциях
   Решение: Использован правильный тип IWipLimitCellsBoardPageObject
```
