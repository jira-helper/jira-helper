# TASK-186: Final cleanup — property legacy, экспорты, сборка

**Status**: VERIFICATION

**Parent**: [EPIC-18](./EPIC-18-column-limits-refactor.md)

---

## Описание

Удалить оставшийся legacy-слой property (zustand store, interface, actions). Привести все `index.ts` и публичные экспорты модуля к целевой структуре из [target-design.md](./target-design.md). Убедиться, что внешние пакеты/модули не импортируют удалённые пути. Финальный прогон сборки, lint и тестов.

## Файлы

**Удалить:**

```
src/column-limits/property/store.ts
src/column-limits/property/interface.ts
src/column-limits/property/actions/
  ├── loadProperty.ts
  └── saveProperty.ts
```

**Изменить (по поиску импортов):**

```
src/column-limits/property/index.ts
src/column-limits/index.ts
любые файлы вне src/column-limits, ссылающиеся на удалённые модули
```

## Что сделать

1. Удалить перечисленные legacy-файлы; обновить `property/index.ts` — экспорт только `PropertyModel` и актуальных типов.
2. `grep` по репозиторию: `useColumnLimitsPropertyStore`, `loadProperty`, `saveProperty`, старые пути `property/store`, `property/actions`.
3. Обновить barrel-экспорты `src/column-limits/index.ts` согласно target-design.
4. Запустить `npm run build`, `npm test`, `npm run lint` (или скрипты из `package.json` проекта).
5. При необходимости обновить `ARCHITECTURE.md` / `feature.md` **только если** они уже ссылались на старую архитектуру (минимально; не расширять scope).

## Критерии приёмки

- [x] `property/store.ts`, `property/interface.ts`, `property/actions/` отсутствуют; весь потребительский код использует `PropertyModel` + DI.
- [x] Нет внешних импортов на удалённые модули (проверка поиском).
- [x] `npm run build` — успех.
- [x] `npm test` — успех.
- [x] `npm run lint` / `npm run lint:eslint -- --fix` — без ошибок.

## Зависимости

- Зависит от: [TASK-185](./TASK-185-settings-page-migration.md) (и косвенно все предыдущие задачи EPIC-18).
- Референсы:
  - `src/swimlane-wip-limits/property/index.ts` — чистые экспорты после миграции
  - `src/features/field-limits/` — структура property + module
  - [target-design.md](./target-design.md) — раздел Target File Structure

---

## Результаты

**Дата**: 2026-04-05

**Агент**: Coder

**Статус**: VERIFICATION

**Что сделано**:

- Удалены legacy `property/store.ts`, `store.test.ts`, `interface.ts`, папка `property/actions/` (`loadProperty.ts`, `saveProperty.ts`).
- `property/index.ts` экспортирует только `PropertyModel` (как в `swimlane-wip-limits/property`).
- Удалены пустые `SettingsPage/stores/`, `SettingsPage/actions/`.
- Обновлён `ARCHITECTURE.md` под valtio-модели и DI; `runtimeStore.types.ts` в репозитории не было.
- Поиск по `src`: старые символы и пути column-limits property не используются вне удалённых файлов.
- `npm run build:dev`, `npm test` (826), `npm run lint:eslint -- --fix` — успех.

**Проблемы и решения**:

Нет.
