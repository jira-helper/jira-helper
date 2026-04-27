# TASK-51: Update SwimlaneSelector stories

**Status**: VERIFICATION
**Type**: stories

**Parent**: [EPIC-2](./EPIC-2-all-swimlanes-behavior.md)

---

## Описание

Обновить Storybook stories для `SwimlaneSelector`, чтобы визуально были явно представлены all mode, manual partial selection, empty swimlanes и single swimlane. Stories должны помогать проверить issue #23 без знания реализации; если проектный Storybook setup поддерживает `play`, добавить interaction для all → manual.

## Файлы

```text
src/shared/components/SwimlaneSelector/
└── SwimlaneSelector.stories.tsx   # изменение
```

## Что сделать

1. Переименовать или дополнить stories так, чтобы были понятны состояния `AllMode` и `ManualSelection`.
2. Для all mode использовать `initialValue=[]` и ожидать скрытый список.
3. Для manual mode использовать partial selection, например `['frontend', 'backend']`, и ожидать visible list.
4. Сохранить stories для empty и single swimlane, если они полезны для edge cases.
5. Если доступен существующий Storybook `play` паттерн, добавить play interaction, который кликает **All swimlanes** и проверяет видимость списка.
6. Не добавлять бизнес-логику в stories beyond simple wrapper state.

## Критерии приёмки

- [ ] В Storybook есть отдельная story для all mode.
- [ ] В Storybook есть отдельная story для manual selection.
- [ ] Есть Storybook `play` interaction для клика all → manual либо в результатах задачи объяснено, почему Cypress component test выбран вместо play.
- [ ] Stories используют существующий `SwimlaneSelectorWrapper` или простой эквивалент.
- [ ] ESLint проходит для `SwimlaneSelector.stories.tsx`.

## Зависимости

- Может выполняться параллельно с [TASK-50](./TASK-50-align-swimlane-selector-behavior.md), но финальная визуальная проверка зависит от поведения из TASK-50.

---

## Результаты

**Дата**: 2026-04-27

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Добавлены явные stories `AllMode` и `ManualSelection`.
- Добавлена `AllMode_UncheckOpensManual` с Storybook `play`, который кликает **All swimlanes** и проверяет появление списка.
- Сохранены edge stories для empty/single/custom labels.

**Проблемы и решения**:

- Visual snapshots не добавлялись, чтобы не трогать baseline/allowlist.
- Проверки: ESLint PASS, TypeScript PASS, Storybook tests PASS (`220 tests`).
