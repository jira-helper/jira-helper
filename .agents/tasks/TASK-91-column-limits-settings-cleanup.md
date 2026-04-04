# TASK-91: Удалить старые файлы Column Limits SettingsPage

**Status**: DONE

**Parent**: [EPIC-10](./EPIC-10-column-limits-bdd-refactoring.md)

---

## Описание

Удалить старые монолитные файлы после успешной миграции.

## Что удалить

```
src/column-limits/SettingsPage/
├── SettingsPage.feature         # удалить
└── SettingsPage.feature.cy.tsx  # удалить
```

## Что сделать

1. Запустить все SettingsPage тесты
2. Убедиться что все 30 тестов проходят
3. Удалить старые файлы
4. Запустить lint и build
5. Верификация EPIC-10

## Критерии приёмки

- [ ] Все 30 SettingsPage тестов проходят в новых файлах
- [ ] Старые файлы удалены
- [ ] `npm run build:dev` проходит
- [ ] `npm run lint:eslint` проходит
- [ ] Все 43 column-limits теста проходят (13 BoardPage + 30 SettingsPage)

## Зависимости

- Зависит от: TASK-83, TASK-84, TASK-85, TASK-86, TASK-87, TASK-88, TASK-89, TASK-90
