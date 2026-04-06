# TASK-209: ARCHITECTURE.md + финальная проверка

**Status**: TODO

**Parent**: [EPIC-20](./EPIC-20-person-limits-refactor.md)

---

## Описание

Обновить `src/person-limits/ARCHITECTURE.md` (и при необходимости `README.md` секции про архитектуру): описать `tokens.ts`, `PersonLimitsModule`, три Model-класса, отсутствие zustand, использование `BoardPagePageObject`. Выполнить финальную проверку репозитория: полный прогон тестов, линт, dev-сборка; ручной smoke board + settings по чек-листу из [requirements.md](./requirements.md).

## Файлы

```
src/person-limits/ARCHITECTURE.md    # обновление
```

## Что сделать

1. Заменить устаревшие диаграммы/текст про stores и PersonLimitsBoardPageObject на целевое состояние из [target-design.md](./target-design.md).
2. Запустить `npm test`, `npm run lint` (или эквивалент проекта), `npm run build` / `build:dev`.
3. Кратко зафиксировать результаты в разделе «Результаты» задачи.

## Критерии приёмки

- [ ] `ARCHITECTURE.md` отражает фактическую структуру после EPIC-20.
- [ ] Все автоматические проверки проекта зелёные.
- [ ] Критерии приёмки из [requirements.md](./requirements.md) §9 проверены (чекбоксы можно перенести в delivery при релизе).
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-208](./TASK-208-final-cleanup-property-exports.md)

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}
