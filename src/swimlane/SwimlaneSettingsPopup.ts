import { PageModification } from '../shared/PageModification';
import { getSettingsTab } from '../routing';
import { BOARD_PROPERTIES } from '../shared/constants';
import { mergeSwimlaneSettings } from './utils';
import { Popup } from '../shared/getPopup';
import { settingsEditBtnTemplate, settingsPopupTableRowTemplate, settingsPopupTableTemplate } from './constants';

interface SwimlaneSettings {
  [key: string]: {
    limit?: number;
    ignoreWipInColumns?: boolean;
  };
}

interface BoardData {
  canEdit: boolean;
  swimlanesConfig: {
    swimlanes: Array<{
      id: string;
      name: string;
    }>;
  };
}

export default class SwimlaneSettingsLimit extends PageModification<any, Element> {
  private settings: SwimlaneSettings | null = null;

  private boardData: BoardData | null = null;

  private swimlaneSelect: HTMLSelectElement | null = null;

  private popup: Popup | null = null;

  private editBtn: HTMLElement | null = null;

  static ids = {
    editLimitsBtn: 'edit-limits-btn-jh',
    editTable: 'edit-table-jh',
  };

  static classes = {
    editSwimlaneRow: 'edit-swimlane-row-jh',
  };

  static jiraSelectors = {
    swimlanes: '#swimlanes',
    swimlaneConfig: '#ghx-swimlane-strategy-config',
    swimlaneSelect: '#ghx-swimlanestrategy-select',
  };

  async shouldApply(): Promise<boolean> {
    return (await getSettingsTab()) === 'swimlanes';
  }

  getModificationId(): string {
    return `add-swimlane-settings-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    return Promise.all([
      this.waitForElement(SwimlaneSettingsLimit.jiraSelectors.swimlanes),
      this.waitForElement(SwimlaneSettingsLimit.jiraSelectors.swimlaneSelect),
    ]).then(([a]) => a);
  }

  loadData(): Promise<[BoardData, SwimlaneSettings]> {
    return Promise.all([
      this.getBoardEditData(),
      Promise.all([
        this.getBoardProperty(BOARD_PROPERTIES.SWIMLANE_SETTINGS),
        this.getBoardProperty(BOARD_PROPERTIES.OLD_SWIMLANE_SETTINGS),
      ]).then(mergeSwimlaneSettings),
    ]);
  }

  async apply(data: [BoardData, SwimlaneSettings]): Promise<void> {
    if (!data) return;
    const [boardData, settings] = data;
    this.settings = settings;
    this.boardData = boardData;

    if (!(boardData && boardData.canEdit)) return;

    this.swimlaneSelect = document.querySelector(SwimlaneSettingsLimit.jiraSelectors.swimlaneSelect);
    if (this.swimlaneSelect!.value === 'custom') {
      this.renderEditButton();
    }

    this.addEventListener(this.swimlaneSelect!, 'change', event => {
      if ((event.target as HTMLSelectElement).value === 'custom') this.renderEditButton();
      else this.removeEditBtn();
    });
  }

  renderEditButton(): void {
    this.insertHTML(
      document.querySelector(SwimlaneSettingsLimit.jiraSelectors.swimlaneConfig)!,
      'beforebegin',
      settingsEditBtnTemplate(SwimlaneSettingsLimit.ids.editLimitsBtn)
    );

    this.popup = new Popup({
      title: 'Edit swimlane limits',
      onConfirm: this.handleConfirmEditing,
      okButtonText: 'Save',
    });

    this.editBtn = document.getElementById(SwimlaneSettingsLimit.ids.editLimitsBtn);
    this.addEventListener(this.editBtn!, 'click', this.handleEditClick);
  }

  handleEditClick = (): void => {
    this.popup!.render();
    this.popup!.appendToContent(
      settingsPopupTableTemplate(
        SwimlaneSettingsLimit.ids.editTable,
        this.boardData!.swimlanesConfig.swimlanes.map(item =>
          settingsPopupTableRowTemplate({
            id: item.id,
            name: item.name,
            limit: this.settings![item.id] ? this.settings![item.id].limit! : 0,
            isIgnored: this.settings![item.id] ? this.settings![item.id].ignoreWipInColumns! : false,
            rowClass: SwimlaneSettingsLimit.classes.editSwimlaneRow,
          })
        ).join('')
      )
    );
  };

  removeEditBtn(): void {
    this.editBtn!.remove();
  }

  handleConfirmEditing = (unmountCallback: () => void): void => {
    const rows = document.querySelectorAll(
      `#${SwimlaneSettingsLimit.ids.editTable} .${SwimlaneSettingsLimit.classes.editSwimlaneRow}`
    );
    const updatedSettings: SwimlaneSettings = {};

    rows.forEach(row => {
      const { value: rawLimitValue } = row.querySelector('input[type="number"]') as HTMLInputElement;
      const { checked: isExpediteValue } = row.querySelector('input[type="checkbox"]') as HTMLInputElement;

      const swimlaneId = row.getAttribute('data-swimlane-id')!;
      const limitValue = Number.parseInt(rawLimitValue, 10);

      updatedSettings[swimlaneId] = {
        limit: limitValue < 1 ? undefined : limitValue,
        ignoreWipInColumns: isExpediteValue,
      };
    });

    this.settings = updatedSettings;
    this.updateBoardProperty(BOARD_PROPERTIES.SWIMLANE_SETTINGS, updatedSettings);
    unmountCallback();
  };
}
