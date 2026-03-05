# TASK-14-17: Legacy Cleanup

**Epic**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)
**Status**: TODO
**Depends on**: TASK-14-11, TASK-14-12, TASK-14-16

---

## Цель

Удалить legacy реализацию swimlane и включить новые фичи.

---

## Файлы

| Файл | Действие |
|------|----------|
| `src/swimlane/SwimlaneLimits.ts` | Удаление |
| `src/swimlane/SwimlaneStats.ts` | Удаление |
| `src/swimlane/SwimlaneSettingsPopup.ts` | Удаление |
| `src/swimlane/constants.ts` | Удаление |
| `src/swimlane/utils.ts` | Удаление |
| `src/swimlane/styles.module.css` | Удаление |
| `src/swimlane/index.ts` | Удаление |
| `src/swimlane/` | Удаление папки |
| `src/background.ts` | Изменение |
| `src/content.ts` | Изменение |

---

## Требуемые изменения

### 1. Удалить legacy файлы

```bash
rm -rf src/swimlane/
```

### 2. Обновить регистрацию в content.ts

```typescript
// Было
import SwimlaneLimits from './swimlane/SwimlaneLimits';
import SwimlaneStats from './swimlane/SwimlaneStats';
import SwimlaneSettingsPopup from './swimlane/SwimlaneSettingsPopup';

// Стало
import { BoardPageModification as SwimlaneLimitsBoardMod } from './swimlane-wip-limits/BoardPage';
import { SettingsPageModification as SwimlaneLimitsSettingsMod } from './swimlane-wip-limits/SettingsPage';
import { HistogramModification } from './swimlane-histogram';

// Регистрация
registerModification(SwimlaneLimitsBoardMod);
registerModification(SwimlaneLimitsSettingsMod);
registerModification(HistogramModification);
```

### 3. Зарегистрировать DI модули

```typescript
import { registerSwimlaneWipLimitsModule } from './swimlane-wip-limits/module';
import { registerSwimlaneHistogramModule } from './swimlane-histogram/module';

// В init()
registerSwimlaneWipLimitsModule();
registerSwimlaneHistogramModule();
```

### 4. Проверить миграцию данных

Убедиться что `mergeSwimlaneSettings()` корректно мигрирует старые настройки (без `columns`) в новый формат.

---

## Pre-условия

Перед выполнением этой задачи:

1. [ ] Все новые фичи работают корректно (ручное тестирование)
2. [ ] Все тесты проходят
3. [ ] Новые фичи покрывают 100% функциональности legacy
4. [ ] Миграция настроек работает (старые settings → новые)

---

## Acceptance Criteria

- [ ] Legacy файлы удалены
- [ ] Новые модификации зарегистрированы
- [ ] DI модули зарегистрированы
- [ ] Приложение запускается без ошибок
- [ ] WIP-лимиты работают на BoardPage
- [ ] Настройки WIP-лимитов работают на SettingsPage
- [ ] Гистограмма работает на BoardPage
- [ ] Миграция старых настроек работает
- [ ] `npm run lint:eslint` проходит
- [ ] `npm run test` проходит
- [ ] `npm run build` проходит

---

## Rollback план

Если что-то пошло не так:
1. `git revert` этого коммита
2. Вернуть legacy файлы
3. Откатить регистрацию модификаций

---

## Контекст

Эта задача выполняется ПОСЛЕДНЕЙ, когда все новые фичи готовы и протестированы.

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: DONE

**Что сделано**:

{Краткое описание выполненных изменений — 2-5 пунктов}

- Создан файл X с Y
- Обновлён файл Z
- Добавлены тесты

**Проблемы и решения**:

{ОБЯЗАТЕЛЬНО! Документируй ВСЕ проблемы, с которыми столкнулся, и как их решил.}

**Проблема 1: {Название}**

Контекст: {Описание}

Решение: {Как решил}
