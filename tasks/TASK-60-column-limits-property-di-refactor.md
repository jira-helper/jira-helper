# TASK-60: Рефакторинг property actions на DI токены

**Status**: DONE

**Parent**: [EPIC-6](./EPIC-6-column-limits-modernization.md)

---

## Описание

Перевести `saveColumnLimitsProperty` и `loadColumnLimitsProperty` на использование `createAction` с DI токенами для консистентности с `person-limits` и улучшения тестируемости.

## Проблема

Текущая реализация использует прямые импорты:

```typescript
// ❌ Текущий код
import { getBoardIdFromURL } from 'src/routing';
import { updateBoardProperty } from 'src/shared/jiraApi';

export const saveColumnLimitsProperty = async () => {
  const boardId = getBoardIdFromURL();  // Не тестируемо
  updateBoardProperty(boardId, ...);
};
```

Это не позволяет мокать зависимости в тестах без `cy.on('uncaught:exception')`.

## Целевой код

```typescript
// ✅ Целевой код
import { createAction } from 'src/shared/action';
import { getBoardIdFromURLToken } from 'src/shared/di/routingTokens';
import { updateBoardPropertyToken } from 'src/shared/di/jiraApiTokens';

export const saveColumnLimitsProperty = createAction({
  name: 'saveColumnLimitsProperty',
  async handler() {
    const getBoardId = this.di.inject(getBoardIdFromURLToken);
    const updateProperty = this.di.inject(updateBoardPropertyToken);

    const boardId = getBoardId();
    if (!boardId) throw new Error('No board id');

    const { data } = useColumnLimitsPropertyStore.getState();
    updateProperty(boardId, BOARD_PROPERTIES.WIP_LIMITS_SETTINGS, data);
  },
});
```

## Файлы

```
src/column-limits/property/actions/
├── saveProperty.ts       # изменение
├── loadProperty.ts       # изменение (если использует прямые импорты)
```

## Что сделать

1. Прочитать `src/column-limits/property/actions/loadProperty.ts` — проверить использует ли прямые импорты
2. Рефакторить `saveColumnLimitsProperty`:
   - Заменить на `createAction`
   - Использовать `getBoardIdFromURLToken` и `updateBoardPropertyToken`
3. Рефакторить `loadColumnLimitsProperty` (если нужно):
   - Аналогично использовать DI токены
4. Обновить тесты `saveProperty.test.ts`:
   - Регистрировать DI токены в beforeEach
   - Убрать моки модулей если были
5. Убедиться что существующие тесты проходят

## Критерии приёмки

- [x] `saveColumnLimitsProperty` использует `createAction` с DI
- [x] `loadColumnLimitsProperty` использует DI (если применимо) - проверен, оставлен как есть (не используется через createAction)
- [x] Тесты не используют `cy.on('uncaught:exception')` для подавления ошибок
- [x] `npm test src/column-limits/property` проходит
- [x] `npm run cy:run -- --spec "src/column-limits/**/*.cy.tsx"` проходит

## Зависимости

- Референс: `src/person-limits/property/actions/saveProperty.ts`
- DI токены: `src/shared/di/routingTokens.ts`, `src/shared/di/jiraApiTokens.ts`

---

## Результаты

**Дата**: 2026-02-16

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

```
✅ Рефакторинг выполнен успешно:

1. `saveColumnLimitsProperty` переведён на использование `createAction` с DI токенами:
   - Использует `getBoardIdFromURLToken` вместо прямого импорта `getBoardIdFromURL`
   - Использует `updateBoardPropertyToken` вместо прямого импорта `updateBoardProperty`
   - Соответствует стандарту `person-limits`

2. `loadColumnLimitsProperty` проверен:
   - Использует прямые импорты, но не используется через `createAction`
   - В `person-limits` аналогичная ситуация - `loadProperty` тоже использует прямые импорты
   - Оставлен как есть, так как не используется через `createAction` и токена для `getBoardProperty` нет

3. Тесты обновлены:
   - `saveToProperty.test.ts` обновлён для использования DI токенов вместо моков модулей
   - Регистрация токенов в `beforeEach` через `globalContainer.register()`

4. Все тесты проходят:
   - ✅ `npm test src/column-limits/property` - 4 теста пройдено
   - ✅ `npm test src/column-limits/SettingsPage/actions/saveToProperty.test.ts` - 3 теста пройдено
   - ✅ `npm run cy:run -- --spec "src/column-limits/**/*.cy.tsx"` - 40 тестов пройдено (13 + 27)

5. Линтер: нет ошибок в изменённых файлах
```

**Проблемы и решения**:

```
Проблем не было. Рефакторинг выполнен по аналогии с `person-limits`.
```
