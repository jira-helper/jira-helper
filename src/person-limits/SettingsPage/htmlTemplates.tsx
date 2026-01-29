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
  idTableHeadLimits: 'edit-person-wip-limit-head-limits',
};

export const groupSettingsBtnTemplate = (): string =>
  `<button id="${settingsJiraDOM.openEditorBtn}" class="aui-button">Manage per-person WIP-limits</button>`;

// Legacy functions for backward compatibility (used in stories)
interface PersonalWipLimit {
  id: number | string;
  person: {
    displayName: string;
  };
  limit: number;
  columns: { name: string }[];
  swimlanes: { name: string }[];
}

export const addPersonalWipLimit = (
  { id, person, limit, columns, swimlanes }: PersonalWipLimit,
  isChecked: boolean
): string => {
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

export const tablePersonalWipLimit = (): string => {
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
