# TASK-205: SettingsPage/index.tsx — propertyModel.load() и снятие legacy load

**Status**: TODO

**Parent**: [EPIC-20](./EPIC-20-person-limits-refactor.md)

---

## Описание

Обновить `SettingsPage/index.tsx` (PageModification для настроек): убрать вызовы legacy `loadPersonWipLimitsProperty` / обращения к property store; инициализировать данные через `PropertyModel.load()` (или согласованный с Board entry путь `setData` / единая загрузка) так, чтобы модалка и `SettingsUIModel` получали согласованное состояние. Свериться с target-design и текущим `column-limits` Settings entry.

## Файлы

```
src/person-limits/SettingsPage/index.tsx    # основные изменения
```

## Что сделать

1. Резолв `propertyModelToken` и вызов `load()` в нужной фазе жизненного цикла страницы настроек.
2. Убрать дублирующую загрузку, если property уже загружен с доски (кеш/состояние PropertyModel — по решению исполнителя и target-design).
3. Обработка ошибок load: не ломать UX (сообщения/логирование).

## Критерии приёмки

- [ ] Legacy load action/store не используется для загрузки property.
- [ ] Открытие настроек получает актуальные limits из `PropertyModel`.
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-204](./TASK-204-settings-containers-use-model.md)
- Связано с: [TASK-194](./TASK-194-property-model.md)

---

## Результаты

**Дата**: {YYYY-MM-DD}

**Агент**: {Coder / Architect / Manual}

**Статус**: VERIFICATION

**Что сделано**:

{Заполняется при завершении}

**Проблемы и решения**:

{Заполняется при завершении}
