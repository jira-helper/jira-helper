import React from 'react';
import { PageModification } from '../../shared/PageModification';
import { getSettingsTab } from '../../routing';
import { getUser } from '../../shared/jiraApi';
import { btnGroupIdForColumnsSettingsPage, BOARD_PROPERTIES } from '../../shared/constants';
import {
  settingsJiraDOM,
  groupSettingsBtnTemplate,
  FormPersonalWipLimit,
  tablePersonalWipLimit,
  addPersonalWipLimit,
} from './htmlTemplates';
import { Popup } from '../../shared/getPopup';

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

type PersonLimit = {
  id: number;
  person: {
    name: string;
    displayName: string;
    self: string;
    avatar: string;
  };
  limit: number;
  columns: Array<{ id: string; name: string }>;
  swimlanes: Array<{ id: string; name: string }>;
};

type PersonLimits = {
  limits: PersonLimit[];
};
export default class PersonalWIPLimit extends PageModification<[BoardData, any], Element> {
  static jiraSelectors = {
    panelConfig: `#${btnGroupIdForColumnsSettingsPage}`,
  };

  private boardData: BoardData | null = null;

  private boardDataColumns: MappedColumn[] | null = null;

  private boardDataSwimlanes: Swimlane[] | null = null;

  private DOMeditBtn: Element | null = null;

  private popup: Popup | null = null;

  private DOMselectColumns: HTMLSelectElement | null = null;

  private DOMapplyColumnSelect: HTMLButtonElement | null = null;

  private DOMselectSwimlane: HTMLSelectElement | null = null;

  private DOMapplySwimlaneSelect: HTMLButtonElement | null = null;

  private DOMfieldLimit: HTMLInputElement | null = null;

  private DOMfieldPersonName: HTMLInputElement | null = null;

  private DOMtablePersonalWipLimit: HTMLTableElement | null = null;

  private DOMAddLimit: HTMLButtonElement | null = null;

  private DOMEditLimit: HTMLButtonElement | null = null;

  private idPersonalOfEdit: string | null = null;

  private personLimits: PersonLimits = { limits: [] };

  private personLimitsRecovery: PersonLimits = { limits: [] };

  async shouldApply(): Promise<boolean> {
    return (await getSettingsTab()) === 'columns';
  }

  getModificationId(): string {
    return `add-person-settings-${this.getBoardId()}`;
  }

  waitForLoading(): Promise<Element> {
    // after button column button
    return this.waitForElement(PersonalWIPLimit.jiraSelectors.panelConfig);
  }

  loadData(): Promise<[any, any]> {
    return Promise.all([this.getBoardEditData(), this.getBoardProperty(BOARD_PROPERTIES.PERSON_LIMITS)]);
  }

  apply(data: [BoardData, any]): void {
    if (!data) return;
    const [boardData, personLimits = { limits: [] }] = data;
    if (!boardData.canEdit) return;

    this.boardData = boardData;
    this.boardDataColumns = this.boardData.rapidListConfig.mappedColumns.filter((i: any) => !i.isKanPlanColumn);
    this.boardDataSwimlanes = this.boardData.swimlanesConfig.swimlanes;
    this.personLimits = personLimits;
    this.personLimitsRecovery = window.structuredClone(personLimits);

    this.renderEditButton();
    this.onDOMChange('#columns', () => {
      this.renderEditButton();
    });
  }

  renderEditButton(): void {
    this.DOMeditBtn = this.insertHTML(
      document.getElementById(btnGroupIdForColumnsSettingsPage)!,
      'beforeend',
      groupSettingsBtnTemplate()
    );

    this.popup = new Popup({
      title: 'Personal WIP Limit',
      okButtonText: 'Save',
      size: 'large',
      onConfirm: this.handleSubmit,
      onCancel: this.handleClose,
    });

    this.addEventListener(this.DOMeditBtn!, 'click', this.openPersonalSettingsPopup);
  }

