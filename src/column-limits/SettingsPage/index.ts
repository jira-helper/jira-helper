import isEmpty from '@tinkoff/utils/is/empty';
import keys from '@tinkoff/utils/object/keys';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { PageModification } from '../../shared/PageModification';
import { getSettingsTab } from '../../routing';
import { BOARD_PROPERTIES, btnGroupIdForColumnsSettingsPage } from '../../shared/constants';
import { GroupMap, mapColumnsToGroups } from '../shared/utils';
import { Popup } from '../../shared/getPopup';
import {
  formTemplate,
  groupSettingsBtnTemplate,
  groupTemplate,
  columnTemplate,
  dragOverHereTemplate,
  groupsTemplate,
} from './htmlTemplates';
import styles from './styles.module.css';
import { getRandomString } from '../../shared/utils';
import { ColorPickerTooltip } from '../../shared/colorPickerTooltip';
import { IssueTypeSelector } from '../../shared/components/IssueTypeSelector';
import { ColumnLimitsForm } from './ColumnLimitsForm';

const WITHOUT_GROUP_ID = 'Without Group';

export default class SettingsWIPLimits extends PageModification<[any, any], Element> {
  static ids = {
    openEditorButton: 'jh-add-group-btn',
    formId: 'jh-wip-limits-form',
    createGroupDropzone: 'jh-column-dropzone',
    allGroups: 'jh-all-groups',
  };

  static classes = {
    draggable: 'draggable-jh',
    dropzone: 'dropzone-jh',
    groupLimitsInput: 'group-limits-input-jh',
  };

  static jiraSelectors = {
    ulColumnsWrapper: 'ul.ghx-column-wrapper:not(.ghx-fixed-column)',
    allColumns: '.ghx-column-wrapper:not(.ghx-fixed-column).ghx-mapped',
    allColumnsInner: '.ghx-column-wrapper:not(.ghx-fixed-column) > .ghx-mapped',
    allColumnsJira7: '.ghx-mapped.ui-droppable[data-column-id]',
    columnsConfigLastChild: '#ghx-config-columns > *:last-child',
    columnHeaderName: '.ghx-header-name',
    columnsConfigTab: '#ghx-config-columns', // Use more specific selector instead of #columns
  };

  wipLimits: Record<string, any> = {};

  colorPickerTooltip!: ColorPickerTooltip;

  popup!: Popup;

  draggingElement: HTMLElement | null = null;

  private mappedColumnsToGroups: GroupMap | null = null;

  private issueTypeSelectorStates: Map<
    string,
    {
      countAllTypes: boolean;
      projectKey: string;
      selectedTypes: string[];
      issueTypes: Array<{ id: string; name: string; subtask: boolean }>;
    }
  > = new Map();

  private issueTypeSelectorRoots: Map<string, Root> = new Map();

  private columnLimitsFormRoot: Root | null = null;

  async shouldApply(): Promise<boolean> {
    return (await getSettingsTab()) === 'columns';
  }

