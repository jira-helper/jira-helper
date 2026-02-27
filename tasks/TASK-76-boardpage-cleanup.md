# TASK-76: Удалить старые файлы и верификация BoardPage BDD

**Status**: TODO

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

Ожидаемый результат: 14 тестов проходят (7 + 4 + 3)

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
    ├── display.feature           # 7 сценариев
    ├── limit-scope.feature       # 4 сценария
    ├── interaction.feature       # 3 сценария
    ├── display.feature.cy.tsx
    ├── limit-scope.feature.cy.tsx
    ├── interaction.feature.cy.tsx
    ├── helpers.tsx
    └── steps/
        └── common.steps.ts
```

## Критерии приёмки

- [ ] Все 14 BoardPage тестов проходят
- [ ] Старые файлы удалены
- [ ] `npm run build` без ошибок
- [ ] `npm run lint:eslint` без ошибок
- [ ] Все 50 person-limits тестов проходят

## Зависимости

- Зависит от: TASK-72, TASK-73, TASK-74, TASK-75