  openPersonalSettingsPopup = async (): Promise<void> => {
    await this.popup!.render();
    this.popup!.appendReactComponentToContent(<FormPersonalWipLimit />);
    await this.popup!.appendToContent(tablePersonalWipLimit());

    this.DOMselectColumns = document.getElementById(settingsJiraDOM.idColumnSelect) as HTMLSelectElement;
    this.DOMapplyColumnSelect = document.getElementById(settingsJiraDOM.idApplyColumnSelect) as HTMLButtonElement;

    this.DOMselectSwimlane = document.getElementById(settingsJiraDOM.idSwimlaneSelect) as HTMLSelectElement;
    this.DOMapplySwimlaneSelect = document.getElementById(settingsJiraDOM.idApplySwimlaneSelect) as HTMLButtonElement;

    this.DOMfieldLimit = document.getElementById(settingsJiraDOM.idLimit) as HTMLInputElement;
    this.DOMfieldPersonName = document.getElementById(settingsJiraDOM.idPersonName) as HTMLInputElement;
    this.DOMtablePersonalWipLimit = document.getElementById(
      settingsJiraDOM.idTablePersonalWipLimit
    ) as HTMLTableElement;
    this.DOMAddLimit = document.getElementById(settingsJiraDOM.idButtonAddLimit) as HTMLButtonElement;
    this.DOMEditLimit = document.getElementById(settingsJiraDOM.idButtonEditLimit) as HTMLButtonElement;

    this.addOptionsToSelect(this.DOMselectColumns, this.boardDataColumns!);
    this.addOptionsToSelect(this.DOMselectSwimlane, this.boardDataSwimlanes!);

    this.showRowsTable();

    this.DOMAddLimit.addEventListener('click', async event => this.onAddLimit(event));
    this.DOMEditLimit.addEventListener('click', async event => this.onEditLimit(event));

    this.DOMapplyColumnSelect.addEventListener('click', async event => this.onApplyColumnForAllUser(event));
    this.DOMapplySwimlaneSelect.addEventListener('click', async event => this.onApplySwimlaneForAllUser(event));
  };

  addOptionsToSelect = (DOMSelect: HTMLSelectElement, items: any[]): void => {
    items.forEach(({ id, name, isKanPlanColumn }) => {
      if (isKanPlanColumn) {
        // for backlog kanban board
        return;
      }
      const option = document.createElement('option');
      option.text = name;
      option.value = id;
      option.selected = true;
      DOMSelect.appendChild(option);
    });
  };

  handleSubmit = async (unmountPopup: Function): Promise<void> => {
    await this.updateBoardProperty(BOARD_PROPERTIES.PERSON_LIMITS, this.personLimits);
    this.personLimitsRecovery = window.structuredClone(this.personLimits);
    unmountPopup();
  };

  handleClose = async (unmountPopup: Function): Promise<void> => {
    this.personLimits = window.structuredClone(this.personLimitsRecovery);
    unmountPopup();
  };

  updateLineLimits = (settingName: 'columns' | 'swimlanes'): void => {
    const data = this.getDataForm();
    const selectedPerson = this.getSelectedPerson();

    this.personLimits.limits = this.personLimits.limits.map(limit => {
      if (selectedPerson.includes(limit.id)) {
        limit[settingName] = data[settingName];
      }
      return limit;
    });
    return this.renderAllRow(selectedPerson);
  };

  onApplyColumnForAllUser = async (e: Event): Promise<void> => {
    e.preventDefault();
    return this.updateLineLimits('columns');
  };

  onApplySwimlaneForAllUser = async (e: Event): Promise<void> => {
    e.preventDefault();
    return this.updateLineLimits('swimlanes');
  };

  onAddLimit = async (e: Event): Promise<void> => {
    e.preventDefault();

    const data = this.getDataForm();
    const fullPerson = await getUser(data.person.name);

    const personLimit = {
      id: Date.now(),
      person: {
        name: fullPerson.name ?? fullPerson.displayName,
        displayName: fullPerson.displayName,
        self: fullPerson.self,
        avatar: fullPerson.avatarUrls['32x32'],
      },
      limit: data.limit,
      columns: data.columns,
      swimlanes: data.swimlanes,
    };

    this.personLimits.limits.push(personLimit);

    this.renderRow(personLimit);
  };

