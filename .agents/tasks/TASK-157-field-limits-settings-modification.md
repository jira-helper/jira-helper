# TASK-157: SettingsPageModification

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Создать точку входа для Settings Page — PageModification, который рендерит React-компоненты (SettingsButton + SettingsModal) на tab Card Layout в настройках доски.

## Файлы

```
src/features/field-limits/SettingsPage/
├── SettingsPageModification.ts    # новый
└── index.ts                       # новый (реэкспорт)
```

## Что сделать

1. Создать `SettingsPageModification extends PageModification`:

   - `shouldApply()` → `getSettingsTab() === 'cardLayout'`
   - `getModificationId()` → `'field-limits-settings-${boardId}'`
   - `waitForLoading()` → `waitForElement('#ghx-config-cardLayout')`
   - `apply()`:
     1. Вызвать `registerFieldLimitsModule(globalContainer)`
     2. Найти `#ghx-config-cardLayout > p` (описание card layout)
     3. Создать wrapper div после него
     4. `createRoot(wrapper).render(WithDi + SettingsButton + SettingsModal)`

   - Cleanup: unmount root при destroy

2. Создать `index.ts` с реэкспортом `SettingsPageModification`

3. Паттерн рендеринга — как в `src/swimlane-wip-limits/SettingsPage/SettingsPageModification.ts`

## Критерии приёмки

- [ ] Рендерится только на tab cardLayout
- [ ] SettingsButton и SettingsModal оборачиваются в WithDi
- [ ] registerFieldLimitsModule вызывается в apply()
- [ ] Cleanup: React root unmount при уходе со страницы
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-150](./TASK-150-field-limits-module.md), [TASK-153](./TASK-153-field-limits-settings-button.md), [TASK-156](./TASK-156-field-limits-settings-modal.md)
- Референс: `src/swimlane-wip-limits/SettingsPage/SettingsPageModification.ts`
- Legacy код: `src/field-limits/SettingsPage/index.ts:98-196` (shouldApply, waitForLoading, apply, renderEditButton)

---

## Результаты

**Дата**: 2025-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `src/features/field-limits/SettingsPage/SettingsPageModification.ts` — PageModification для tab cardLayout
- Создан `src/features/field-limits/SettingsPage/index.ts` — реэкспорт
- Создан `src/features/field-limits/SettingsPage/SettingsPageModification.test.ts` — 4 unit-теста (shouldApply, getModificationId)
- ConnectedSettingsButton — wrapper для SettingsButton с DI (model.open() по клику)
- apply(): registerFieldLimitsModule, рендер WithDi + ConnectedSettingsButton + SettingsModal после `#ghx-config-cardLayout > p`
- Cleanup: sideEffects.push(removeButton) с unmount root

**Проблемы и решения**:

- Модуль `registerFieldLimitsModule` пока не регистрирует SettingsUIModel (TODO в module.ts). Модификация будет работать после обновления модуля в TASK-152/150. Интеграция в content.ts — TASK-163.
