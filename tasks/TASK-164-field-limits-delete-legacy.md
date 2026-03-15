# TASK-164: Удалить legacy код

**Status**: DONE

**Parent**: [EPIC-16](./EPIC-16-field-limits-modernization.md)

---

## Описание

После успешной верификации новой реализации — удалить всю старую папку `src/field-limits/`. Выполняется только после подтверждения, что новая реализация работает корректно.

## Файлы

```
src/field-limits/              # удалить целиком
├── BoardPage/
│   ├── index.ts
│   ├── htmlTemplates.ts
│   └── styles.module.css
├── SettingsPage/
│   ├── index.ts
│   ├── htmlTemplates.ts
│   └── styles.module.css
└── shared.ts
```

## Что сделать

1. Убедиться, что TASK-163 завершён и новая реализация верифицирована
2. Удалить всю папку `src/field-limits/`
3. Проверить, что нет оставшихся импортов из `src/field-limits/`:
   ```bash
   rg "from.*['\"].*field-limits" src/ --glob '!src/features/'
   ```
4. `npm run build` — проверить сборку
5. `npm test` — проверить тесты

## Критерии приёмки

- [ ] Папка `src/field-limits/` удалена
- [ ] Нет импортов из старого пути
- [ ] `npm run build` проходит
- [ ] `npm test` проходит
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-163](./TASK-163-field-limits-switch-content.md) + manual verification

---

---

## Результаты

**Дата**: 2025-03-13

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

Удалена папка `src/field-limits/` (BoardPage/, SettingsPage/, shared.ts). Импорты в content.ts уже указывали на `src/features/field-limits/`. Проверки: build:dev ✓, npm test ✓ (769 tests), lint ✓.
