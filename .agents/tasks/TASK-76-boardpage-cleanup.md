# TASK-76: Удалить старые файлы и верификация BoardPage BDD

**Status**: DONE

**Parent**: [EPIC-9](./EPIC-9-person-limits-boardpage-bdd-refactoring.md)

---

## Описание

Удалить старые монолитные файлы и провести финальную верификацию всех тестов.

## Файлы для удаления

```
src/person-limits/BoardPage/
├── board-page.feature           # удалить
└── board-page.feature.cy.tsx    # удалить
```

## Что сделать

### 1. Запустить все новые тесты

```bash
npx cypress run --component --spec "src/person-limits/BoardPage/features/*.feature.cy.tsx"
```

Ожидаемый результат: 15 тестов проходят (12 display + 3 interaction)

### 2. Удалить старые файлы

```bash
rm src/person-limits/BoardPage/board-page.feature
rm src/person-limits/BoardPage/board-page.feature.cy.tsx
```

### 3. Проверить что нет битых импортов

```bash
npm run build
npm run lint:eslint
```

### 4. Запустить все person-limits тесты

```bash
npx cypress run --component --spec "src/person-limits/**/*.feature.cy.tsx"
```

Ожидаемый результат: 50 тестов проходят (36 SettingsPage + 14 BoardPage)

## Итоговая структура

```
src/person-limits/BoardPage/
├── index.ts
├── actions/
├── components/
├── pageObject/
├── stores/
├── utils/
└── features/
    ├── display.feature           # 12 сценариев (включая scope filters)
    ├── interaction.feature       # 3 сценария
    ├── display.feature.cy.tsx
    ├── interaction.feature.cy.tsx
    ├── helpers.tsx
    └── steps/
        └── common.steps.ts
```

## Критерии приёмки

- [x] Все 15 BoardPage тестов проходят (12 display + 3 interaction)
- [x] Старые файлы удалены
- [x] `npm run build:dev` без ошибок
- [x] `npm run lint:eslint` без новых ошибок
- [x] Все 51 person-limits тестов проходят

## Зависимости

- Зависит от: TASK-72, TASK-73, TASK-74, TASK-75

---

## Результаты

**Дата**: 2025-02-27

**Агент**: Coder

**Статус**: DONE

**Что сделано**:

- Запущены все BoardPage тесты: 15 passed (12 display + 3 interaction)
- Удалены старые файлы: `board-page.feature`, `board-page.feature.cy.tsx`
- `npm run build:dev` — успешно
- `npm run lint:eslint` — без новых ошибок (существующие ошибки в других модулях не затрагивают person-limits)
- Запущены все person-limits тесты: 51 passed (15 BoardPage + 36 SettingsPage)

**Проблемы и решения**:

- Ошибки ESLint — существующие в проекте (column-limits, additional-card-elements, shared и др.), не связаны с TASK-76. Требование «без новых ошибок» выполнено.
