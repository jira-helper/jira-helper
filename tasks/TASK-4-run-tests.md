# TASK-4: Запустить тесты

**Status**: TODO

**Parent**: [EPIC-1](./EPIC-1-fix-closing-group-limits.md)

**Depends on**: [TASK-3](./TASK-3-connect-handleClose.md)

---

## Описание

Запустить все тесты проекта и убедиться, что изменения не сломали существующую функциональность.

## Что сделать

1. Запустить команду `npm test`
2. Дождаться завершения
3. Убедиться, что все тесты прошли
4. Если есть падения — записать в результаты

## Команда

```bash
npm test
```

## Связанные тесты

- `src/column-limits/SettingsPage/stores/settingsUIStore.test.ts`
- `src/column-limits/SettingsPage/actions/initFromProperty.test.ts`
- `src/column-limits/SettingsPage/actions/saveToProperty.test.ts`
- `src/column-limits/SettingsPage/actions/moveColumn.test.ts`
- `src/column-limits/property/store.test.ts`

## Критерии приёмки

- [ ] Команда `npm test` выполнена
- [ ] Все тесты проходят
- [ ] Нет регрессий

## Проблемы

Если тесты падают — записать здесь:

```
(место для записи падающих тестов)
```

---

## Результаты

**Дата**: 

**Агент**: 

**Статус**: 

**Вывод тестов**:

```
(место для вывода npm test)
```

**Комментарии**:

```
(место для комментариев агента)
```
