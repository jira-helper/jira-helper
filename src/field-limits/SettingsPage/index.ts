import { PageModification } from '../../shared/PageModification';
import { getSettingsTab } from '../../routing';
import { settingsEditBtnTemplate, fieldLimitsTableTemplate, fieldRowTemplate } from './htmlTemplates';
import { Popup } from '../../shared/getPopup';
import { BOARD_PROPERTIES } from '../../shared/constants';
import { createLimitKey, normalize, NormalizeOutput } from '../shared';
import { ColorPickerTooltip } from '../../shared/colorPickerTooltip';

type MappedColumn = {
  id: string;
  isKanPlanColumn: boolean;
  max?: number;
  name: string;
};
type Swimlane = {
  name: string;
};
type BoardData = {
  rapidListConfig: {
    mappedColumns: MappedColumn[];
  };
  swimlanesConfig: {
    swimlanes: Swimlane[];
  };
  canEdit: boolean;
};

type CardLayoutField = {
  fieldId: string;
  name: string;
};

type LimitSettings = {
  fieldValue: string;
  fieldId: string;
  limit: number;
  columns: string[];
  swimlanes: string[];
  bkgColor?: string;
  visualValue: string;
};

export default class FieldLimitsSettingsPage extends PageModification<[any, any], Element> {
  static jiraSelectors = {
    cardLayout: '#ghx-config-cardLayout',
    cardLayoutDesc: '#ghx-config-cardLayout > p',
    cardLayoutConfig: '#ghx-card-layout-config-work',
    cardLayoutCurrentFields: '#ghx-card-layout-config-work .ui-sortable > tr',
  };

  static ids = {
    settingsBtn: 'jh-edit-wip-field-limits-btn',
    popupTable: 'jh-field-limits-table',
    popupTableBody: 'jh-field-limits-tbody',
    popupTableAddLimitRow: 'jh-field-limits-add-btn',
    popupTableEditLimitRow: 'jh-field-limits-edit-btn',
    inputFieldValue: 'jh-input-field-value',
    visualNameInput: 'jh-input-visual-name',
    columnsSelectId: 'jh-columns-select',
    swimlanesSelectId: 'jh-swimlanes-select',
    wipLimitInputId: 'jh-wip-limit-input',
    fieldSelectId: 'jh-select-field',
    applyColumns: 'jh-apply-columns-limits',
    applySwimlanes: 'jh-apply-swimlanes-limits',
  };

  static classes = {
    editRowBtn: 'jh-edit-row-btn',
    deleteRowBtn: 'jh-delete-row-btn',
  };

  private limitKeyOfEditable: string | undefined = undefined;

  private popup: Popup | null = null;

  private colorPickerTooltip: ColorPickerTooltip | null = null;

  private editBtn: HTMLElement | null = null;

  private boardData: null | BoardData = null;

  private columns: MappedColumn[] | null = null;

  private swimlanes = this.boardData?.swimlanesConfig?.swimlanes;

  private normalizedFields: NormalizeOutput<CardLayoutField> | null = null;

  private normalizedSwimlanes: NormalizeOutput<Swimlane> | null = null;

  private normalizedColumns: NormalizeOutput<MappedColumn> | null = null;

  private settings: {
    limits: {
      [key: string]: LimitSettings;
    };
  } | null = null;

  async shouldApply(): Promise<boolean> {
    return (await getSettingsTab()) === 'cardLayout';
  }

