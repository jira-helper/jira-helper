import { PageModification } from '../../shared/PageModification';
import { getSettingsTab } from '../../routing';
import { getUser } from '../../shared/jiraApi';
import { btnGroupIdForColumnsSettingsPage, BOARD_PROPERTIES } from '../../shared/constants';
import {
  settingsJiraDOM,
  groupSettingsBtnTemplate,
  formPersonalWipLimit,
  tablePersonalWipLimit,
  addPersonalWipLimit,
} from './htmlTemplates';
import { Popup } from '../../shared/getPopup';

export default class PersonalWIPLimit extends PageModification {
  static jiraSelectors = {
    panelConfig: `#${btnGroupIdForColumnsSettingsPage}`,
  };

  async shouldApply() {
    return (await getSettingsTab()) === 'columns';
  }

  getModificationId() {
    return `add-person-settings-${this.getBoardId()}`;
  }

  waitForLoading() {
    // after button column button
    return Promise.all([this.waitForElement(PersonalWIPLimit.jiraSelectors.panelConfig)]);
  }

  loadData() {
    return Promise.all([this.getBoardEditData(), this.getBoardProperty(BOARD_PROPERTIES.PERSON_LIMITS)]);
  }

  apply(data) {
    if (!data) return;
    const [boardData = {}, personLimits = { limits: [] }] = data;
    if (!boardData.canEdit) return;

    this.boardData = boardData;
    this.boardDataColumns = this.boardData.rapidListConfig.mappedColumns.filter(i => !i.isKanPlanColumn);
    this.boardDataSwimlanes = this.boardData.swimlanesConfig.swimlanes;
    this.personLimits = personLimits;
    this.personLimitsRecovery = window.structuredClone(personLimits);

    this.renderEditButton();
    this.onDOMChange('#columns', () => {
      this.renderEditButton();
    });
  }

