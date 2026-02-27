# TASK-64: Форма не сбрасывается после добавления лимита с issue types

**Status**: DONE

**Parent**: [EPIC-8](./EPIC-8-person-limits-bugfixes.md)

---

## Описание

При добавлении лимита с фильтром по issue types форма не сбрасывается:
остаётся заполненный инпут person name и выбранный issue type.
Нужно сбрасывать всю форму в дефолтное состояние после успешного добавления.

## Root Cause

В `PersonalWipLimitContainer.tsx` сброс issue types привязан к изменению `editingId`
(строки 107-130), а не к `formData === null`. Когда лимит добавляется в режиме "Add"
(editingId уже null), useEffect для сброса issue types не срабатывает.

## Файлы

```
src/person-limits/SettingsPage/components/
└── PersonalWipLimitContainer.tsx   # изменение — сброс формы
```

## Что сделать

1. В `PersonalWipLimitContainer.tsx` объединить логику сброса: при `formData === null` сбрасывать ВСЕ поля, включая issue types
2. Убедиться, что после "Add limit" все поля формы возвращаются в дефолт:
   - person name = пустой
   - limit = 1
   - "All columns" = checked
   - "All swimlanes" = checked
   - "Count all issue types" = checked
3. Убедиться, что после "Edit limit" форма тоже сбрасывается

## Критерии приёмки

- [ ] После добавления лимита с issue type фильтром форма полностью сбрасывается
- [ ] После редактирования лимита форма сбрасывается в режим "Add" с дефолтными значениями
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Референс: `src/person-limits/SettingsPage/components/PersonalWipLimitContainer.tsx` строки 65-130
