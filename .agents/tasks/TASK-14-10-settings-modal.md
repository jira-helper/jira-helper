# TASK-14-10: SettingsModal

**Epic**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)
**Status**: DONE
**Depends on**: TASK-14-6, TASK-14-9

---

## Цель

Создать React-компонент `SettingsModal` для редактирования настроек WIP-лимитов swimlanes.

---

## Файлы

| Файл | Действие |
|------|----------|
| `src/swimlane-wip-limits/SettingsPage/components/SettingsModal.tsx` | Создание |
| `src/swimlane-wip-limits/SettingsPage/components/SettingsModal.test.tsx` | Создание |
| `src/swimlane-wip-limits/SettingsPage/components/index.ts` | Изменение |

---

## Требуемые изменения

### 1. SettingsModal.tsx

```typescript
import React from 'react';
import { Modal, Alert, Spin } from 'antd';
import { SwimlaneLimitsTable } from './SwimlaneLimitsTable';
import { settingsUIModelToken } from '../../tokens';
import { useDi } from '@/shared/di/react';
import type { SwimlaneSetting } from '../../types';

export const SettingsModal: React.FC = () => {
  const { useModel } = useDi(settingsUIModelToken);
  const uiModel = useModel();

  const handleOk = async () => {
    await uiModel.save();
  };

  const handleCancel = () => {
    uiModel.close();
  };

  const handleChange = (swimlaneId: string, update: Partial<SwimlaneSetting>) => {
    uiModel.updateDraft(swimlaneId, update);
  };

  return (
    <Modal
      title="Swimlane WIP Limits"
      open={uiModel.isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={uiModel.isSaving}
      width={600}
      data-testid="settings-modal"
    >
      {uiModel.error && (
        <Alert 
          type="error" 
          message={uiModel.error} 
          style={{ marginBottom: 16 }}
          data-testid="error-alert"
        />
      )}
      
      <SwimlaneLimitsTable
        swimlanes={uiModel.swimlanes}
        settings={uiModel.draft}
        onChange={handleChange}
        disabled={uiModel.isSaving}
      />
    </Modal>
  );
};
```

### 2. Component тест

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsModal } from './SettingsModal';
import { TestDIProvider } from '@/test-utils/TestDIProvider';

describe('SettingsModal', () => {
  it('should render modal when isOpen is true', () => {
    const mockModel = createMockSettingsUIModel({ isOpen: true });
    
    render(
      <TestDIProvider models={{ settingsUIModel: mockModel }}>
        <SettingsModal />
      </TestDIProvider>
    );
    
    expect(screen.getByTestId('settings-modal')).toBeInTheDocument();
  });

  it('should call save on OK button', async () => {
    const mockModel = createMockSettingsUIModel({ isOpen: true });
    
    render(
      <TestDIProvider models={{ settingsUIModel: mockModel }}>
        <SettingsModal />
      </TestDIProvider>
    );
    
    fireEvent.click(screen.getByText('OK'));
    
    await waitFor(() => {
      expect(mockModel.save).toHaveBeenCalled();
    });
  });

  it('should display error alert', () => {
    const mockModel = createMockSettingsUIModel({ 
      isOpen: true, 
      error: 'Save failed' 
    });
    
    render(
      <TestDIProvider models={{ settingsUIModel: mockModel }}>
        <SettingsModal />
      </TestDIProvider>
    );
    
    expect(screen.getByTestId('error-alert')).toBeInTheDocument();
  });
});
```

---

## Acceptance Criteria

- [ ] Modal использует Ant Design
- [ ] Интегрирует `SwimlaneLimitsTable`
- [ ] Получает модель через `settingsUIModelToken`
- [ ] Показывает Alert при ошибке
- [ ] confirmLoading при сохранении
- [ ] Component тесты
- [ ] `npm run lint:eslint` проходит

---

## Контекст

Смотри:
- `tasks/target-design-swimlane-v2.md` — спецификация
- `src/column-limits/SettingsPage/components/SettingsModal/` — пример

---

## Результаты

**Дата**: 2026-03-05

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `SettingsModal` с Ant Design Modal
- Интегрирован `SwimlaneLimitsTable` для редактирования
- Показывает Spin при загрузке, Alert при ошибке
- 7 component тестов

**Проблемы и решения**:

**Проблема 1: Spin не находится в тесте**

Контекст: Modal рендерится в портал, querySelector не работает

Решение: Добавлен data-testid="settings-modal-loading"

**Проблема 2: TypeScript несовпадение мока**

Контекст: Мок не содержал все поля SettingsUIModel

Решение: Добавлены недостающие поля и приведение типа
