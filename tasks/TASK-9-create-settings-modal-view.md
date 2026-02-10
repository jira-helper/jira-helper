# TASK-9: Создать SettingsModal (View)

**Status**: TODO

**Parent**: [EPIC-1](./EPIC-1-fix-closing-group-limits.md)

**Target Design**: [target-design.md](./target-design.md)

**Depends on**: [TASK-8](./TASK-8-create-settings-button-container.md)

---

## Описание

Создать чистый View-компонент модального окна для настроек групповых лимитов.

## Файлы для создания

```
src/column-limits/SettingsPage/components/SettingsModal/
├── SettingsModal.tsx
├── SettingsModal.module.css
└── index.ts
```

## Что сделать

### 1. Создать `SettingsModal.tsx`

```typescript
import React from 'react';
import styles from './SettingsModal.module.css';

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
  <>
    <div className={styles.overlay} onClick={onClose} />
    <section className={styles.modal} role="dialog" aria-modal="true">
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </header>
      <div className={styles.content}>
        {children}
      </div>
      <footer className={styles.footer}>
        <button
          className={styles.primaryButton}
          onClick={onSave}
          disabled={isSaving}
          type="button"
        >
          {isSaving ? 'Saving...' : okButtonText}
        </button>
        <button
          className={styles.secondaryButton}
          onClick={onClose}
          disabled={isSaving}
          type="button"
        >
          Cancel
        </button>
      </footer>
    </section>
  </>
);
```

### 2. Создать `SettingsModal.module.css`

```css
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2999;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  z-index: 3000;
  min-width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 16px 20px;
  border-bottom: 1px solid #ddd;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

.content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.footer {
  padding: 16px 20px;
  border-top: 1px solid #ddd;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.primaryButton {
  padding: 8px 16px;
  background: #0052cc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.primaryButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.secondaryButton {
  padding: 8px 16px;
  background: #f4f5f7;
  color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.secondaryButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 3. Создать `index.ts`

```typescript
export { SettingsModal } from './SettingsModal';
export type { SettingsModalProps } from './SettingsModal';
```

## Критерии приёмки

- [ ] Файл `SettingsModal.tsx` создан
- [ ] Компонент принимает props: `title`, `children`, `onClose`, `onSave`, `isSaving`, `okButtonText`
- [ ] Компонент чистый (не использует hooks, store)
- [ ] Кнопка Cancel вызывает `onClose`
- [ ] Кнопка Save вызывает `onSave`
- [ ] При `isSaving=true` кнопки заблокированы
- [ ] Файл стилей создан
- [ ] Экспорт настроен в `index.ts`
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- src/column-limits/SettingsPage/components/SettingsModal/`

## Проблемы с линтером

```
(место для записи ошибок)
```

---

## Результаты

**Дата**: 

**Агент**: 

**Статус**: 

**Комментарии**:

```
(место для комментариев агента)
```
