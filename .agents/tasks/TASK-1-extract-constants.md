# TASK-1: Извлечь settingsJiraDOM в constants.ts

**Status**: DONE

**Parent**: [EPIC-2](./EPIC-2-person-limits-react-migration.md)

---

## Описание

Перенести объект `settingsJiraDOM` из `htmlTemplates.tsx` в новый файл `constants.ts`. Обновить все импорты. Это подготовительный шаг для последующего удаления `htmlTemplates.tsx`.

## Файлы

```
src/person-limits/SettingsPage/
├── constants.ts                              # новый
├── components/
│   ├── PersonalWipLimitContainer.tsx          # изменение (импорт)
│   └── PersonalWipLimitTable.tsx              # изменение (импорт)
└── htmlTemplates.tsx                          # изменение (реэкспорт для обратной совместимости)
```

## Что сделать

1. Создать файл `src/person-limits/SettingsPage/constants.ts`
2. Перенести в него объект `settingsJiraDOM` из `htmlTemplates.tsx`
3. В `htmlTemplates.tsx` заменить определение `settingsJiraDOM` на реэкспорт из `constants.ts`:
   ```typescript
   export { settingsJiraDOM } from './constants';
   ```
4. Обновить импорт в `PersonalWipLimitContainer.tsx`:
   ```typescript
   // До:
   import { settingsJiraDOM } from '../htmlTemplates';
   // После:
   import { settingsJiraDOM } from '../constants';
   ```
5. Обновить импорт в `PersonalWipLimitTable.tsx`:
   ```typescript
   // До:
   import { settingsJiraDOM } from '../htmlTemplates';
   // После:
   import { settingsJiraDOM } from '../constants';
   ```

## Критерии приёмки

- [ ] `constants.ts` содержит `settingsJiraDOM`
- [ ] `PersonalWipLimitContainer.tsx` импортирует из `constants`
- [ ] `PersonalWipLimitTable.tsx` импортирует из `constants`
- [ ] `htmlTemplates.tsx` реэкспортирует `settingsJiraDOM` (обратная совместимость до TASK-8)
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: нет
- Блокирует: [TASK-4](./TASK-4-create-settings-modal-container.md), [TASK-8](./TASK-8-delete-html-templates.md)
- Референс: `src/column-limits/SettingsPage/` — не имеет отдельного constants файла, но settingsJiraDOM не используется в column-limits

---

## Результаты

**Дата**: 2026-02-11

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

Все изменения уже были выполнены ранее. Верификация подтвердила соответствие всем критериям приёмки:

- `constants.ts` содержит `settingsJiraDOM` (21 строка, все DOM-идентификаторы)
- `PersonalWipLimitContainer.tsx` импортирует из `../constants` (строка 12)
- `PersonalWipLimitTable.tsx` импортирует из `../constants` (строка 4)
- `htmlTemplates.tsx` реэкспортирует `settingsJiraDOM` из `./constants` (строки 1-3)
- ESLint: `constants.ts` и `htmlTemplates.tsx` — без ошибок
- Тесты: 713/714 проходят, 1 failing тест — pre-existing (не связан с данной задачей)
