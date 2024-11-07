export const settingsJiraDOM = {
  swimlaneSelect: 'WIPLC_swimlane',
  columnSelect: 'WIPLC_Column',
  showBadge: 'WIPLC_showBadge',
  table: 'WIP_tableDiv',
  ClearData: 'SLAClearData',
  inputRange: 'WIP_inputRange',
  disableRange: 'WIP_disableRange',
  buttonRange: 'WIP_buttonRange',
  chooseCheckbox: 'WIP_chooseCheckbox',
  editLimitsBtn: 'edit-WipLimitOnCells-btn-jh',
};

export const settingsEditWipLimitOnCells = (): string => `
            <button id="${settingsJiraDOM.editLimitsBtn}" class="aui-button" type="button">Edit Wip limits by cells</button>
        `;

export const ClearDataButton = (btnId: string): string => `<div style="margin-top: 1rem">
            <button id="${btnId}" class="aui-button" type="button">Clear and save all data</button>
        </div>`;

export const RangeName = (): string => `
<form class="aui">
  <div class="field-group">
    <label for="${settingsJiraDOM.inputRange}">Add range </label>
    <input class="text" id="${settingsJiraDOM.inputRange}" placeholder="name" />
    <button id="${settingsJiraDOM.buttonRange}" class="aui-button" type="button">Add range</button>
  </div>
</form>`;

export const cellsAdd = (
  swimlanes: { id: string; name: string }[],
  columns: { id: string; name: string }[]
): string => {
  if (!Array.isArray(columns) || !Array.isArray(swimlanes)) {
    return '';
  }
  const swimlanesHTML = swimlanes.map(element => `<option value=${element.id} >${element.name}</option>`).join('');
  const columnsHTML = columns.map(element => `<option value=${element.id} >${element.name}</option>`).join('');
  return `
    <div style="margin-top: 1rem">
              <form class="aui">
              <div class="field-group">
              <label for="${settingsJiraDOM.swimlaneSelect}">swimlane </label>
    <select id="${settingsJiraDOM.swimlaneSelect}" style="width:100%">
        <option>-</option>
        ${swimlanesHTML}
    </select>
    </div>

    <div class="field-group">
    <label for="${settingsJiraDOM.columnSelect}">Column </label>
    <select id="${settingsJiraDOM.columnSelect}" style="width:100%">
    <option>-</option>
        ${columnsHTML}
    </select>
    </div>
    <div class="field-group">
    <label for="${settingsJiraDOM.columnSelect}">show indicator</label>
    <input type="checkbox" class="checkbox select-user-chb" id="${settingsJiraDOM.showBadge}"></input>
    </div>
    </form>
    </div >
    <hr/>`;
};
