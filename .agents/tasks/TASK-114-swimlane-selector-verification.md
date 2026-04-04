# TASK-114: Верификация Swimlane Selector

**Status**: DONE

**Parent**: [EPIC-11](./EPIC-11-column-limits-swimlane-selector.md)

---

## Описание

Финальная верификация всех изменений EPIC-11.

## Что проверить

### 1. Build

```bash
npm run build:dev
```

- [ ] Build проходит без ошибок

### 2. Lint

```bash
npm run lint:eslint
```

- [ ] ESLint проходит без ошибок

### 3. Unit тесты

```bash
npm run test
```

- [ ] Все unit тесты проходят

### 4. Cypress BDD тесты

```bash
npm run cy:run:component
```

- [ ] Все BDD тесты проходят
- [ ] `swimlane-selector.feature` — 5 сценариев
- [ ] `swimlane-filter.feature` — 3 сценария

### 5. Manual Testing

#### Column Limits Settings:
- [ ] Открыть настройки Column Limits
- [ ] Создать новую группу
- [ ] Проверить что "All swimlanes" выбран по умолчанию
- [ ] Снять "All swimlanes" — появляется список
- [ ] Выбрать конкретные свимлейны
- [ ] Сохранить и переоткрыть — настройки сохранились

#### BoardPage:
- [ ] Создать группу с конкретными свимлейнами
- [ ] Добавить задачи в разные свимлейны
- [ ] Проверить что счётчик считает только выбранные свимлейны

#### Person Limits (регрессия):
- [ ] Проверить что Person Limits всё ещё работает
- [ ] Swimlane selector работает так же как раньше

### 6. Backward Compatibility

- [ ] Старые настройки без swimlanes работают (= все свимлейны)
- [ ] Нет ошибок при загрузке старых настроек

## Критерии приёмки

- [ ] Build ✓
- [ ] Lint ✓
- [ ] Unit tests ✓
- [ ] Cypress tests ✓
- [ ] Manual testing ✓
- [ ] Backward compatibility ✓

## Зависимости

- Зависит от: TASK-111, TASK-112, TASK-113 (все предыдущие задачи)
