# TASK-52: Verify SwimlaneSelector consumers

**Status**: VERIFICATION
**Type**: other

**Parent**: [EPIC-2](./EPIC-2-all-swimlanes-behavior.md)

---

## Описание

Провести финальную проверку, что изменение shared-компонента корректно работает в местах использования: group limits (`ColumnLimitsForm`) и personal WIP limits (`PersonalWipLimitContainer`). Эта задача не должна добавлять новую бизнес-логику в consumers.

## Файлы

```text
src/features/column-limits-module/SettingsPage/ColumnLimitsForm.tsx                 # проверить, менять только если необходимо
src/features/person-limits-module/SettingsPage/components/PersonalWipLimitContainer.tsx # проверить, менять только если необходимо
src/shared/components/SwimlaneSelector/SwimlaneSelector.cy.tsx                      # запуск focused tests
```

## Что сделать

1. Проверить, что `ColumnLimitsForm` передает в `SwimlaneSelector` только `swimlanes`, `value`, `onChange`, `label`, `allLabel`.
2. Проверить, что `PersonalWipLimitContainer` не содержит дополнительной логики для режима all/manual swimlanes.
3. Запустить focused Cypress component spec для `SwimlaneSelector`.
4. Запустить ESLint для измененных файлов.
5. Если consumers требуют изменений, зафиксировать причину в результатах задачи. Если нет, оставить consumers без правок.

## Команды проверки

```bash
npx cypress run --component --spec "src/shared/components/SwimlaneSelector/SwimlaneSelector.cy.tsx"
npx eslint src/shared/components/SwimlaneSelector/SwimlaneSelector.tsx src/shared/components/SwimlaneSelector/SwimlaneSelector.cy.tsx src/shared/components/SwimlaneSelector/SwimlaneSelector.stories.tsx --fix
```

## Критерии приёмки

- [ ] Focused Cypress component spec проходит.
- [ ] ESLint проходит для измененных файлов.
- [ ] Consumers не получили дублирующую all/manual логику.
- [ ] Если были изменения в consumers, они описаны и покрыты проверкой.

## Зависимости

- Зависит от: [TASK-50](./TASK-50-align-swimlane-selector-behavior.md).
- Зависит от: [TASK-51](./TASK-51-update-swimlane-selector-stories.md).

---

## Результаты

**Дата**: 2026-04-27

**Агент**: QA / Coder

**Статус**: VERIFICATION

**Что сделано**:

- Проверены consumers: `ColumnLimitsForm` и `PersonalWipLimitContainer` не содержат собственной all/manual UI-логики для swimlanes.
- Запущены финальные проверки: ESLint, TypeScript, Storybook tests, focused Cypress.
- Полный лог сохранён в `.logs/issue-23-final-verify.log`.

**Проблемы и решения**:

- В окружении без `Xvfb` Cypress не стартовал. После запуска через `xvfb-run` focused spec прошёл: `9 passing, 0 failing`.
