# TASK-14-6: SettingsUIModel

**Epic**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)
**Status**: DONE
**Depends on**: TASK-14-3

---

## Цель

Создать `SettingsUIModel` — Valtio модель для управления UI настроек WIP-лимитов.

---

## Файлы

| Файл | Действие |
|------|----------|
| `src/swimlane-wip-limits/SettingsPage/models/SettingsUIModel.ts` | Создание |
| `src/swimlane-wip-limits/SettingsPage/models/SettingsUIModel.test.ts` | Создание |
| `src/swimlane-wip-limits/SettingsPage/models/index.ts` | Создание |

---

## Требуемые изменения

### 1. SettingsUIModel

```typescript
import { proxy } from 'valtio';
import type { Result } from 'ts-results';
import type { SwimlaneSettings, Swimlane, SwimlaneSetting } from '../../types';
import type { PropertyModel } from '../../property/PropertyModel';
import type { IBoardService } from '@/shared/services/BoardService';

export class SettingsUIModel {
  // State
  isOpen = false;
  draft: SwimlaneSettings = {};
  swimlanes: Swimlane[] = [];
  editingSwimlaneId: string | null = null;
  error: string | null = null;
  isSaving = false;

  constructor(
    private propertyModel: PropertyModel,
    private boardService: IBoardService,
    private logger: ILogger,
  ) {}

  /** Открыть модаль: загрузить настройки и swimlanes */
  async open(): Promise<Result<void, Error>>;

  /** Сохранить draft и закрыть */
  async save(): Promise<Result<void, Error>>;

  /** Закрыть без сохранения */
  close(): void;

  /** Обновить настройки swimlane в draft */
  updateDraft(swimlaneId: string, update: Partial<SwimlaneSetting>): void;

  /** Установить редактируемый swimlane */
  setEditingSwimlaneId(id: string | null): void;
}
```

### 2. Метод open()

```typescript
async open(): Promise<Result<void, Error>> {
  this.error = null;
  
  const [settingsResult, boardDataResult] = await Promise.all([
    this.propertyModel.load(),
    this.boardService.getBoardEditData(),
  ]);
  
  if (settingsResult.err) return settingsResult;
  if (boardDataResult.err) return boardDataResult;
  
  this.draft = { ...settingsResult.val };
  this.swimlanes = boardDataResult.val.swimlanesConfig?.swimlanes ?? [];
  this.isOpen = true;
  
  return Ok(undefined);
}
```

---

## Acceptance Criteria

- [ ] Модель реализует open/save/close/updateDraft/setEditingSwimlaneId
- [ ] `open()` загружает настройки и swimlanes параллельно
- [ ] `save()` сохраняет draft и закрывает модаль
- [ ] При ошибке сохранения модаль остаётся открытой, показывается error
- [ ] Тесты на все методы (success/error)
- [ ] `npm run lint:eslint` проходит

---

## Контекст

Смотри:
- `tasks/target-design-swimlane-v2.md` — спецификация SettingsUIModel
- `src/column-limits/SettingsPage/stores/uiStore.ts` — пример

---

## Результаты

**Дата**: 2026-03-05

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `SettingsUIModel` с методами `open`, `save`, `close`, `updateDraft`, `setEditingSwimlaneId`, `reset`
- Добавлен getter `hasUnsavedChanges`
- 14 unit-тестов по TDD
- Создана структура папок `SettingsPage/models/`

**Проблемы и решения**:

**Проблема 1: hasUnsavedChanges тест падал**

Контекст: Мок PropertyModel не обновлял settings при load()

Решение: Добавлен mockImplementation, который обновляет settings
