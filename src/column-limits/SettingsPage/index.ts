import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { PageModification } from '../../shared/PageModification';
import { getSettingsTab } from '../../routing';
import { BOARD_PROPERTIES, btnGroupIdForColumnsSettingsPage } from '../../shared/constants';
import { mapColumnsToGroups } from '../shared/utils';
import { Popup } from '../../shared/getPopup';
import { groupSettingsBtnTemplate } from './htmlTemplates';
import { ColorPickerTooltip } from '../../shared/colorPickerTooltip';
import { useColumnLimitsPropertyStore } from '../property/store';
import { useColumnLimitsSettingsUIStore } from './stores/settingsUIStore';
import { initFromProperty, saveToProperty } from './actions';
import { buildInitDataFromGroupMap } from './utils/buildInitData';
import { ColumnLimitsContainer, FORM_IDS } from './components/ColumnLimitsContainer';
import { WITHOUT_GROUP_ID } from '../types';

export default class SettingsWIPLimits extends PageModification<[any, any], Element> {
  static ids = {
    openEditorButton: 'jh-add-group-btn',
    formId: FORM_IDS.formId,
    createGroupDropzone: FORM_IDS.createGroupDropzoneId,
    allGroups: FORM_IDS.allGroupsId,
  };

  static jiraSelectors = {
    ulColumnsWrapper: 'ul.ghx-column-wrapper:not(.ghx-fixed-column)',
    allColumns: '.ghx-column-wrapper:not(.ghx-fixed-column).ghx-mapped',
    allColumnsInner: '.ghx-column-wrapper:not(.ghx-fixed-column) > .ghx-mapped',
    allColumnsJira7: '.ghx-mapped.ui-droppable[data-column-id]',
    columnsConfigLastChild: '#ghx-config-columns > *:last-child',
    columnHeaderName: '.ghx-header-name',
  };

  colorPickerTooltip!: ColorPickerTooltip;

  popup!: Popup;

  private columnLimitsFormRoot: Root | null = null;

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
    return Promise.all([this.getBoardEditData(), this.getBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS)]);
  }

  apply(data: [any, any] | undefined): void {
    if (!data) return;
    const [boardData = {}, wipLimits = {}] = data;
    if (!boardData.canEdit) return;

    useColumnLimitsPropertyStore.getState().actions.setData(wipLimits);
    useColumnLimitsPropertyStore.getState().actions.setState('loaded');

    this.colorPickerTooltip = new ColorPickerTooltip({
      onOk: (hexStrColor, dataId) => {
        if (dataId) {
          useColumnLimitsSettingsUIStore.getState().actions.setGroupColor(dataId, hexStrColor);
        }
      },
      // @ts-expect-error ColorPickerTooltip expects addEventListener with different signature
      addEventListener: (target, event, cb) => this.addEventListener(target, event, cb),
    });

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
    this.insertHTML(
      document.querySelector(SettingsWIPLimits.jiraSelectors.columnsConfigLastChild)!,
      'beforebegin',
      groupSettingsBtnTemplate({
        openEditorBtn: SettingsWIPLimits.ids.openEditorButton,
        groupOfBtnsId: btnGroupIdForColumnsSettingsPage,
      })
    );

    const openModalBtn = document.querySelector(`#${SettingsWIPLimits.ids.openEditorButton}`) as HTMLElement;
    this.addEventListener(openModalBtn, 'click', this.openGroupSettingsPopup);
  }

  openGroupSettingsPopup = (): void => {
    this.popup = new Popup({
      title: 'Limits for groups',
      okButtonText: 'Save',
      onConfirm: this.handleSubmit,
      onCancel: this.handleClose,
    });
    this.popup.render();

    const wipLimits = useColumnLimitsPropertyStore.getState().data;
    const groupMap = mapColumnsToGroups({
      columnsHtmlNodes: Array.from(this.getColumns()) as HTMLElement[],
      wipLimits,
      withoutGroupId: WITHOUT_GROUP_ID,
    });

    const initData = buildInitDataFromGroupMap(groupMap, wipLimits, el => this.getColumnName(el));
    useColumnLimitsSettingsUIStore.getState().actions.reset();
    initFromProperty(initData);

    this.renderGroupsEditor();
  };

  renderGroupsEditor(): void {
    const container = document.createElement('div');
    this.popup.appendToContent(container.outerHTML);
    const actualContainer = this.popup.contentBlock!.querySelector('div:last-child');

    if (actualContainer) {
      this.columnLimitsFormRoot = createRoot(actualContainer);
      this.columnLimitsFormRoot.render(
        React.createElement(ColumnLimitsContainer, {
          onColorChange: groupId => {
            const button = document.querySelector(`[data-group-id="${groupId}"][data-color-picker-btn]`) as HTMLElement;
            if (button) {
              this.colorPickerTooltip.showTooltip({ target: button });
            }
          },
          formRefCallback: el => {
            if (el) this.showColorPicker();
          },
        })
      );
    }
  }

  showColorPicker = (): void => {
    setTimeout(() => {
      const form = document.getElementById(SettingsWIPLimits.ids.formId);
      this.colorPickerTooltip.init(this.popup.contentBlock!, 'data-group-id');

      if (form) {
        this.addEventListener(form, 'click', event => {
          const target = event.target as HTMLElement;
          if (target.hasAttribute('data-color-picker-btn')) {
            event.stopPropagation();
            // @ts-expect-error showTooltip accepts event
            this.colorPickerTooltip.showTooltip(event);
          }
        });
      }
    }, 100);
  };

  private getExistingColumnIds(): string[] {
    return Array.from(this.getColumns())
      .map(el => el.getAttribute('data-column-id'))
      .filter((id): id is string => id != null);
  }

  handleSubmit = async (unmountPopup: () => void): Promise<void> => {
    await saveToProperty(this.getExistingColumnIds());

    if (this.columnLimitsFormRoot) {
      this.columnLimitsFormRoot.unmount();
      this.columnLimitsFormRoot = null;
    }
    unmountPopup();
  };

  handleClose = (unmountPopup: () => void): void => {
    if (this.columnLimitsFormRoot) {
      this.columnLimitsFormRoot.unmount();
      this.columnLimitsFormRoot = null;
    }
    unmountPopup();
  };
}
