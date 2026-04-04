# TASK-153: SettingsButton (View)

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

Создать View-компонент кнопки "Edit WIP limits by field" для страницы настроек Card Layout. Использует antd Button.

## Файлы

```
src/features/field-limits/SettingsPage/components/
└── SettingsButton.tsx    # новый
```

## Что сделать

1. Создать `SettingsButton` — чистый View-компонент:

```tsx
export interface SettingsButtonProps {
  onClick: () => void;
}
```

2. Использовать `antd Button` с `type="primary"` и иконкой `SettingOutlined`
3. Текст кнопки: "Edit WIP limits by field"

## Критерии приёмки

- [ ] Компонент принимает `onClick` prop
- [ ] Использует antd Button
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: нет (чистый View)
- Референс: `src/swimlane-wip-limits/SettingsPage/components/SettingsButton.tsx`

---

## Результаты

**Дата**: 2025-03-13

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `SettingsButton.tsx` — чистый View-компонент с props `onClick`
- Создан `SettingsButton.cy.tsx` — Cypress component tests (3 теста)
- Компонент использует antd Button, SettingOutlined, data-testid="field-limits-settings-button"
- npm test (Vitest) — 724 passed
- Cypress component tests — 3 passed
- ESLint — без ошибок

**Проблемы и решения**:

Нет
