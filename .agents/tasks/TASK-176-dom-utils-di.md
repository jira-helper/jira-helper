# TASK-176: DOM utils (isJira, waitForElement, onDOMChange) — убрать прямые импорты из бизнес-кода

**Status**: DONE

**Parent**: [EPIC-17](./EPIC-17-shared-di-refactoring.md)

---

## Результат

При анализе выяснилось, что создание DI-токенов для DOM-примитивов — оверинжиниринг. Вместо этого:

- `waitForElement` и `onDOMChange` — инфраструктурные примитивы, которые должны использоваться **только через `PageModification`**
- `isJira` — используется в composition root (`content.ts`) до инициализации DI, оставлен как standalone

### Что сделано

**`getSettingsTab()` — разделение ответственностей:**
- DOM-фолбек (`waitForElement('.aui-nav-selected')` + чтение `dataset.tabitem`) перенесён из `RoutingService` в `SettingsPagePageObject.getSelectedTab()` (PageObject отвечает за чтение DOM-состояния)
- Логика фолбека (URL → DOM) вынесена в `PageModification.getSettingsTab()` (инфраструктурный слой)
- Метод `getSettingsTab()` удалён из `IRoutingService` / `RoutingService`
- 6 потребителей заменили `globalContainer.inject(routingServiceToken).getSettingsTab()` → `this.getSettingsTab()`

**`onDOMChange` в `CardColorsBoardPage`:**
- Заменён прямой import standalone `onDOMChange(element, cb)` на `this.onDOMChange(selector, cb)` через наследование от `PageModification`

**`waitForElement` в `RoutingService`:**
- Import удалён (метод `getSettingsTab` больше не существует в `RoutingService`)

### Итого по импортам

| Функция | Было | Стало |
|---------|------|-------|
| `isJira` | `content.ts` (composition root) | Без изменений — OK для composition root |
| `waitForElement` | `PageModification.ts` + `RoutingService.ts` | Только `PageModification.ts` |
| `onDOMChange` | `card-colors/BoardPage.tsx` | Нигде (используется `this.onDOMChange()`) |

## Критерии приёмки

- [x] Нет прямых импортов `waitForElement` вне `PageModification.ts`
- [x] Нет прямых импортов `onDOMChange` в бизнес-коде
- [x] `isJira` остаётся standalone для composition root
- [x] `getSettingsTab` DOM-логика вынесена в PageObject
- [x] Тесты проходят: vitest (784), storybook (188), cypress (271)
- [x] Нет ошибок линтера
