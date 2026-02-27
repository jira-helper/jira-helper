# TASK-2: Создать SettingsButton View компонент

**Status**: DONE

**Parent**: [EPIC-2](./EPIC-2-person-limits-react-migration.md)

---

## Описание

Создать React View-компонент `SettingsButton` — кнопку "Manage per-person WIP-limits", которая заменяет HTML-шаблон `groupSettingsBtnTemplate()`. По паттерну из `column-limits/SettingsPage/components/SettingsButton/`.

## Файлы

```
src/person-limits/SettingsPage/components/SettingsButton/
├── index.ts                    # новый — экспорты
├── SettingsButton.tsx          # новый — View компонент
├── SettingsButton.cy.tsx       # новый — Cypress component tests (НЕ .test.tsx!)
└── SettingsButton.stories.tsx  # новый — Storybook stories
```

## Что сделать

1. Создать `SettingsButton.tsx`:
   ```typescript
   import React from 'react';
   import { settingsJiraDOM } from '../../constants';

   export type SettingsButtonProps = {
     onClick: () => void;
     disabled?: boolean;
   };

   export const SettingsButton: React.FC<SettingsButtonProps> = ({
     onClick,
     disabled = false,
   }) => (
     <button
       id={settingsJiraDOM.openEditorBtn}
       className="aui-button"
       onClick={onClick}
       disabled={disabled}
       type="button"
     >
       Manage per-person WIP-limits
     </button>
   );
   ```

2. Создать `index.ts`:
   ```typescript
   export { SettingsButton } from './SettingsButton';
   export type { SettingsButtonProps } from './SettingsButton';
   ```

3. Создать `SettingsButton.stories.tsx`:
   - Story: `Default` — обычная кнопка
   - Story: `Disabled` — заблокированная кнопка

## Тестирование

> **НЕ используем react-testing-library.** Пишем Cypress component tests (`.cy.tsx`).

Тесты: `SettingsButton.cy.tsx` — проверяют рендеринг, onClick, disabled.

Запуск: `npx cypress run --component --spec "src/person-limits/SettingsPage/components/SettingsButton/SettingsButton.cy.tsx"`

## Критерии приёмки

- [x] Компонент рендерит `<button>` с текстом "Manage per-person WIP-limits"
- [x] Кнопка имеет `id={settingsJiraDOM.openEditorBtn}` и `className="aui-button"`
- [x] `onClick` вызывается при клике
- [x] `disabled` prop работает
- [x] Storybook stories отображаются корректно
- [x] Cypress тесты проходят (`SettingsButton.cy.tsx`)
- [x] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-1](./TASK-1-extract-constants.md) (для импорта `settingsJiraDOM` из `constants`)
- Блокирует: [TASK-5](./TASK-5-create-settings-button-container.md)
- Референс: `src/column-limits/SettingsPage/components/SettingsButton/SettingsButton.tsx`

---

## Результаты

**Дата**: 2026-02-11

**Агент**: Coder

**Статус**: DONE

**Комментарии**: 
- Создан Cypress component test `SettingsButton.cy.tsx` с 5 тестами:
  1. Рендеринг кнопки с текстом "Manage per-person WIP-limits"
  2. Вызов `onClick` при клике
  3. Работа `disabled` prop
  4. Проверка `className="aui-button"`
  5. Проверка `id` из `settingsJiraDOM.openEditorBtn`
- Все тесты проходят успешно (5 passing)
- Тесты используют только Cypress (`cy.mount`, `cy.contains`, `cy.get`, `.should()`)
- Используется `cy.stub()` для callbacks
