# TASK-172: ColorPickerTooltip — удалить dead code или вынести в DI

**Status**: DONE

**Parent**: [EPIC-17](./EPIC-17-shared-di-refactoring.md)

---

## Описание

Класс `ColorPickerTooltip` в `src/shared/colorPickerTooltip.ts` — DOM-класс для отображения color picker tooltip. На данный момент **не импортируется** ни одним файлом в `src/` — является dead code. Нужно либо удалить, либо (если планируется использование) добавить DI-токен.

## Сущность

**Класс**: `ColorPickerTooltip` (src/shared/colorPickerTooltip.ts)

**Side effects**: `document.getElementById`, `insertAdjacentHTML`, scroll listener, ColorPicker library

**Зависимости**: `simple-color-picker` (npm), `htmlTemplates.ts` (template), `styles.module.css`

**Статус**: Dead code — нет активных импортов в `src/`

## Кто и как использует

**Никто.** Класс не импортируется ни одним файлом за пределами `src/shared/colorPickerTooltip.ts`.

## Какие токены надо экспортировать

**Если удаление**: никаких. Также можно удалить `colorPickerTooltipTemplate` из `htmlTemplates.ts` и зависимость `simple-color-picker`.

**Если сохранение**: создать интерфейс `IColorPickerTooltip` и токен:

```typescript
export interface IColorPickerTooltip {
  html(): string;
  init(hostElement: HTMLElement, attrDataId: string): void;
  isVisible: boolean;
  hideTooltip(): void;
  showTooltip(event: { target: HTMLElement }): void;
}

export const colorPickerTooltipToken = new Token<IColorPickerTooltip>('colorPickerTooltip');
```

## Как поменяется код

**Вариант A (рекомендуется): Удаление dead code**

```diff
- src/shared/colorPickerTooltip.ts    # удалить файл
- src/shared/htmlTemplates.ts         # удалить colorPickerTooltipTemplate (проверить другие экспорты)
  package.json                        # удалить simple-color-picker из dependencies
```

**Вариант B: Добавление DI** (если потребуется в будущем) — аналогично Popup (TASK-171).

## Файлы

```
src/shared/
├── colorPickerTooltip.ts    # удалить или добавить интерфейс + токен
├── htmlTemplates.ts         # удалить template (если вариант A)
├── styles.module.css        # проверить, используются ли стили где-то ещё
```

## Что сделать

1. Проверить, что `ColorPickerTooltip` действительно не используется (zero imports)
2. **Вариант A**: Удалить `colorPickerTooltip.ts`, `colorPickerTooltipTemplate` из `htmlTemplates.ts`
3. Проверить, можно ли удалить `simple-color-picker` из `package.json`
4. **Вариант B**: Создать `IColorPickerTooltip`, `colorPickerTooltipToken`, `registerColorPickerTooltipInDI`

## Критерии приёмки

- [ ] `ColorPickerTooltip` либо удалён, либо имеет DI-токен
- [ ] Нет broken imports
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Нет зависимостей от других задач
