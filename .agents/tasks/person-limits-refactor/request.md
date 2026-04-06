# Request: Person Limits Refactor (Zustand → Valtio Models)

**Дата**: 2026-04-06
**Автор**: m.sosnov

## Запрос

Провести рефакторинг модуля `person-limits` аналогично тому, как был проведён рефакторинг `column-limits` (задача `column-limits-refactor`).

Основные цели:
- Отказаться от **zustand** stores в пользу **Valtio + Model classes**
- Использовать **DI (Module + tokens)** для регистрации моделей
- Следовать архитектурным паттернам, установленным в `column-limits`:
  - `PropertyModel` — persistence layer (загрузка/сохранение board property)
  - `BoardRuntimeModel` — runtime state для board page (stats, active limit, avatars)
  - `SettingsUIModel` — editor state для settings UI (limits CRUD, form data)
- Убрать слой `actions/` в пользу методов на моделях
- Создать `module.ts` + `tokens.ts` для person-limits
- Зарегистрировать модуль в `content.ts`

## Референс

- `src/column-limits/` — целевая архитектура (Valtio models, DI, module)
- `.agents/tasks/column-limits-refactor/` — документация рефакторинга column-limits
- `docs/architecture_guideline.md` — архитектурные принципы проекта

## Текущее состояние

Три zustand stores:
1. `usePersonWipLimitsPropertyStore` — `property/store.ts`
2. `useSettingsUIStore` — `SettingsPage/stores/settingsUIStore.ts`
3. `useRuntimeStore` — `BoardPage/stores/runtimeStore.ts`

Standalone actions: `loadProperty`, `saveProperty`, `initFromProperty`, `saveToProperty`, `createPersonLimit`, `updatePersonLimit`, `transformFormData`.
