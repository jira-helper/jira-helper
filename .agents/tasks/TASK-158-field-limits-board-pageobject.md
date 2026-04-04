# TASK-158: FieldLimitsBoardPageObject + тесты

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Создать PageObject для DOM-запросов, специфичных для field-limits на Board Page. Инкапсулирует всю работу с extra-fields карточек, card coloring и вставку React-компонентов в subnav.

## Файлы

```
src/features/field-limits/BoardPage/page-objects/
├── FieldLimitsBoardPageObject.ts        # новый
└── FieldLimitsBoardPageObject.test.ts   # новый
```

## Что сделать

1. Создать `FieldLimitsBoardPageObject` реализующий `IFieldLimitsBoardPageObject`:

```typescript
export interface IFieldLimitsBoardPageObject {
  selectors: {
    extraField: string;     // '.ghx-extra-field'
    subnavTitle: string;    // '#subnav-title'
  };

  getFieldNameFromExtraField(extraField: Element): string | null;
  getExtraFieldTexts(extraField: Element): string[];
  colorCard(issue: Element, color: string): void;
  resetCardColor(issue: Element): void;
  insertSubnavComponent(component: React.ReactNode, key: string): void;
  removeSubnavComponent(key: string): void;
}
```

2. Реализация `getFieldNameFromExtraField`:
   - Берёт `data-tooltip` или `title` атрибут, split по `:`, возвращает первую часть
   - Legacy: `src/field-limits/BoardPage/index.ts:305`

3. Реализация `getExtraFieldTexts`:
   - Обходит `childNodes`, собирает `innerText`, split по `,`, trim
   - Это сырые тексты, которые затем передаются в pure functions

4. `colorCard` / `resetCardColor`:
   - Устанавливает/сбрасывает `style.backgroundColor` на элементе issue

5. `insertSubnavComponent` / `removeSubnavComponent`:
   - Вставляет React-компонент в `#subnav-title`
   - Управляет `createRoot` / `unmount`

6. Написать unit-тесты с JSDOM:
   - Создать mock DOM с `.ghx-extra-field` элементами
   - Проверить парсинг имён полей, извлечение текстов
   - Проверить card coloring

## Критерии приёмки

- [ ] Все DOM-операции из legacy BoardPage вынесены в PageObject
- [ ] Монополия на DOM: ни один другой файл не обращается к extra-field DOM напрямую
- [ ] Unit-тесты с mock DOM
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-148](./TASK-148-field-limits-types-tokens.md)
- Legacy код: `src/field-limits/BoardPage/index.ts` (selectors, getCountValues*, getHasValue*, getSumNumber*)

---

## Результаты

**Дата**: 2025-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `FieldLimitsBoardPageObject.ts` с интерфейсом `IFieldLimitsBoardPageObject`
- Реализованы методы: `getFieldNameFromExtraField`, `getExtraFieldTexts`, `colorCard`, `resetCardColor`, `insertSubnavComponent`, `removeSubnavComponent`
- Добавлены unit-тесты (13 тестов) с happy-dom

**Проблемы и решения**:

- **colorCard**: happy-dom сохраняет `#ff0000` как есть, а не нормализует в `rgb(255, 0, 0)` — в тесте используется `toContain` для обоих вариантов
- **insertSubnavComponent**: React render асинхронный — обёртка в `act()` из @testing-library/react обеспечивает корректное обновление DOM перед assertion
