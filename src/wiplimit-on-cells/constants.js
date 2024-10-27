// settings
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

export const settingsEditWipLimitOnCells = () => `
            <button id="${settingsJiraDOM.editLimitsBtn}" class="aui-button" type="button">Edit Wip limits by cells</button>
        `;

export const ClearDataButton = btnId => `<div style="margin-top: 1rem">
            <button id="${btnId}" class="aui-button" type="button">Clear and save all data</button>
        </div>`;

export const RangeName = () => `
<form class="aui">
  <div class="field-group">
    <label for="${settingsJiraDOM.inputRange}">Add range </label>
    <input class="text" id="${settingsJiraDOM.inputRange}" placeholder="name" />
    <button id="${settingsJiraDOM.buttonRange}" class="aui-button" type="button">Add range</button>
  </div>
</form>`;
// <input type="checkbox" class="checkbox select-user-chb" data-id="${id}"></input>

export const cellsAdd = (swimlanes, collums) => {
  if (!Array.isArray(collums) || !Array.isArray(swimlanes)) {
    return '';
  }
  const swimlanesHTML = [];
  swimlanes.forEach(element => {
    swimlanesHTML.push(`<option value=${element.id} >${element.name}</option>`);
  });
  const collumsHTML = [];
  collums.forEach(element => {
    collumsHTML.push(`<option value=${element.id} >${element.name}</option>`);
  });
  return `
    <div style="margin-top: 1rem">
              <form class="aui">
              <div class="field-group">
              <label for="${settingsJiraDOM.swimlaneSelect}">swimlane </label>
    <select id="${settingsJiraDOM.swimlaneSelect}" style="width:100%">
        <option>-</option>
        ${swimlanesHTML.join('')}
    </select>
    </div>

    <div class="field-group">
    <label for="${settingsJiraDOM.columnSelect}">Collumn </label>
    <select id="${settingsJiraDOM.columnSelect}" style="width:100%">
    <option>-</option>
        ${collumsHTML.join('')}
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
