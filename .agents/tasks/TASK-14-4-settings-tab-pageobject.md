# TASK-14-4: SwimlaneLimitsSettingsTabPageObject

**Epic**: [EPIC-14](./EPIC-14-swimlane-antd-migration.md)
**Status**: DONE
**Depends on**: —

---

## Цель

Создать `SwimlaneLimitsSettingsTabPageObject` для работы с DOM на странице настроек доски, по аналогии с `CardColorsSettingsTabPageObject`.

---

## Файлы

| Файл | Действие |
|------|----------|
| `src/page-objects/SwimlaneLimitsSettingsTabPageObject.ts` | Создание |
| `src/page-objects/SwimlaneLimitsSettingsTabPageObject.test.ts` | Создание |
| `src/page-objects/SettingsPage.ts` | Изменение |

---

## Требуемые изменения

### 1. SwimlaneLimitsSettingsTabPageObject

```typescript
export class SwimlaneLimitsSettingsTabPageObject {
  static selectors = {
    swimlaneStrategy: '.ghx-swimlane-strategy',
    configContainer: '#ghx-swimlane-config',
    settingsButton: '[data-jh-swimlane-settings]',
  };

  /** Проверить, что используется custom swimlane strategy */
  isCustomSwimlaneStrategy(): boolean;

  /** Получить контейнер для вставки кнопки настроек */
  getConfigContainer(): Element | null;

  /** Вставить кнопку настроек */
  insertSettingsButton(component: React.ReactNode): void;

  /** Удалить кнопку настроек */
  removeSettingsButton(): void;
}
```

### 2. Добавить в SettingsPage

```typescript
class SettingsPage {
  // ... существующие методы ...

  public static getSwimlaneLimitsSettingsTabPageObject() {
    return new SwimlaneLimitsSettingsTabPageObject();
  }
}
```

---

## Acceptance Criteria

- [ ] PageObject создан с методами Query и Command
- [ ] Добавлен getter в `SettingsPage`
- [ ] Unit-тесты на все методы
- [ ] `npm run lint:eslint` проходит

---

## Контекст

Смотри:
- `src/page-objects/CardColorsSettingsTabPageObject.ts` — паттерн
- `src/swimlane/SwimlaneSettingsPopup.ts` — legacy селекторы

---

## Результаты

**Дата**: 2026-03-05

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Создан `SwimlaneLimitsSettingsTabPageObject` с методами `isCustomSwimlaneStrategy`, `getConfigContainer`, `insertSettingsButton`, `removeSettingsButton`
- Обновлён `SettingsPage` — добавлен getter и расширен тип `SettingsTabs`
- Добавлены 10 unit-тестов

**Проблемы и решения**:

**Проблема 1: Асинхронный рендер React 18**

Контекст: `createRoot().render()` выполняется асинхронно, проверки падали

Решение: Использован `act()` из `@testing-library/react`

**Проблема 2: Расширение тестового файла**

Контекст: Для JSX требуется `.tsx`

Решение: Файл создан как `.test.tsx`
