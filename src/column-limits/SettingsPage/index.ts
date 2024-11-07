import isEmpty from '@tinkoff/utils/is/empty';
import keys from '@tinkoff/utils/object/keys';
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
  };

  wipLimits: Record<string, any> = {};

  colorPickerTooltip!: ColorPickerTooltip;

  popup!: Popup;

  draggingElement: HTMLElement | null = null;

  private mappedColumnsToGroups: GroupMap | null = null;

  async shouldApply(): Promise<boolean> {
    return (await getSettingsTab()) === 'columns';
  }

  getModificationId(): string {
    return `add-wip-settings-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return this.waitForElement('#columns');
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

  openGroupSettingsPopup = (): void => {
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

    this.renderGroupsEditor();
  };

  groupHtml(groupId: string): string {
    const { max, customHexColor } = this.wipLimits[groupId] || {};
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

  renderGroupsEditor(): void {
    this.popup.appendToContent(
      formTemplate({
        id: SettingsWIPLimits.ids.formId,
        leftBlock: this.groupHtml(WITHOUT_GROUP_ID),
        rightBlock: `
          ${groupsTemplate({
            id: SettingsWIPLimits.ids.allGroups,
            children: this.mappedColumnsToGroups!.allGroupIds.map(groupId =>
              groupId !== WITHOUT_GROUP_ID ? this.groupHtml(groupId) : ''
            ).join(''),
          })}
          ${dragOverHereTemplate({
            dropzoneId: SettingsWIPLimits.ids.createGroupDropzone,
            dropzoneClass: SettingsWIPLimits.classes.dropzone,
          })}
        `,
      })
    );
    this.showColorPicker();
    this.initEditorListeners();
  }

  initEditorListeners(): void {
    const form = document.getElementById(SettingsWIPLimits.ids.formId);

    keys(this.editorFormListeners).forEach(listenerKey => {
      if (form) {
        this.addEventListener(form, listenerKey, this.editorFormListeners[listenerKey]);
      }
    });
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

    this.popup.clearContent();
    this.renderGroupsEditor();
  }

  showColorPicker = (): void => {
    const allGroups = document.getElementById(SettingsWIPLimits.ids.allGroups);
    this.colorPickerTooltip.init(this.popup.contentBlock!, 'data-group-id');

    if (allGroups) {
      this.addEventListener(allGroups, 'click', event => {
        // @ts-expect-error
        this.colorPickerTooltip.showTooltip(event);
      });
    }
  };

  getWipLimitsForOnlyExistsColumns(): Record<string, any> {
    const columns = Array.from(this.getColumns()).map(el => el.getAttribute('data-column-id'));
    const wipLimits: Record<string, any> = {};

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
        wipLimits[key] = group;
      }
    });

    return wipLimits;
  }

  handleSubmit = async (unmountPopup: () => void): Promise<void> => {
    await this.updateBoardProperty(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS, this.getWipLimitsForOnlyExistsColumns());
    unmountPopup();
  };
}
