# TASK-31: Рефакторинг SettingsPage index.ts (createRoot)

**Status**: TODO

**Parent**: [EPIC-3](./EPIC-3-wiplimit-on-cells-refactoring.md)

---

## Описание

Рефакторинг `WiplimitOnCellsSettingsPopup.ts`: убрать всю DOM-логику, заменить на `createRoot` + React `SettingsButtonContainer`. Класс должен содержать только lifecycle методы PageModification.

## Файлы

```
src/wiplimit-on-cells/SettingsPage/
├── index.ts                        # новый (переименован из WiplimitOnCellsSettingsPopup.ts)
└── constants.ts                    # изменение — оставить только settingsJiraDOM IDs (если нужны)
```

## Что сделать

1. Создать `SettingsPage/index.ts`:
   - `shouldApply()`: проверка `getSettingsTab() === 'columns'`
   - `waitForLoading()`: `waitForElement(panelConfig)`
   - `loadData()`: `loadWipLimitCellsProperty()` + `getBoardEditData()`
   - `apply()`: создать div, `createRoot`, рендерить `SettingsButtonContainer`
   - Убрать: `renderEditButton()`, `handleEditClick()`, `handleOnChangeRange()`, `handleOnClickAddRange()`, `handleClearSettings()`, `handleConfirmEditing()` — всё это в React

2. Обновить `src/content.ts` — импорт из нового пути

## Код до/после

```typescript
// До (WiplimitOnCellsSettingsPopup.ts — 226 строк):
export default class WipLimitOnCells extends PageModification {
  private popup: Popup | null = null;
  private editBtn: HTMLElement | null = null;
  private input: HTMLInputElement | null = null;
  private table: TableRangeWipLimit | null = null;
  private data: WipLimitSettings[] = [];
  // ... 200 строк DOM-манипуляций
}

// После (SettingsPage/index.ts — ~60 строк):
export default class WipLimitOnCellsSettings extends PageModification<[BoardData], Element> {
  static jiraSelectors = {
    panelConfig: `#${btnGroupIdForColumnsSettingsPage}`,
  };

  private boardData: BoardData | null = null;
  private settingsButtonRoot: Root | null = null;

  async shouldApply() {
    return (await getSettingsTab()) === 'columns';
  }

  waitForLoading() {
    return this.waitForElement(WipLimitOnCellsSettings.jiraSelectors.panelConfig);
  }

  async loadData(): Promise<[BoardData]> {
    await loadWipLimitCellsProperty();
    const boardData = await this.getBoardEditData();
    return [boardData];
  }

  apply(data: [BoardData]) {
    if (!data) return;
    const [boardData] = data;
    if (!boardData?.canEdit) return;

    this.boardData = boardData;
    const swimlanes = boardData.swimlanesConfig?.swimlanes ?? [];
    const columns = boardData.rapidListConfig?.mappedColumns?.filter(c => !c.isKanPlanColumn) ?? [];

    this.renderSettingsButton(swimlanes, columns);
  }

  private renderSettingsButton(swimlanes, columns) {
    const container = document.createElement('div');
    container.id = 'jh-wip-limit-cells-button-container';
    document.getElementById(btnGroupIdForColumnsSettingsPage)?.appendChild(container);

    this.settingsButtonRoot = createRoot(container);
    this.settingsButtonRoot.render(
      React.createElement(SettingsButtonContainer, { swimlanes, columns })
    );
  }
}
```

## Критерии приёмки

- [ ] Класс содержит только lifecycle + `renderSettingsButton()`
- [ ] Нет DOM-манипуляций кроме создания контейнера для React
- [ ] `createRoot` рендерит `SettingsButtonContainer`
- [ ] Импорт в `content.ts` обновлён
- [ ] Backward compatibility сохранена (фича работает как прежде)
- [ ] Тесты проходят: `npm test`
- [ ] Нет ошибок линтера: `npm run lint:eslint -- --fix`

## Зависимости

- Зависит от: [TASK-22](./TASK-22-create-property-store.md), [TASK-30](./TASK-30-create-settings-button.md)
- Референс: `src/person-limits/SettingsPage/index.tsx`