  getModificationId(): string {
    return `add-field-settings-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement(FieldLimitsSettingsPage.jiraSelectors.cardLayout);
  }

  loadData(): Promise<[any, any]> {
    return Promise.all([this.getBoardEditData(), this.getBoardProperty(BOARD_PROPERTIES.FIELD_LIMITS)]);
  }

  apply(data: [BoardData, any]): void {
    if (!data) return;
    const [
      boardData,
      quickFilterSettings = {
        limits: {
          /*
            [limitKeys.encode(....)]: {
                fieldValue: string,
                fieldId: string,
                limit: number,
                columns: string[],
                swimlanes: string[]
             }
          */
        },
      },
    ] = data;
    if (!boardData.canEdit) return;

    this.boardData = boardData;
    this.columns = this.boardData?.rapidListConfig?.mappedColumns?.filter((i: any) => !i.isKanPlanColumn);
    this.swimlanes = this.boardData?.swimlanesConfig?.swimlanes;

    this.normalizedFields = normalize('fieldId', this.getCurrentFields());
    this.normalizedSwimlanes = normalize('id', this.swimlanes);
    this.normalizedColumns = normalize('id', this.columns);

    this.settings = {
      limits: quickFilterSettings.limits || {},
    };

    this.onDOMChange(
      FieldLimitsSettingsPage.jiraSelectors.cardLayoutConfig,
      () => {
        this.normalizedFields = normalize('fieldId', this.getCurrentFields());
      },
      { childList: true, subtree: true }
    );

    this.colorPickerTooltip = new ColorPickerTooltip({
      onOk: (hexStrColor: string, dataId: string) => {
        this.settings!.limits[dataId].bkgColor = hexStrColor;
        this.renderRows();
      },
      // @ts-expect-error
      addEventListener: (target: EventTarget, event: string, cb: EventListener) =>
        this.addEventListener(target, event, cb),
    });

    this.renderEditButton();
  }

  getCurrentFields(): CardLayoutField[] {
    const currentFieldNodes = document.querySelectorAll(FieldLimitsSettingsPage.jiraSelectors.cardLayoutCurrentFields);

    const result: { fieldId: string; name: string }[] = [];
    currentFieldNodes.forEach(node => {
      const fieldId = node.getAttribute('data-fieldid') || '';
      result.push({ fieldId, name: node.children[1]?.textContent || '' });
    });
    return result;
  }

  renderEditButton(): void {
    this.insertHTML(
      document.querySelector(FieldLimitsSettingsPage.jiraSelectors.cardLayoutDesc)!,
      'afterend',
      settingsEditBtnTemplate(FieldLimitsSettingsPage.ids.settingsBtn)
    );

    this.popup = new Popup({
      title: 'Edit WIP Limits by field',
      onConfirm: this.handleConfirmEditing,
      okButtonText: 'Save',
      size: 'large',
    });

    this.editBtn = document.getElementById(FieldLimitsSettingsPage.ids.settingsBtn);
    if (this.editBtn) {
      this.addEventListener(this.editBtn, 'click', this.handleEditClick);
    }
  }

  handleEditClick = (): void => {
    this.popup!.render();
    this.popup!.appendToContent(
      fieldLimitsTableTemplate({
        tableId: FieldLimitsSettingsPage.ids.popupTable,
        tableBodyId: FieldLimitsSettingsPage.ids.popupTableBody,
        addLimitBtnId: FieldLimitsSettingsPage.ids.popupTableAddLimitRow,
        editLimitBtnId: FieldLimitsSettingsPage.ids.popupTableEditLimitRow,
        fieldValueInputId: FieldLimitsSettingsPage.ids.inputFieldValue,
        visualNameInputId: FieldLimitsSettingsPage.ids.visualNameInput,
        columnsSelectId: FieldLimitsSettingsPage.ids.columnsSelectId,
        swimlanesSelectId: FieldLimitsSettingsPage.ids.swimlanesSelectId,
        wipLimitInputId: FieldLimitsSettingsPage.ids.wipLimitInputId,
        applyColumnsId: FieldLimitsSettingsPage.ids.applyColumns,
        applySwimlanesId: FieldLimitsSettingsPage.ids.applySwimlanes,
        selectFieldId: FieldLimitsSettingsPage.ids.fieldSelectId,
        selectFieldOptions: this.normalizedFields!.allIds.map(fieldId => ({
          text: this.normalizedFields!.byId[fieldId].name,
          value: fieldId,
        })),
        swimlaneOptions: this.normalizedSwimlanes!.allIds.map(swimlaneId => ({
          text: this.normalizedSwimlanes!.byId[swimlaneId].name,
          value: swimlaneId,
        })),
        columnOptions: this.normalizedColumns!.allIds.map(columnId => ({
          text: this.normalizedColumns!.byId[columnId].name,
          value: columnId,
        })),
      })
    );

    this.renderRows();
    this.handleButtonsFieldLimitRowClick();
    this.renderColorPicker();
  };

  handleButtonsFieldLimitRowClick(): void {
    const btnAdd = document.getElementById(FieldLimitsSettingsPage.ids.popupTableAddLimitRow)!;
    const btnEdit = document.getElementById(FieldLimitsSettingsPage.ids.popupTableEditLimitRow)!;

    const checkIfLimitWithThisSettingsAlreadyExists = ({
      fieldId,
      fieldValue,
      swimlanes,
      columns,
    }: {
      fieldId: string;
      fieldValue: string;
      swimlanes: string[];
      columns: string[];
    }): undefined | string => {
      return Object.entries(this.settings!.limits).find(
        ([, limit]) =>
          limit.fieldId === fieldId &&
          limit.fieldValue === fieldValue &&
          limit.swimlanes.every(swimlane => swimlanes.includes(swimlane)) &&
          limit.columns.every(column => columns.includes(column))
      )?.[0];
    };

    const setValuesToTable = (limitKey: string | null) => {
      const { fieldId, fieldValue, visualValue, limit } = this.getInputValues();
      const { columns, swimlanes } = this.getSelectedSwimlanesAndColumnsOptions();

      const limitWithSameSettings = checkIfLimitWithThisSettingsAlreadyExists({
        fieldId,
        fieldValue,
        swimlanes,
        columns,
      });

      if (limitWithSameSettings) {
        limitKey = limitWithSameSettings;
      }

      const isEdit = limitKey != null;

      if (!isEdit) {
        limitKey = createLimitKey({ fieldValue, fieldId });
      }

      if (!this.settings!.limits[limitKey!] || isEdit) {
        this.settings!.limits[limitKey!] = {
          ...this.settings!.limits[limitKey!],
          visualValue,
          fieldValue,
          fieldId,
          limit: +limit,
          columns,
          swimlanes,
        };
      }

      this.renderRows();
      // @ts-expect-error
      btnEdit.disabled = true;
      this.limitKeyOfEditable = undefined;
    };

    this.addEventListener(btnAdd, 'click', () => {
      setValuesToTable(null);
    });

    this.addEventListener(btnEdit, 'click', () => {
      if (this.limitKeyOfEditable == null) {
        // @ts-expect-error
        btnEdit.disabled = true;
        return;
      }
      setValuesToTable(this.limitKeyOfEditable);
    });
  }

  handleAppliesLimitsToRows(): void {
    const mergeSelectedRows = (mergedRowObj: any) => {
      const rows = document.querySelectorAll(`#${FieldLimitsSettingsPage.ids.popupTableBody} > tr`);

      rows.forEach(row => {
        const isSelected = row.querySelector('input[type="checkbox"]:checked');
        if (!isSelected) return;

        const limitKey = row.getAttribute('data-field-project-row') || '';

        this.settings!.limits[limitKey] = {
          ...this.settings!.limits[limitKey],
          ...mergedRowObj,
        };
      });

      this.renderRows();
    };

