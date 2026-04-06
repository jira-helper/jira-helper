# TASK-185: Миграция Settings page — containers, index, helpers, удаление legacy

**Status**: VERIFICATION

**Parent**: [EPIC-18](./EPIC-18-column-limits-refactor.md)

---

## Описание

Заменить zustand в контейнерах на `useDi().inject(propertyModelToken | settingsUIModelToken)` и `useModel()` / `useSnapshot`. Обновить `SettingsPage/index.ts` для вызова `registerColumnLimitsModule`. Адаптировать Cypress helpers. Удалить `SettingsPage/stores/` и `SettingsPage/actions/`.

## Файлы

**Изменить:**

```
src/column-limits/SettingsPage/components/SettingsButton/SettingsButtonContainer.tsx
src/column-limits/SettingsPage/components/SettingsModal/SettingsModalContainer.tsx
src/column-limits/SettingsPage/index.ts
src/column-limits/SettingsPage/features/helpers.tsx
src/column-limits/SettingsPage/features/*.feature.cy.tsx
src/column-limits/SettingsPage/features/steps/common.steps.ts
```

**Удалить:**

```
src/column-limits/SettingsPage/stores/
src/column-limits/SettingsPage/actions/
```

## Контракты контейнеров (из target-design)

```typescript
export type SettingsButtonContainerProps = {
  getColumns: () => NodeListOf<Element>;
  getColumnName: (el: HTMLElement) => string;
  swimlanes?: Array<{ id: string; name: string }>;
};

export type SettingsModalContainerProps = {
  onClose: () => void;
  onSave: () => Promise<void>;
  swimlanes?: Array<{ id: string; name: string }>;
};
```

Изменения по смыслу: `useColumnLimitsPropertyStore` → `propertyModel` через DI; `initFromProperty` / `saveToProperty` actions → `settingsUIModel.initFromProperty()` / `settingsUIModel.save()`; селекторы store → поля модели.

## Что сделать

1. Обновить `SettingsButtonContainer.tsx` и `SettingsModalContainer.tsx` на модели из DI; убрать импорты zustand stores/actions.
2. Обновить `SettingsPage/index.ts`: `registerColumnLimitsModule` при инициализации страницы (паттерн как в `swimlane-wip-limits/SettingsPage` или `field-limits`).
3. Адаптировать `features/helpers.tsx` и при необходимости step-файлы для Cypress.
4. Удалить `stores/` и `actions/`; почистить индексы.
5. Прогнать Storybook / тесты контейнеров (`SettingsButtonContainer.test.tsx`, `SettingsModalContainer.test.tsx`).

## Критерии приёмки

- [x] Модалка и кнопка настроек работают через `PropertyModel` + `SettingsUIModel`; zustand для column-limits settings не используется.
- [x] BDD helpers/steps переведены на DI (Cypress BDD не входили в `npm test`; при необходимости прогнать отдельно).
- [x] `SettingsPage/stores/` и `SettingsPage/actions/` удалены.
- [x] Тесты проходят: `npm test` (830 тестов)
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-184](./TASK-184-settings-ui-model.md)
- Референсы:
  - `src/swimlane-wip-limits/SettingsPage/` (containers + index)
  - `src/features/field-limits/SettingsPage/SettingsPageModification.ts` и components
  - Текущие: `src/column-limits/SettingsPage/components/SettingsButton/SettingsButtonContainer.tsx`, `SettingsModal/SettingsModalContainer.tsx`

---

## Результаты

**Дата**: 2026-04-05

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- `SettingsButtonContainer` / `SettingsModalContainer`: `propertyModelToken` + `settingsUIModelToken`, `useModel()` / мутации на классе `SettingsUIModel`; удалены zustand и action-импорты.
- `SettingsPage/index.ts`: `registerColumnLimitsModule(this.container)` и `propertyModel.setData(wipLimits)` вместо property zustand.
- Cypress `features/helpers.tsx` и `features/steps/common.steps.ts`: `registerColumnLimitsModule`, mock `BoardPropertyService`, `boardPagePageObject`, сброс/запись через токены; в mock routing добавлен `getBoardIdFromURL`.
- `utils/buildInitData.ts`: тип `InitFromPropertyData` из `models/SettingsUIModel.ts`.
- Удалены `SettingsPage/stores/*` и `SettingsPage/actions/*`; обновлены unit-тесты контейнеров под реальный DI.
- Прогоны: `npm test`, `npm run lint:eslint -- --fix` — успешно.

**Проблемы и решения**:

- `buildInitData` импортировал тип из удаляемого `actions/initFromProperty` — перенесён импорт на `SettingsUIModel`.
- Для BDD-хелперов `BoardPropertyService` требовал `getBoardIdFromURL` в `routingServiceToken` — дополнен partial-mock роутинга.
