# TASK-166: Cypress BDD Infrastructure — helpers + steps

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Создать инфраструктуру для Cypress BDD тестов фичи Field WIP Limits: helpers с фикстурами, mount функциями и DI setup, а также общие step definitions для всех feature файлов.

## Файлы

```
src/features/field-limits/SettingsPage/features/
├── helpers.tsx                 # новый
└── steps/
    └── common.steps.ts         # новый
```

## Что сделать

### 1. `helpers.tsx` — фикстуры, mount, DI setup

По аналогии с `src/person-limits/SettingsPage/features/helpers.tsx`:

1. **Фикстуры** — mock данные, совпадающие с Background в .feature файлах:
   - `fields: CardLayoutField[]` — Priority, Team, Component
   - `columns: BoardColumn[]` — To Do, In Progress, Done
   - `swimlanes: BoardSwimlane[]` — Frontend, Backend

2. **`setupBackground()`** — вызывается в Background каждого .feature.cy.tsx:
   - `globalContainer.reset()`
   - `registerLogger(globalContainer)`
   - Регистрация DI токенов (getBoardIdFromURLToken, updateBoardPropertyToken)
   - Мок `getBoardEditData` → возвращает mockBoardEditData
   - Вызов `registerFieldLimitsModule(globalContainer)` для регистрации моделей
   - Reset PropertyModel и SettingsUIModel

3. **`mountSettingsButton()`** — монтирует ConnectedSettingsButton + SettingsModal:
   ```tsx
   cy.mount(
     <WithDi container={globalContainer}>
       <ConnectedSettingsButton />
       <SettingsModal />
     </WithDi>
   );
   ```

4. **`createFieldLimit()`** — хелпер для создания FieldLimit объекта в тестах

### 2. `steps/common.steps.ts` — общие step definitions

По аналогии с `src/person-limits/SettingsPage/features/steps/common.steps.ts`:

**Given steps** (настройка состояния через модель):
- `Given a field limit: field "X" value "Y" visualName "Z" limit N columns "A,B" swimlanes "C,D"`
- `Given there are no limits configured`

**When steps** (действия через UI):
- `When I open the settings modal`
- `When I select field "X"`
- `When I type "X" in field value input`
- `When I type "X" in visual name input`
- `When I set the limit to N`
- `When I select columns "X, Y"`
- `When I select swimlanes "X"`
- `When I click "X"` (кнопки Add limit, Edit limit, Save, Cancel)
- `When I click "Edit" on the limit for "X"`
- `When I click "Delete" on the limit for "X"`
- `When I select limit "X" in the table` (checkbox)

**Then steps** (проверки через UI):
- `Then I should see the Field WIP Limits modal`
- `Then I do not see the modal`
- `Then I should see N limits in the table`
- `Then I should see an empty limits table`
- `Then I should see limit: field "X" value "Y" limit N columns "A" swimlanes "B"`
- `Then "X" should not be in the limits list`
- `Then the form should be reset`
- `Then the "X" button should be disabled`
- `Then the field select should show "X"`
- `Then the field value input should show "X"`
- `Then the limit field should show value N`

## Критерии приёмки

- [ ] `setupBackground()` корректно инициализирует DI и моки
- [ ] `mountSettingsButton()` монтирует реальные компоненты через WithDi
- [ ] Все Given-степы настраивают state через PropertyModel/SettingsUIModel
- [ ] Все When-степы взаимодействуют через UI (cy.click, cy.type, etc.)
- [ ] Все Then-степы проверяют через UI (cy.contains, cy.should)
- [ ] Степы атомарные и переиспользуемые между файлами
- [ ] `npx cypress run --component --spec "src/features/field-limits/**/*.cy.tsx"` — smoke test

## Зависимости

- Зависит от: [TASK-165](./TASK-165-field-limits-feature-files.md)
- Референс: `src/person-limits/SettingsPage/features/helpers.tsx`, `src/person-limits/SettingsPage/features/steps/common.steps.ts`
- Скиллы: `.cursor/skills/cypress-bdd-testing/SKILL.md`

---

## Результаты

**Дата**: 2026-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

{Заполняется после выполнения задачи}

**Проблемы и решения**:

{Документируй ВСЕ проблемы, с которыми столкнулся, и как их решил}
