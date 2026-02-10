# TASK-13: Удалить htmlTemplates.ts

**Status**: TODO

**Parent**: [EPIC-1](./EPIC-1-fix-closing-group-limits.md)

**Target Design**: [target-design.md](./target-design.md)

**Depends on**: [TASK-12](./TASK-12-refactor-index-ts.md)

---

## Описание

Удалить файл `htmlTemplates.ts`, так как кнопка теперь рендерится через React.

## Файл для удаления

`src/column-limits/SettingsPage/htmlTemplates.ts`

## Что сделать

### 1. Проверить, что файл не импортируется

```bash
grep -r "htmlTemplates" src/column-limits/
```

Если есть импорты — удалить их.

### 2. Удалить файл

```bash
rm src/column-limits/SettingsPage/htmlTemplates.ts
```

### 3. Проверить, что все работает

```bash
npm test
npm run lint:eslint
```

## Критерии приёмки

- [ ] Файл `htmlTemplates.ts` удалён
- [ ] Нет импортов `htmlTemplates` в проекте
- [ ] Проект компилируется без ошибок
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint`

## Проблемы

```
(место для записи проблем)
```

---

## Результаты

**Дата**: 

**Агент**: 

**Статус**: 

**Комментарии**:

```
(место для комментариев агента)
```