    this.addEventListener(document.getElementById(FieldLimitsSettingsPage.ids.applyColumns)!, 'click', () => {
      const { columns } = this.getSelectedSwimlanesAndColumnsOptions();
      mergeSelectedRows({ columns });
    });
    this.addEventListener(document.getElementById(FieldLimitsSettingsPage.ids.applySwimlanes)!, 'click', () => {
      const { swimlanes } = this.getSelectedSwimlanesAndColumnsOptions();
      mergeSelectedRows({ swimlanes });
    });
  }

  handleConfirmEditing = (unmountCallback: () => void): void => {
    this.updateBoardProperty(BOARD_PROPERTIES.FIELD_LIMITS, this.settings);
    unmountCallback();
  };

  renderColorPicker = (): void => {
    const table = document.getElementById(FieldLimitsSettingsPage.ids.popupTable)!;

    this.colorPickerTooltip!.init(this.popup!.contentBlock!, 'colorpicker-data-id');

    this.addEventListener(table, 'click', event => {
      // @ts-expect-error
      this.colorPickerTooltip!.showTooltip(event);
    });
  };

  renderRows(): void {
    document.getElementById(FieldLimitsSettingsPage.ids.popupTableBody)!.innerHTML = '';

    Object.keys(this.settings!.limits).forEach(limitKey => {
      const { limit, columns, swimlanes, fieldId, fieldValue, visualValue, bkgColor } = this.settings!.limits[limitKey];

      this.renderLimitRow({
        limitKey,
        fieldValue,
        visualValue,
        bkgColor,
        fieldId,
        limit,
        columns,
        swimlanes,
      });
    });

    this.handleAppliesLimitsToRows();
  }

  renderLimitRow({ limitKey, fieldValue, visualValue, bkgColor, fieldId, limit, columns, swimlanes }: any): void {
    const nzFieldIdSettings = this.normalizedFields!.byId[fieldId];

    const fieldName = nzFieldIdSettings ? nzFieldIdSettings.name : `[${fieldId}]`;
    const row = this.insertHTML(
      document.getElementById(FieldLimitsSettingsPage.ids.popupTableBody)!,
      'beforeend',
      fieldRowTemplate({
        limitKey,
        fieldValue,
        visualValue,
        bkgColor,
        fieldId,
        fieldName,
        limit,
        columns: columns.map((columnId: string) => this.normalizedColumns!.byId[columnId] || `column [${fieldId}]`),
        swimlanes: swimlanes.map(
          (swimlaneId: string) => this.normalizedSwimlanes!.byId[swimlaneId] || `swimlane [${fieldId}]`
        ),
        editClassBtn: FieldLimitsSettingsPage.classes.editRowBtn,
        deleteClassBtn: FieldLimitsSettingsPage.classes.deleteRowBtn,
      })
    );

    this.addEventListener(row!.querySelector(`.${FieldLimitsSettingsPage.classes.editRowBtn}`)!, 'click', event => {
      this.setInputValues(limitKey);
      event.stopPropagation();
      event.stopPropagation();
    });

    this.addEventListener(row!.querySelector(`.${FieldLimitsSettingsPage.classes.deleteRowBtn}`)!, 'click', event => {
      delete this.settings!.limits[limitKey];
      row!.remove();
      event.stopPropagation();
      event.stopPropagation();
    });
  }

  getInputValues(): { visualValue: string; fieldValue: string; fieldId: string; limit: number } {
    const fieldValue = (document.getElementById(FieldLimitsSettingsPage.ids.inputFieldValue) as HTMLInputElement).value;
    const visualValue = (document.getElementById(FieldLimitsSettingsPage.ids.visualNameInput) as HTMLInputElement)
      .value;
    const limit = +(document.getElementById(FieldLimitsSettingsPage.ids.wipLimitInputId) as HTMLInputElement).value;

    const selectedField = (document.getElementById(FieldLimitsSettingsPage.ids.fieldSelectId) as HTMLSelectElement)
      ?.selectedOptions[0];
    const fieldId = selectedField.value;

    return {
      visualValue,
      fieldValue,
      fieldId,
      limit,
    };
  }

  setInputValues(limitKey: string): void {
    const { fieldValue, visualValue, limit, fieldId, columns, swimlanes } = this.settings!.limits[limitKey];

    this.limitKeyOfEditable = limitKey;
    (document.getElementById(FieldLimitsSettingsPage.ids.popupTableEditLimitRow) as HTMLButtonElement).disabled = false;

    (document.getElementById(FieldLimitsSettingsPage.ids.inputFieldValue) as HTMLInputElement).value = fieldValue;
    (document.getElementById(FieldLimitsSettingsPage.ids.visualNameInput) as HTMLInputElement).value = visualValue;
    (document.getElementById(FieldLimitsSettingsPage.ids.wipLimitInputId) as HTMLInputElement).value = limit.toString();
    (document.getElementById(FieldLimitsSettingsPage.ids.fieldSelectId) as HTMLSelectElement).value = fieldId;
    this.setSelectedSwimlanesAndColumnsOptions(columns, swimlanes);
  }

  setSelectedSwimlanesAndColumnsOptions(columns: string[], swimlanes: string[]): void {
    const columnsOptions = (document.getElementById(FieldLimitsSettingsPage.ids.columnsSelectId) as HTMLSelectElement)
      .options;
    const swimlaneOptions = (
      document.getElementById(FieldLimitsSettingsPage.ids.swimlanesSelectId) as HTMLSelectElement
    ).options;

    Array.from(columnsOptions).forEach(option => {
      option.selected = columns.includes(option.value);
    });
    Array.from(swimlaneOptions).forEach(option => {
      option.selected = swimlanes.includes(option.value);
    });
  }

  getSelectedSwimlanesAndColumnsOptions(): { columns: string[]; swimlanes: string[] } {
    const columnsOptions = (document.getElementById(FieldLimitsSettingsPage.ids.columnsSelectId) as HTMLSelectElement)
      .selectedOptions;
    const swimlaneOptions = (
      document.getElementById(FieldLimitsSettingsPage.ids.swimlanesSelectId) as HTMLSelectElement
    ).selectedOptions;

    return {
      columns: Array.from(columnsOptions).map(option => option.value),
      swimlanes: Array.from(swimlaneOptions).map(option => option.value),
    };
  }
}