  getModificationId(): string {
    return `add-wip-settings-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    // Use more specific selector to avoid conflicts with Jira's #columns styles
    return this.waitForElement('#ghx-config-columns');
  }

  loadData(): Promise<[any, any]> {
    return Promise.all([this.getBoardEditData(), this.getBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS)]);
  }

  apply(data: [any, any] | undefined): void {
    if (!data) return;
    const [boardData = {}, wipLimits = {}] = data;
    if (!boardData.canEdit) return;

    this.wipLimits = wipLimits;
    this.colorPickerTooltip = new ColorPickerTooltip({
      onOk: (hexStrColor, dataId) => {
        this.wipLimits[dataId!].customHexColor = hexStrColor;
        this.popup.clearContent();
        this.renderGroupsEditor();
      },
      // @ts-expect-error
      addEventListener: (target, event, cb) => this.addEventListener(target, event, cb),
    });

    this.renderSettingsButton();
  }

  getColumns(): NodeListOf<Element> {
    let allColumns = document.querySelector(SettingsWIPLimits.jiraSelectors.ulColumnsWrapper)
      ? document.querySelectorAll(SettingsWIPLimits.jiraSelectors.allColumns)
      : document.querySelectorAll(SettingsWIPLimits.jiraSelectors.allColumnsInner);

    // for JIRA 7.1.x
    // JIRA 7.1.x does not have the "ul.ghx-column-wrapper"
    if (!allColumns || allColumns.length === 0) {
      allColumns = document.querySelectorAll(SettingsWIPLimits.jiraSelectors.allColumnsJira7);
    }

    return allColumns;
  }

  editorFormListeners: Record<string, (e: any) => void> = {
    dragstart: (e: DragEvent) => {
      if (!(e.target instanceof HTMLElement) || !e.target.classList.contains(SettingsWIPLimits.classes.draggable))
        return;

      this.draggingElement = e.target;
    },
    dragend: (e: DragEvent) => {
      if (!(e.target instanceof HTMLElement) || !e.target.classList.contains(SettingsWIPLimits.classes.draggable))
        return;

      this.draggingElement = null;
    },
    dragleave: (e: DragEvent) => {
      if (!(e.target instanceof HTMLElement) || !e.target.classList.contains(SettingsWIPLimits.classes.dropzone))
        return;

      e.target.classList.remove(styles.addGroupDropzoneActiveJH);
    },
    drop: (e: DragEvent) => {
      if (!(e.target instanceof HTMLElement) || !e.target.classList.contains(SettingsWIPLimits.classes.dropzone))
        return;

      e.target.classList.remove(styles.addGroupDropzoneActiveJH);
      const columnId = this.draggingElement?.getAttribute('data-column-id');
      const fromGroup = this.draggingElement?.getAttribute('data-group-id');
      const toGroup = e.target.getAttribute('data-group-id') ?? getRandomString(7);

      if (!columnId || !fromGroup) return;
      const column = this.mappedColumnsToGroups!.byGroupId[fromGroup].byColumnId[columnId];

      this.moveColumn(column, fromGroup, toGroup);
      this.draggingElement?.remove();
    },
    dragover: (e: DragEvent) => {
      if (!(e.target instanceof HTMLElement) || !e.target.classList.contains(SettingsWIPLimits.classes.dropzone))
        return;

      e.preventDefault();
      e.stopPropagation();
      e.target.classList.add(styles.addGroupDropzoneActiveJH);
    },
    input: (e: Event) => {
      if (
        !(e.target instanceof HTMLInputElement) ||
        !e.target.classList.contains(SettingsWIPLimits.classes.groupLimitsInput)
      )
        return;

      const groupId = e.target.getAttribute('data-group-id');
      if (groupId && this.wipLimits[groupId]) {
        this.wipLimits[groupId] = {
          ...this.wipLimits[groupId],
          max: e.target.value,
        };
      }
    },
  };

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

  openGroupSettingsPopup = async (): Promise<void> => {
    this.popup = new Popup({
      title: 'Limits for groups',
      okButtonText: 'Save',
      onConfirm: this.handleSubmit,
      onCancel: () => {}, // old version: this.handleClose,
    });
    this.popup.render();

    this.mappedColumnsToGroups = mapColumnsToGroups({
      columnsHtmlNodes: Array.from(this.getColumns()) as HTMLElement[],
      wipLimits: this.wipLimits,
      withoutGroupId: WITHOUT_GROUP_ID,
    });

    // Initialize states for existing groups
    this.mappedColumnsToGroups.allGroupIds.forEach(groupId => {
      if (groupId !== WITHOUT_GROUP_ID) {
        const group = this.wipLimits[groupId];
        if (group && !this.issueTypeSelectorStates.has(groupId)) {
          this.issueTypeSelectorStates.set(groupId, {
            countAllTypes: !group.includedIssueTypes || group.includedIssueTypes.length === 0,
            projectKey: '',
            selectedTypes: group.includedIssueTypes || [],
            issueTypes: [],
          });
        }
      }
    });

    this.renderGroupsEditor();
  };

  groupHtml(groupId: string): string {
    const { max, customHexColor, includedIssueTypes } = this.wipLimits[groupId] || {};
    const columns = this.mappedColumnsToGroups!.byGroupId[groupId];

    return groupTemplate({
      dropzoneClass: SettingsWIPLimits.classes.dropzone,
      groupLimitsClass: SettingsWIPLimits.classes.groupLimitsInput,
      withoutGroupId: WITHOUT_GROUP_ID,
      groupId,
      customGroupColor: customHexColor,
      groupMax: max,
      columnsHtml: columns
        ? columns.allColumnIds
            .map(columnId => {
              const { column, id } = columns.byColumnId[columnId];
              return this.columnHtml(id, column, groupId);
            })
            .join('')
        : '',
      issueTypesHtml: `<div data-issue-type-selector-container="${groupId}"></div>`,
    });
  }

  columnHtml(id: string, column: Element, groupId: string): string {
    const columnHeader = column.querySelector(SettingsWIPLimits.jiraSelectors.columnHeaderName) as HTMLElement;
    const columnTitle = columnHeader.getAttribute('title') || '';
    return columnTemplate({
      columnTitle,
      columnId: id,
      dataGroupId: groupId,
      draggableClass: SettingsWIPLimits.classes.draggable,
    });
  }

  private getFormProps() {
    const withoutGroupColumns =
      this.mappedColumnsToGroups!.byGroupId[WITHOUT_GROUP_ID]?.allColumnIds.map((colId: string) => {
        const col = this.mappedColumnsToGroups!.byGroupId[WITHOUT_GROUP_ID].byColumnId[colId];
        return {
          id: col.id,
          name: col.column.querySelector(SettingsWIPLimits.jiraSelectors.columnHeaderName)?.getAttribute('title') || '',
        };
      }) || [];

    const groups = this.mappedColumnsToGroups!.allGroupIds.filter(groupId => groupId !== WITHOUT_GROUP_ID).map(
      groupId => {
        const groupData = this.mappedColumnsToGroups!.byGroupId[groupId];
        const wipLimit = this.wipLimits[groupId] || {};
        return {
          id: groupId,
          columns: groupData.allColumnIds.map((colId: string) => {
            const col = groupData.byColumnId[colId];
            return {
              id: col.id,
              name:
                col.column.querySelector(SettingsWIPLimits.jiraSelectors.columnHeaderName)?.getAttribute('title') || '',
            };
          }),
          max: wipLimit.max,
          customHexColor: wipLimit.customHexColor,
          includedIssueTypes: wipLimit.includedIssueTypes,
        };
      }
    );

    return {
      withoutGroupColumns,
      groups,
    };
  }

  private updateColumnLimitsForm(): void {
    if (!this.columnLimitsFormRoot) return;

    const { withoutGroupColumns, groups } = this.getFormProps();

    this.columnLimitsFormRoot.render(
      React.createElement(ColumnLimitsForm, {
        ...this.getFormProps(),
        onLimitChange: (groupId: string, limit: number) => {
          if (!this.wipLimits[groupId]) {
            this.wipLimits[groupId] = { columns: [] };
          }
          this.wipLimits[groupId].max = limit;
          // Don't re-render here - let React component handle it with local state
          // Only update the data, component will sync on blur
        },
        onColorChange: (groupId: string) => {
          const button = document.querySelector(`[data-group-id="${groupId}"][data-color-picker-btn]`) as HTMLElement;
          if (button) {
            this.colorPickerTooltip.showTooltip({ target: button });
          }
        },
        onIssueTypesChange: (groupId: string, selectedTypes: string[], countAllTypes: boolean) => {
          const currentState = this.issueTypeSelectorStates.get(groupId) || {
            countAllTypes: true,
            projectKey: '',
            selectedTypes: [],
            issueTypes: [],
          };
          this.issueTypeSelectorStates.set(groupId, {
            ...currentState,
            countAllTypes,
            selectedTypes,
          });
        },
        onColumnDragStart: (e: React.DragEvent, columnId: string, groupId: string) => {
          const element = e.currentTarget as HTMLElement;
          this.draggingElement = element;
          e.dataTransfer.effectAllowed = 'move';
        },
        onColumnDragEnd: (e: React.DragEvent) => {
          this.draggingElement = null;
        },
        onDrop: (e: React.DragEvent, targetGroupId: string) => {
          e.preventDefault();
          e.stopPropagation();
          const target = e.currentTarget as HTMLElement;
          target.classList.remove(styles.addGroupDropzoneActiveJH);

          if (!this.draggingElement) return;

          const columnId = this.draggingElement.getAttribute('data-column-id');
          const fromGroup = this.draggingElement.getAttribute('data-group-id');

          if (!columnId || !fromGroup) return;

          const column = this.mappedColumnsToGroups!.byGroupId[fromGroup].byColumnId[columnId];
          this.moveColumn(column, fromGroup, targetGroupId);
          this.draggingElement.remove();
          this.draggingElement = null;

          // Re-render component
          this.popup.clearContent();
          this.renderGroupsEditor();
        },
        onDragOver: (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          const target = e.currentTarget as HTMLElement;
          if (target.classList.contains(SettingsWIPLimits.classes.dropzone)) {
            target.classList.add(styles.addGroupDropzoneActiveJH);
          }
        },
        onDragLeave: (e: React.DragEvent) => {
          const target = e.currentTarget as HTMLElement;
          if (target.classList.contains(SettingsWIPLimits.classes.dropzone)) {
            target.classList.remove(styles.addGroupDropzoneActiveJH);
          }
        },
        issueTypeSelectorStates: this.issueTypeSelectorStates,
        formId: SettingsWIPLimits.ids.formId,
        allGroupsId: SettingsWIPLimits.ids.allGroups,
        createGroupDropzoneId: SettingsWIPLimits.ids.createGroupDropzone,
      })
    );
  }

  renderGroupsEditor(): void {
    // Create container for React component
    const container = document.createElement('div');
    this.popup.appendToContent(container.outerHTML);
    const actualContainer = this.popup.contentBlock!.querySelector('div:last-child');

    if (actualContainer) {
      this.columnLimitsFormRoot = createRoot(actualContainer);
      this.updateColumnLimitsForm();
      this.showColorPicker();
    }
  }

  initEditorListeners(): void {
    const form = document.getElementById(SettingsWIPLimits.ids.formId);

    keys(this.editorFormListeners).forEach(listenerKey => {
      if (form) {
        this.addEventListener(form, listenerKey, this.editorFormListeners[listenerKey]);
      }
    });

    // Initialize React components for issue type selectors
    if (form) {
      this.mappedColumnsToGroups!.allGroupIds.forEach(groupId => {
        if (groupId !== WITHOUT_GROUP_ID) {
          const container = form.querySelector(`[data-issue-type-selector-container="${groupId}"]`);
          if (container) {
            const group = this.wipLimits[groupId];
            const includedIssueTypes = group?.includedIssueTypes || [];
            const countAllTypes = !includedIssueTypes || includedIssueTypes.length === 0;

            const root = createRoot(container);
            root.render(
              React.createElement(IssueTypeSelector, {
                groupId,
                selectedTypes: includedIssueTypes,
                initialCountAllTypes: countAllTypes,
                initialProjectKey: this.issueTypeSelectorStates.get(groupId)?.projectKey || '',
                onSelectionChange: (selectedTypes: string[], countAllTypesValue: boolean) => {
                  // Update state
                  const currentState = this.issueTypeSelectorStates.get(groupId) || {
                    countAllTypes: true,
                    projectKey: '',
                    selectedTypes: [],
                    issueTypes: [],
                  };
                  this.issueTypeSelectorStates.set(groupId, {
                    ...currentState,
                    countAllTypes: countAllTypesValue,
                    selectedTypes,
                  });
                },
              })
            );
          }
        }
      });
    }
  }

  moveColumn(column: any, fromGroup: string, toGroup: string): void {
    if (this.wipLimits[fromGroup]) {
      this.wipLimits[fromGroup].columns = this.wipLimits[fromGroup].columns.filter(
        (columnId: string) => columnId !== column.id
      );
      if (isEmpty(this.wipLimits[fromGroup].columns)) delete this.wipLimits[fromGroup];
    }

    const isGroupAlreadyExist = keys(this.wipLimits).includes(toGroup);
    const isNewGroup = toGroup !== WITHOUT_GROUP_ID;

    switch (true) {
      case isGroupAlreadyExist:
        this.wipLimits[toGroup] = {
          columns: [...this.wipLimits[toGroup].columns, column.id],
          max: this.wipLimits[toGroup].max,
          customHexColor: this.wipLimits[toGroup].customHexColor,
          includedIssueTypes: this.wipLimits[toGroup].includedIssueTypes,
        };
        break;
      case isNewGroup:
        this.wipLimits[toGroup] = {
          columns: [column.id],
          max: 100,
        };
        break;
      default:
        break;
    }

    this.mappedColumnsToGroups = mapColumnsToGroups({
      // @ts-expect-error
      columnsHtmlNodes: this.getColumns(),
      wipLimits: this.wipLimits,
      withoutGroupId: WITHOUT_GROUP_ID,
    });

    // Re-render React component
    this.popup.clearContent();
    this.renderGroupsEditor();
  }

  showColorPicker = (): void => {
    // Wait for React component to render
    setTimeout(() => {
      const form = document.getElementById(SettingsWIPLimits.ids.formId);
      this.colorPickerTooltip.init(this.popup.contentBlock!, 'data-group-id');

      if (form) {
        // Listen for clicks on "Change color" buttons
        this.addEventListener(form, 'click', event => {
          const target = event.target as HTMLElement;
          if (target.hasAttribute('data-color-picker-btn')) {
            event.stopPropagation();
            // @ts-expect-error
            this.colorPickerTooltip.showTooltip(event);
          }
        });
      }
    }, 100);
  };

  getWipLimitsForOnlyExistsColumns(): Record<string, any> {
    const columns = Array.from(this.getColumns()).map(el => el.getAttribute('data-column-id'));
    const wipLimits: Record<string, any> = {};
    const form = document.getElementById(SettingsWIPLimits.ids.formId);

    Object.keys(this.wipLimits).forEach(key => {
      const group = this.wipLimits[key];
      let i = group.columns.length - 1;

      while (i >= 0) {
        if (!columns.includes(group.columns[i])) {
          group.columns.splice(i, 1);
        }
        i -= 1;
      }

      if (group.columns.length > 0) {
        // Get issue type filter settings from state
        const state = this.issueTypeSelectorStates.get(key);
        if (state) {
          if (!state.countAllTypes) {
            // Only include selected types if "count all types" is unchecked
            if (state.selectedTypes.length > 0) {
              group.includedIssueTypes = state.selectedTypes;
            } else {
              // If no types selected but countAllTypes is false, still set empty array
              // to indicate filtering is enabled
              group.includedIssueTypes = [];
            }
          } else {
            // If "count all types" is checked, remove the filter
            delete group.includedIssueTypes;
          }
        }
        wipLimits[key] = group;
      }
    });

    return wipLimits;
  }

  handleSubmit = async (unmountPopup: () => void): Promise<void> => {
    await this.updateBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS, this.getWipLimitsForOnlyExistsColumns());
    // Clean up React roots
    this.issueTypeSelectorRoots.forEach(root => root.unmount());
    this.issueTypeSelectorRoots.clear();
    if (this.columnLimitsFormRoot) {
      this.columnLimitsFormRoot.unmount();
      this.columnLimitsFormRoot = null;
    }
    unmountPopup();
  };
}
