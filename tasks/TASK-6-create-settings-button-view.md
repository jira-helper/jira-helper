# TASK-6: Создать SettingsButton (View)

**Status**: TODO

**Parent**: [EPIC-1](./EPIC-1-fix-closing-group-limits.md)

**Target Design**: [target-design.md](./target-design.md)

**Depends on**: [TASK-5](./TASK-5-run-eslint.md)

---

## Описание

Создать чистый View-компонент кнопки для открытия модалки настроек групповых лимитов.

## Файлы для создания

```
src/column-limits/SettingsPage/components/SettingsButton/
├── SettingsButton.tsx
├── SettingsButton.module.css
└── index.ts
```

## Что сделать

### 1. Создать `SettingsButton.tsx`

```typescript
import React from 'react';
import styles from './SettingsButton.module.css';

export type SettingsButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export const SettingsButton: React.FC<SettingsButtonProps> = ({ 
  onClick, 
  disabled = false 
}) => (
  <button
    id="jh-add-group-btn"
    className={styles.button}
    onClick={onClick}
    disabled={disabled}
    type="button"
  >
    Group limits
  </button>
);
```

### 2. Создать `SettingsButton.module.css`

```css
.button {
  /* Скопировать стили из существующего htmlTemplates.ts или styles.module.css */
  cursor: pointer;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### 3. Создать `index.ts`

```typescript
export { SettingsButton } from './SettingsButton';
export type { SettingsButtonProps } from './SettingsButton';
```

## Критерии приёмки

- [ ] Файл `SettingsButton.tsx` создан
- [ ] Компонент принимает props: `onClick`, `disabled`
- [ ] Компонент чистый (не использует hooks, store)
- [ ] Файл стилей создан
- [ ] Экспорт настроен в `index.ts`
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- src/column-limits/SettingsPage/components/SettingsButton/`

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