  renderEditButton() {
    this.DOMeditBtn = this.insertHTML(
      document.getElementById(btnGroupIdForColumnsSettingsPage),
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

    this.addEventListener(this.DOMeditBtn, 'click', this.openPersonalSettingsPopup);
  }

  openPersonalSettingsPopup = async () => {
    await this.popup.render();
    await this.popup.appendToContent(formPersonalWipLimit());
    await this.popup.appendToContent(tablePersonalWipLimit());

    this.DOMselectColumns = document.getElementById(settingsJiraDOM.idColumnSelect);
    this.DOMapplyColumnSelect = document.getElementById(settingsJiraDOM.idApplyColumnSelect);

    this.DOMselectSwimlane = document.getElementById(settingsJiraDOM.idSwimlaneSelect);
    this.DOMapplySwimlaneSelect = document.getElementById(settingsJiraDOM.idApplySwimlaneSelect);

    this.DOMfieldLimit = document.getElementById(settingsJiraDOM.idLimit);
    this.DOMfieldPersonName = document.getElementById(settingsJiraDOM.idPersonName);
    this.DOMtablePersonalWipLimit = document.getElementById(settingsJiraDOM.idTablePersonalWipLimit);
    this.DOMAddLimit = document.getElementById(settingsJiraDOM.idButtonAddLimit);
    this.DOMEditLimit = document.getElementById(settingsJiraDOM.idButtonEditLimit);

    this.addOptionsToSelect(this.DOMselectColumns, this.boardDataColumns);
    this.addOptionsToSelect(this.DOMselectSwimlane, this.boardDataSwimlanes);

    this.showRowsTable();

    this.DOMAddLimit.addEventListener('click', async event => this.onAddLimit(event));
    this.DOMEditLimit.addEventListener('click', async event => this.onEditLimit(event));

    this.DOMapplyColumnSelect.addEventListener('click', async event => this.onApplyColumnForAllUser(event));
    this.DOMapplySwimlaneSelect.addEventListener('click', async event => this.onApplySwimlaneForAllUser(event));
  };

  addOptionsToSelect = (DOMSelect, items) => {
    this.swimlanesOptions = items.forEach(({ id, name, isKanPlanColumn }) => {
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

  handleSubmit = async unmountPopup => {
    await this.updateBoardProperty(BOARD_PROPERTIES.PERSON_LIMITS, this.personLimits);
    this.personLimitsRecovery = window.structuredClone(this.personLimits);
    unmountPopup();
  };

  handleClose = async unmountPopup => {
    this.personLimits = window.structuredClone(this.personLimitsRecovery);
    unmountPopup();
  };

  updateLineLimits = settingName => {
    const data = this.getDataForm();
    const selectedPerson = this.getSelectedPerson();

    this.personLimits.limits = this.personLimits.limits.map(limit => {
      if (selectedPerson.indexOf(limit.id) > -1) {
        limit[settingName] = data[settingName];
      }
      return limit;
    });
    return this.renderAllRow(selectedPerson);
  };

  onApplyColumnForAllUser = async e => {
    e.preventDefault();
    return this.updateLineLimits('columns');
  };

  onApplySwimlaneForAllUser = async e => {
    e.preventDefault();
    return this.updateLineLimits('swimlanes');
  };

  onAddLimit = async e => {
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

  onEditLimit = async e => {
    e.preventDefault();
    const personId = parseInt(this.idPersonalOfEdit, 10);
    e.target.disabled = true;

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

    // await this.updateBoardProperty(BOARD_PROPERTIES.PERSON_LIMITS, this.personLimits);

    this.renderAllRow();

    this.DOMAddLimit.disabled = false;
    this.DOMEditLimit.disabled = true;
  };

  onDeleteLimit = async id => {
    this.personLimits.limits = this.personLimits.limits.filter(limit => limit.id !== id);
    // await this.updateBoardProperty(BOARD_PROPERTIES.PERSON_LIMITS, this.personLimits);
  };

  onEdit = async id => {
    const personalWIPLimit = this.personLimits.limits.find(limit => limit.id === id);

    document.getElementById(settingsJiraDOM.idLimit).value = personalWIPLimit.limit;
    document.getElementById(settingsJiraDOM.idPersonName).value = personalWIPLimit.person.name;

    this.DOMAddLimit.disabled = true;
    this.DOMEditLimit.disabled = false;
    this.idPersonalOfEdit = id;
    document.getElementById(`row-${id}`).style.background = '#ffd989c2';

    const selectedColumnsIds = personalWIPLimit.columns.map(c => c.id);
    this.DOMselectColumns.options.forEach(option => {
      option.selected = selectedColumnsIds.indexOf(option.value) > -1;
    });

    const selectedSwimlanesIds = personalWIPLimit.swimlanes.map(c => c.id);
    this.DOMselectSwimlane.options.forEach(option => {
      option.selected = selectedSwimlanesIds.indexOf(option.value) > -1;
    });

    // await this.updateBoardProperty(BOARD_PROPERTIES.PERSON_LIMITS, this.personLimits);
  };

  showRowsTable() {
    this.personLimits.limits.forEach(personLimit => this.renderRow(personLimit));
  }

  renderAllRow(idsUsersForChecked) {
    this.popup.htmlElement.querySelectorAll('.person-row').forEach(row => row.remove());
    this.personLimits.limits.forEach(personLimit =>
      this.renderRow(personLimit, idsUsersForChecked != null ? idsUsersForChecked.indexOf(personLimit.id) > -1 : false)
    );
  }

  renderRow(personLimit, isChecked) {
    const { id } = personLimit;

    this.DOMtablePersonalWipLimit.insertAdjacentHTML('beforeend', addPersonalWipLimit(personLimit, isChecked));

    document.getElementById(`delete-${id}`).addEventListener('click', async () => {
      await this.onDeleteLimit(id);
      document.getElementById(`row-${id}`).remove();
    });

    document.getElementById(`edit-${id}`).addEventListener('click', async () => {
      await this.onEdit(id);
    });
  }

  getSelectedPerson() {
    const DOMCheckboxUsers = document.querySelectorAll(
      `#${settingsJiraDOM.idTablePersonalWipLimit} input.select-user-chb:checked`
    );
    return Array.from(DOMCheckboxUsers).map(cb => parseInt(cb.getAttribute('data-id'), 10));
  }

  getDataForm() {
    const name = this.DOMfieldPersonName.value;
    const limit = this.DOMfieldLimit.valueAsNumber;
    const columns = [...this.DOMselectColumns.selectedOptions].map(option => ({
      id: option.value,
      name: option.text,
    }));
    const swimlanes = [...this.DOMselectSwimlane.selectedOptions].map(option => ({
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
