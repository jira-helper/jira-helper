# TASK-67: Отжатие swimlanes сбрасывает колонки

**Status**: DONE

**Parent**: [EPIC-8](./EPIC-8-person-limits-bugfixes.md)

---

## Описание

Баг: при редактировании лимита (все swimlanes + все колонки), если отжать "All swimlanes" —
отжимаются ещё и колонки. Чекбоксы swimlanes и columns должны работать независимо друг от друга.

## Root Cause

В `PersonalWipLimitContainer.tsx` обработчики чекбоксов "All columns" (строки 284-309) и
"All swimlanes" (строки 371-396) вызывают `handleFormChange`, который может триггерить
побочные эффекты через общий `useEffect` на форму. Возможно, `onValuesChange` формы
срабатывает каскадно при программном `setFieldValue`.

## Файлы

```
src/person-limits/SettingsPage/components/
└── PersonalWipLimitContainer.tsx   # изменение — изоляция обработчиков чекбоксов
```

## Что сделать

1. Изолировать обработчики "All columns" и "All swimlanes" — изменение одного не должно влиять на другой
2. Проверить, что `handleFormChange` или `onValuesChange` формы не вызывает каскадных сбросов
3. Если проблема в `useEffect` зависимостях — разделить эффекты для columns и swimlanes
4. Протестировать сценарии:
   - Отжать "All swimlanes" → колонки остаются как были
   - Отжать "All columns" → swimlanes остаются как были
   - Отжать оба → каждый работает независимо

## Критерии приёмки

- [ ] Отжатие "All swimlanes" не влияет на состояние колонок
- [ ] Отжатие "All columns" не влияет на состояние swimlanes
- [ ] При редактировании: изменение одного фильтра не сбрасывает другие
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Референс: `src/person-limits/SettingsPage/components/PersonalWipLimitContainer.tsx` строки 284-396
- Сценарии: SC-EDIT-4, SC-EDIT-5 в `SettingsPage.feature`
