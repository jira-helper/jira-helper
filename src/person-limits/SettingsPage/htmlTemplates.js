export const settingsJiraDOM = {
  openEditorBtn: 'edit-person-wip-limit-btn-jh',
  idPersonName: 'edit-person-wip-limit-person-name',
  idLimit: 'edit-person-wip-limit-person-limit',
  idColumnSelect: 'edit-person-wip-limit-column-select',
  idApplyColumnSelect: 'edit-person-wip-limit-apply-columns',
  idSwimlaneSelect: 'edit-person-wip-limit-swimlane-select',
  idApplySwimlaneSelect: 'edit-person-wip-limit-apply-swimlane',
  idButtonAddLimit: 'edit-person-wip-limit-person-limit-save-button',
  idButtonEditLimit: 'edit-person-wip-limit-person-limit-edit-button',
  idTablePersonalWipLimit: 'edit-person-wip-limit-persons-limit-body',
  idTableHeadPersons: 'edit-person-wip-limit-head-persons',
  idTableHeadColumns: 'edit-person-wip-limit-head-columns',
  idTableHeadSwimlanes: 'edit-person-wip-limit-head-swimlanes',
  idTableHeadDelete: 'edit-person-wip-limit-head-delete',
};

export const groupSettingsBtnTemplate = () =>
  `<button id="${settingsJiraDOM.openEditorBtn}" class="aui-button">Manage per-person WIP-limits</button>`;

export const formPersonalWipLimit = () => {
  return `<form class="aui">
    <fieldset>
      <table>
        <tr>
          <td>
            <div class="field-group">
              <label for="${settingsJiraDOM.idPersonName}">Person JIRA name</label>
              <input class="text medium-field" type="text" id="${settingsJiraDOM.idPersonName}" name="${settingsJiraDOM.idPersonName}" placeholder="">
            </div>

            <div class="field-group">
              <label for="${settingsJiraDOM.idLimit}">Max issues at work</label>
              <input class="text medium-field" type="number" id="${settingsJiraDOM.idLimit}" name="${settingsJiraDOM.idLimit}" placeholder="">
            </div>
          </td>
          <td>
            <div class="field-group columns" style="display: flex">
              <label>Columns</label>
              <select id="${settingsJiraDOM.idColumnSelect}" class="select2" multiple style="margin: 0 12px; width: 195px;" size="4"></select>
              <button id="${settingsJiraDOM.idApplyColumnSelect}" class="aui-button aui-button-link">Apply columns<br/>for selected users</button>
            </div>

            <div class="field-group swimlanes" style="display: flex">
              <label>Swimlanes</label>
              <select id="${settingsJiraDOM.idSwimlaneSelect}" class="select2" multiple style="margin: 0 12px;  width: 195px;" size="5"></select>
              <button id="${settingsJiraDOM.idApplySwimlaneSelect}" class="aui-button aui-button-link">Apply swimlanes<br/>for selected users</button>
            </div>
          </td>
        </tr>
        <tr>
          <td>&nbsp;</td>
          <td>
            <div class="buttons-container">
              <div class="buttons">
                <button class="aui-button aui-button-primary" type="submit" id="${settingsJiraDOM.idButtonAddLimit}">Add limit</button>
                <button class="aui-button aui-button-primary" type="submit" disabled id="${settingsJiraDOM.idButtonEditLimit}">Edit limit</button>
              </div>
            </div>
          </td>
        </tr>
      </table>
    </fieldset>
  </form>`;
};

export const addPersonalWipLimit = ({ id, person, limit, columns, swimlanes }, isChecked) => {
  return `<tr id="row-${id}" class="person-row">
      <td><input type="checkbox" class="checkbox select-user-chb" data-id="${id}" ${
        isChecked ? 'checked="checked"' : ''
      }></td>
      <td>${person.displayName}</td>
      <td>${limit}</td>
      <td>${columns.map(c => c.name).join(', ')}</td>
      <td>${swimlanes.map(s => s.name).join(', ')}</td>
      <td><div><button class="aui-button" id="delete-${id}">Delete</button></div><hr><div><button class="aui-button" id="edit-${id}">Edit</button></div></td>
    </tr>
  `;
};

export const tablePersonalWipLimit = () => {
  return `<table class="aui">
    <thead>
    <tr>
      <th></th>
      <th id="${settingsJiraDOM.idTableHeadPersons}">Person</th>
      <th id="${settingsJiraDOM.idTableHeadLimits}">Limit</th>
      <th id="${settingsJiraDOM.idTableHeadColumns}">Columns</th>
      <th id="${settingsJiraDOM.idTableHeadSwimlanes}">Swimlanes</th>
      <th id="${settingsJiraDOM.idTableHeadDelete}">Delete</th>
    </tr>
    </thead>
    <tbody id="${settingsJiraDOM.idTablePersonalWipLimit}"></tbody>
  </table>`;
};
