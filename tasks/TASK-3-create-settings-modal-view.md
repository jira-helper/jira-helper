# TASK-3: Создать SettingsModal View компонент

**Status**: DONE

**Parent**: [EPIC-2](./EPIC-2-person-limits-react-migration.md)

---

## Описание

Создать React View-компонент `SettingsModal` — обёртку на Ant Design `Modal` с кнопками Save/Cancel. Заменяет `Popup` класс из `src/shared/getPopup.ts`. Аналогичен `column-limits/SettingsPage/components/SettingsModal/SettingsModal.tsx`.

## Файлы

```
src/person-limits/SettingsPage/components/SettingsModal/
├── index.ts                    # новый — экспорты
├── SettingsModal.tsx           # новый — View компонент
├── SettingsModal.cy.tsx        # новый — Cypress component tests (НЕ .test.tsx!)
└── SettingsModal.stories.tsx   # новый — Storybook stories
```

## Что сделать

1. Создать `SettingsModal.tsx`:
   ```typescript
   import React from 'react';
   import { Modal, Button } from 'antd';

   export type SettingsModalProps = {
     title: string;
     children: React.ReactNode;
     onClose: () => void;
     onSave: () => void;
     isSaving?: boolean;
     okButtonText?: string;
   };

   export const SettingsModal: React.FC<SettingsModalProps> = ({
     title,
     children,
     onClose,
     onSave,
     isSaving = false,
     okButtonText = 'Save',
   }) => (
     <Modal
       open
       title={title}
       onCancel={onClose}
       width={800}
       maskClosable={false}
       footer={[
         <Button key="cancel" onClick={onClose} disabled={isSaving}>
           Cancel
         </Button>,
         <Button key="save" type="primary" onClick={onSave} loading={isSaving}>
           {okButtonText}
         </Button>,
       ]}
     >
       {children}
     </Modal>
   );
   ```

2. Создать `index.ts`:
   ```typescript
   export { SettingsModal } from './SettingsModal';
   export type { SettingsModalProps } from './SettingsModal';
   ```

3. Создать `SettingsModal.stories.tsx`:
   - Story: `Empty` — модалка без содержимого
   - Story: `WithContent` — модалка с текстовым содержимым
   - Story: `Saving` — модалка в состоянии сохранения (loading кнопка)

## Тестирование

> **НЕ используем react-testing-library.** Пишем Cypress component tests (`.cy.tsx`).

Тесты: `SettingsModal.cy.tsx` — проверяют рендеринг, Cancel, Save, isSaving, children.

Запуск: `npx cypress run --component --spec "src/person-limits/SettingsPage/components/SettingsModal/SettingsModal.cy.tsx"`

## Критерии приёмки

- [ ] Компонент рендерит Ant Design `Modal` с title и footer
- [ ] Footer содержит кнопки Cancel и Save
- [ ] `isSaving` блокирует Cancel и показывает loading на Save
- [ ] `onClose` вызывается при клике на Cancel и на крестик
- [ ] `onSave` вызывается при клике на Save
- [ ] `children` рендерятся внутри модалки
- [ ] Storybook stories отображаются корректно
- [ ] Cypress тесты проходят (`SettingsModal.cy.tsx`)
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: нет
- Блокирует: [TASK-4](./TASK-4-create-settings-modal-container.md)
- Референс: `src/column-limits/SettingsPage/components/SettingsModal/SettingsModal.tsx`

---

## Результаты

**Дата**: 2026-02-11

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

Создан SettingsModal View компонент:
- `SettingsModal.tsx` — View компонент с Ant Design Modal (уже существовал, проверен)
- `index.ts` — экспорты (уже существовал, проверен)
- `SettingsModal.stories.tsx` — Storybook stories с Empty, WithContent, Saving (уже существовал, проверен)
- `SettingsModal.cy.tsx` — Cypress component tests (создан, заменяет удалённый `.test.tsx`)

Удалён файл `SettingsModal.test.tsx` (использовал react-testing-library, что не соответствует требованиям).

Cypress тесты: 10 passing (рендеринг, Cancel/Save кнопки, isSaving состояние, custom okButtonText, закрытие через X).
ESLint: ошибок в созданных файлах нет.
