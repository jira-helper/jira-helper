# TASK-6: Рефакторинг index.tsx — createRoot

**Status**: DONE

**Parent**: [EPIC-2](./EPIC-2-person-limits-react-migration.md)

---

## Описание

Переписать `src/person-limits/SettingsPage/index.tsx` по паттерну `column-limits/SettingsPage/index.ts`. Заменить `insertHTML` + `Popup` на `createRoot` + `SettingsButtonContainer`. Удалить всю бизнес-логику из PageModification класса — она теперь живёт в React-контейнерах.

## Файлы

```
src/person-limits/SettingsPage/
└── index.tsx    # изменение (существенный рефакторинг)
```

## Что сделать

1. Удалить импорты:
   - `groupSettingsBtnTemplate` из `htmlTemplates`
   - `Popup` из `shared/getPopup`
   - `PersonalWipLimitContainer` (перенесён в SettingsModalContainer)
   - `createPersonLimit`, `updatePersonLimit` (перенесены в SettingsModalContainer)
   - `getUser` (перенесён в SettingsModalContainer)

2. Добавить импорты:
   ```typescript
   import { createRoot, Root } from 'react-dom/client';
   import { SettingsButtonContainer } from './components/SettingsButton';
   ```

3. Добавить поле `private settingsButtonRoot: Root | null = null;`

4. Удалить поля и методы, которые больше не нужны:
   - `DOMeditBtn`
   - `popup`
   - `personLimitsRecovery`
   - `openPersonalSettingsPopup`
   - `handleSubmit`
   - `handleClose`
   - `onAddLimit`
   - `onEditLimit`
   - `onDeleteLimit`
   - `onEdit`
   - `onApplyColumnForAllUser`
   - `onApplySwimlaneForAllUser`
   - `addOptionsToSelect`

5. Переписать `renderEditButton`:
   ```typescript
   renderEditButton(): void {
     const container = document.createElement('div');
     container.id = 'jh-person-limits-button-container';

     const parent = document.getElementById(btnGroupIdForColumnsSettingsPage);
     if (parent) {
       parent.appendChild(container);
     }

     this.settingsButtonRoot = createRoot(container);
     this.settingsButtonRoot.render(
       React.createElement(SettingsButtonContainer, {
         boardDataColumns: this.boardDataColumns || [],
         boardDataSwimlanes: this.boardDataSwimlanes || [],
       })
     );
   }
   ```

6. Оставить в классе только:
   - `jiraSelectors`
   - `boardData`, `boardDataColumns`, `boardDataSwimlanes`
   - `shouldApply`, `getModificationId`, `waitForLoading`, `loadData`
   - `apply` (инициализация boardData + вызов `renderEditButton`)
   - `renderEditButton` (createRoot)

## Код до/после

```typescript
// До (index.tsx) — ~220 строк, Popup + DOM:
import { groupSettingsBtnTemplate } from './htmlTemplates';
import { Popup } from '../../shared/getPopup';
// ... множество методов бизнес-логики

renderEditButton(): void {
  this.DOMeditBtn = this.insertHTML(
    document.getElementById(btnGroupIdForColumnsSettingsPage)!,
    'beforeend',
    groupSettingsBtnTemplate()
  );
  this.popup = new Popup({ ... });
  this.addEventListener(this.DOMeditBtn!, 'click', this.openPersonalSettingsPopup);
}

// После (index.tsx) — ~70 строк, createRoot:
import { createRoot, Root } from 'react-dom/client';
import { SettingsButtonContainer } from './components/SettingsButton';

renderEditButton(): void {
  const container = document.createElement('div');
  container.id = 'jh-person-limits-button-container';
  document.getElementById(btnGroupIdForColumnsSettingsPage)?.appendChild(container);

  this.settingsButtonRoot = createRoot(container);
  this.settingsButtonRoot.render(
    React.createElement(SettingsButtonContainer, {
      boardDataColumns: this.boardDataColumns || [],
      boardDataSwimlanes: this.boardDataSwimlanes || [],
    })
  );
}
```

## Критерии приёмки

- [ ] `index.tsx` использует `createRoot` + `SettingsButtonContainer`
- [ ] Нет импортов из `htmlTemplates`
- [ ] Нет `Popup` класса
- [ ] Нет бизнес-логики в PageModification классе (onAddLimit, onEditLimit и т.д.)
- [ ] Кнопка рендерится в DOM через React
- [ ] При клике на кнопку открывается модалка
- [ ] Save/Cancel работают корректно
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-5](./TASK-5-create-settings-button-container.md)
- Блокирует: [TASK-8](./TASK-8-delete-html-templates.md)
- Референс: `src/column-limits/SettingsPage/index.ts`

---

## Результаты

**Дата**: 2026-02-11

**Агент**: Coder

**Статус**: DONE

**Комментарии**:

Выполнен рефакторинг `index.tsx`:
- Удалены импорты: `groupSettingsBtnTemplate`, `Popup`, `PersonalWipLimitContainer`, `createPersonLimit`, `updatePersonLimit`, `getUser`, `useSettingsUIStore`, типы `PersonLimit`, `FormData`
- Добавлены импорты: `createRoot`, `Root` из `react-dom/client`, `SettingsButtonContainer`, типы `Column`, `Swimlane`
- Удалены поля: `DOMeditBtn`, `popup`, `personLimitsRecovery`
- Добавлено поле: `settingsButtonRoot: Root | null`
- Удалены методы бизнес-логики: `openPersonalSettingsPopup`, `addOptionsToSelect`, `handleSubmit`, `handleClose`, `onApplyColumnForAllUser`, `onApplySwimlaneForAllUser`, `onAddLimit`, `onEditLimit`, `onDeleteLimit`, `onEdit`
- Переписан `renderEditButton`: теперь использует `createRoot` + `SettingsButtonContainer` вместо `insertHTML` + `Popup`
- Упрощён метод `apply`: удалена работа с `personLimitsRecovery`
- Добавлено преобразование типов `MappedColumn[]` → `Column[]` и `BoardSwimlane[]` → `Swimlane[]` для совместимости с `SettingsButtonContainer`

Файл сократился с ~220 строк до ~100 строк. Вся бизнес-логика перенесена в React-контейнеры.
