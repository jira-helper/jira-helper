# TASK-82: Удалить старые файлы Column Limits BoardPage

**Status**: DONE

**Parent**: [EPIC-10](./EPIC-10-column-limits-bdd-refactoring.md)

---

## Описание

Удалить старые монолитные файлы после успешной миграции.

## Что удалить

```
src/column-limits/BoardPage/
├── board-page.feature           # удалить
└── board-page.feature.cy.tsx    # удалить
```

## Что сделать

1. Запустить все BoardPage тесты
2. Убедиться что все 13 тестов проходят
3. Удалить старые файлы
4. Запустить lint и build

## Критерии приёмки

- [ ] Все 13 BoardPage тестов проходят в новых файлах
- [ ] Старые файлы удалены
- [ ] `npm run build:dev` проходит
- [ ] `npm run lint:eslint` проходит

## Зависимости

- Зависит от: TASK-77, TASK-78, TASK-79, TASK-80, TASK-81