  onEditLimit = async (e: Event): Promise<void> => {
    e.preventDefault();
    const personId = parseInt(this.idPersonalOfEdit!, 10);
    (e.target as HTMLButtonElement).disabled = true;

    if (!personId) return;

    const index = this.personLimits.limits.findIndex(pl => pl.id === personId);

    if (index === -1) return;

    const data = this.getDataForm();

    this.personLimits.limits[index] = {
      ...this.personLimits.limits[index],
      ...data,
      person: {
        ...data.person,
        ...this.personLimits.limits[index].person,
      },
    };

    this.renderAllRow();

    this.DOMAddLimit!.disabled = false;
    this.DOMEditLimit!.disabled = true;
  };

  onDeleteLimit = async (id: number): Promise<void> => {
    this.personLimits.limits = this.personLimits.limits.filter(limit => limit.id !== id);
  };

  onEdit = async (id: number): Promise<void> => {
    const personalWIPLimit = this.personLimits.limits.find(limit => limit.id === id);

    if (personalWIPLimit) {
      this.DOMfieldLimit!.value = String(personalWIPLimit.limit);
      this.DOMfieldPersonName!.value = personalWIPLimit.person.name;

      this.DOMAddLimit!.disabled = true;
      this.DOMEditLimit!.disabled = false;
      this.idPersonalOfEdit = id.toString();
      document.getElementById(`row-${id}`)!.style.background = '#ffd989c2';

      const selectedColumnsIds = personalWIPLimit.columns.map(c => c.id);
      Array.from(this.DOMselectColumns!.options).forEach(option => {
        option.selected = selectedColumnsIds.indexOf(option.value) > -1;
      });

      const selectedSwimlanesIds = personalWIPLimit.swimlanes.map(c => c.id);
      Array.from(this.DOMselectSwimlane!.options).forEach(option => {
        option.selected = selectedSwimlanesIds.indexOf(option.value) > -1;
      });
    }
  };

  showRowsTable(): void {
    this.personLimits.limits.forEach(personLimit => this.renderRow(personLimit));
  }

  renderAllRow(idsUsersForChecked?: number[]): void {
    this.popup!.htmlElement!.querySelectorAll('.person-row').forEach(row => row.remove());
    this.personLimits.limits.forEach(personLimit =>
      this.renderRow(personLimit, idsUsersForChecked != null ? idsUsersForChecked.indexOf(personLimit.id) > -1 : false)
    );
  }

  renderRow(personLimit: any, isChecked?: boolean): void {
    const { id } = personLimit;

    this.DOMtablePersonalWipLimit!.insertAdjacentHTML('beforeend', addPersonalWipLimit(personLimit, isChecked!));

    document.getElementById(`delete-${id}`)!.addEventListener('click', async () => {
      await this.onDeleteLimit(id);
      document.getElementById(`row-${id}`)!.remove();
    });

    document.getElementById(`edit-${id}`)!.addEventListener('click', async () => {
      await this.onEdit(id);
    });
  }

  getSelectedPerson(): number[] {
    const DOMCheckboxUsers = document.querySelectorAll(
      `#${settingsJiraDOM.idTablePersonalWipLimit} input.select-user-chb:checked`
    );
    return Array.from(DOMCheckboxUsers).map(cb => parseInt((cb as HTMLInputElement).getAttribute('data-id')!, 10));
  }

  getDataForm(): {
    person: {
      name: string;
    };
    limit: number;
    columns: Array<{ id: string; name: string }>;
    swimlanes: Array<{ id: string; name: string }>;
  } {
    const name = this.DOMfieldPersonName!.value;
    const limit = this.DOMfieldLimit!.valueAsNumber;
    const columns = Array.from(this.DOMselectColumns!.selectedOptions).map(option => ({
      id: option.value,
      name: option.text,
    }));
    const swimlanes = Array.from(this.DOMselectSwimlane!.selectedOptions).map(option => ({
      id: option.value,
      name: option.text,
    }));

    return {
      person: {
        name,
      },
      limit,
      columns,
      swimlanes,
    };
  }
}
