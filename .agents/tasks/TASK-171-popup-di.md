# TASK-171: Popup — удалить dead code или вынести в DI

**Status**: DONE

**Parent**: [EPIC-17](./EPIC-17-shared-di-refactoring.md)

---

## Описание

Класс `Popup` в `src/shared/getPopup.ts` — DOM-класс для отображения модальных окон через `document.body.insertAdjacentHTML`. На данный момент **не импортируется** ни одним файлом в `src/` — является dead code. Нужно либо удалить, либо (если планируется использование) добавить DI-токен.

## Сущность

**Класс**: `Popup` (src/shared/getPopup.ts)

**Side effects**: `document.body.insertAdjacentHTML`, `document.getElementById`, `document.querySelector`, `createRoot`, `addEventListener`

**Статус**: Dead code — нет активных импортов в `src/`

## Кто и как использует

**Никто.** Класс не импортируется ни одним файлом. Упоминается только в:
- `src/content.ts` — закомментированный import (`SwimlaneSettingsPopup // Legacy`)
- `src/wiplimit-on-cells/types.ts` — упоминание в JSDoc-комментарии
- `tasks/TASK-5-*.md`, `tasks/TASK-6-*.md` — исторические задачи

## Какие токены надо экспортировать

**Если удаление**: никаких.

**Если сохранение**: создать интерфейс `IPopup` и токен:

```typescript
export interface IPopup {
  render(): void;
  unmount(): void;
  appendToContent(str: string): void;
  appendReactComponentToContent(component: React.ReactNode): void;
  clearContent(): void;
  htmlElement: HTMLElement | null;
  contentBlock: HTMLElement | null;
}

export const popupToken = new Token<new (props: PopupProps) => IPopup>('popup');
```

## Как поменяется код

**Вариант A (рекомендуется): Удаление dead code**

```diff
- src/shared/getPopup.ts      # удалить файл
```

**Вариант B: Добавление DI** (если Popup потребуется в будущем)

```typescript
// Потребитель:
const PopupClass = container.inject(popupToken);
const popup = new PopupClass({ title: 'Settings' });
popup.render();
```

## Файлы

```
src/shared/
├── getPopup.ts         # удалить или добавить интерфейс + токен
```

## Что сделать

1. Проверить, что `Popup` действительно не используется (zero imports)
2. **Вариант A**: Удалить `src/shared/getPopup.ts`
3. **Вариант B**: Создать `IPopup` интерфейс, `popupToken`, `registerPopupInDI`
4. Удалить упоминания в комментариях (если вариант A)

## Критерии приёмки

- [ ] `Popup` либо удалён, либо имеет DI-токен
- [ ] Нет broken imports
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Нет зависимостей от других задач

---

## Результаты

**Дата**: 2026-03-23

**Статус**: DONE

**Что сделано**:

- Подтверждено что `Popup` — dead code (zero imports в `src/`)
- Knip подтвердил `src/shared/getPopup.ts` как unused file (после исправления конфига)
- Файл `src/shared/getPopup.ts` удалён (вариант A)

**Дополнительно**:

- Исправлен `knip.config.js`: entry `content.js` → `content.ts`, project glob `{jsx?,tsx?}` → `{js,jsx,ts,tsx}`
