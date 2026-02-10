# TASK-12: Упростить index.ts

**Status**: TODO

**Parent**: [EPIC-1](./EPIC-1-fix-closing-group-limits.md)

**Target Design**: [target-design.md](./target-design.md)

**Depends on**: [TASK-11](./TASK-11-create-settings-modal-container.md)

---

## Описание

Рефакторинг `index.ts` — оставить только минимальный код для рендера React-кнопки в DOM.

## Файл

`src/column-limits/SettingsPage/index.ts`

## Что сделать

### 1. Упростить импорты

Удалить неиспользуемые импорты:
- `Popup`
- `groupSettingsBtnTemplate`
- `ColorPickerTooltip`
- `initFromProperty`
- `FORM_IDS`

Добавить новый импорт:
```typescript
import { SettingsButtonContainer } from './components/SettingsButton';
```

### 2. Удалить поля класса

Удалить:
- `colorPickerTooltip`
- `popup`
- `columnLimitsFormRoot`

### 3. Добавить поле для React root

```typescript
private settingsButtonRoot: Root | null = null;
```

### 4. Упростить метод `apply`

```typescript
apply(data: [any, any] | undefined): void {
  if (!data) return;
  const [boardData = {}, wipLimits = {}] = data;
  if (!boardData.canEdit) return;

  useColumnLimitsPropertyStore.getState().actions.setData(wipLimits);
  useColumnLimitsPropertyStore.getState().actions.setState('loaded');

  this.renderSettingsButton();
}
```

### 5. Упростить метод `renderSettingsButton`

```typescript
renderSettingsButton(): void {
  const container = document.createElement('div');
  container.id = 'jh-group-limits-button-container';
  
  const lastChild = document.querySelector(SettingsWIPLimits.jiraSelectors.columnsConfigLastChild);
  if (lastChild) {
    lastChild.insertAdjacentElement('beforebegin', container);
  }

  this.settingsButtonRoot = createRoot(container);
  this.settingsButtonRoot.render(
    React.createElement(SettingsButtonContainer, {
      getColumns: () => this.getColumns(),
      getColumnName: (el: HTMLElement) => this.getColumnName(el),
    })
  );
}
```

### 6. Удалить методы

Удалить полностью:
- `openGroupSettingsPopup`
- `renderGroupsEditor`
- `showColorPicker`
- `handleSubmit`
- `handleClose`
- `getExistingColumnIds` (перенесен в SettingsButtonContainer)

### 7. Оставить вспомогательные методы

Оставить:
- `getColumns` — нужен для передачи в React
- `getColumnName` — нужен для передачи в React

## Целевой код index.ts

```typescript
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { PageModification } from '../../shared/PageModification';
import { getSettingsTab } from '../../routing';
import { BOARD_PROPERTIES } from '../../shared/constants';
import { useColumnLimitsPropertyStore } from '../property/store';
import { SettingsButtonContainer } from './components/SettingsButton';

export default class SettingsWIPLimits extends PageModification<[any, any], Element> {
  static jiraSelectors = {
    ulColumnsWrapper: 'ul.ghx-column-wrapper:not(.ghx-fixed-column)',
    allColumns: '.ghx-column-wrapper:not(.ghx-fixed-column).ghx-mapped',
    allColumnsInner: '.ghx-column-wrapper:not(.ghx-fixed-column) > .ghx-mapped',
    allColumnsJira7: '.ghx-mapped.ui-droppable[data-column-id]',
    columnsConfigLastChild: '#ghx-config-columns > *:last-child',
    columnHeaderName: '.ghx-header-name',
  };

  private settingsButtonRoot: Root | null = null;

  async shouldApply(): Promise<boolean> {
    return (await getSettingsTab()) === 'columns';
  }

  getModificationId(): string {
    return `add-wip-settings-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement('#ghx-config-columns');
  }

  loadData(): Promise<[any, any]> {
    return Promise.all([
      this.getBoardEditData(),
      this.getBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS),
    ]);
  }

  apply(data: [any, any] | undefined): void {
    if (!data) return;
    const [boardData = {}, wipLimits = {}] = data;
    if (!boardData.canEdit) return;

    useColumnLimitsPropertyStore.getState().actions.setData(wipLimits);
    useColumnLimitsPropertyStore.getState().actions.setState('loaded');

    this.renderSettingsButton();
  }

  getColumns(): NodeListOf<Element> {
    let allColumns = document.querySelector(SettingsWIPLimits.jiraSelectors.ulColumnsWrapper)
      ? document.querySelectorAll(SettingsWIPLimits.jiraSelectors.allColumns)
      : document.querySelectorAll(SettingsWIPLimits.jiraSelectors.allColumnsInner);

    if (!allColumns || allColumns.length === 0) {
      allColumns = document.querySelectorAll(SettingsWIPLimits.jiraSelectors.allColumnsJira7);
    }

    return allColumns;
  }

  private getColumnName(el: HTMLElement): string {
    return el.querySelector(SettingsWIPLimits.jiraSelectors.columnHeaderName)?.getAttribute('title') ?? '';
  }

  renderSettingsButton(): void {
    const container = document.createElement('div');
    container.id = 'jh-group-limits-button-container';
    
    const lastChild = document.querySelector(SettingsWIPLimits.jiraSelectors.columnsConfigLastChild);
    if (lastChild) {
      lastChild.insertAdjacentElement('beforebegin', container);
    }

    this.settingsButtonRoot = createRoot(container);
    this.settingsButtonRoot.render(
      React.createElement(SettingsButtonContainer, {
        getColumns: () => this.getColumns(),
        getColumnName: (el: HTMLElement) => this.getColumnName(el),
      })
    );
  }
}
```

## Критерии приёмки

- [ ] `index.ts` содержит только ~70 строк (вместо ~187)
- [ ] Удалены все методы работы с Popup
- [ ] Удалена работа с ColorPickerTooltip
- [ ] Рендерится `SettingsButtonContainer`
- [ ] Модалка открывается при клике на кнопку
- [ ] Cancel закрывает модалку
- [ ] Save сохраняет и закрывает модалку
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- src/column-limits/SettingsPage/index.ts`

## Проблемы с линтером

```
(место для записи ошибок)
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
