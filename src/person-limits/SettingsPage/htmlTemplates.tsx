/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/button-has-type */

import React from 'react';
import { Alert } from 'antd';
import { useGetTextsByLocale } from 'src/shared/texts';

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

const TEXTS = {
  avatarWarning: {
    en: 'To work correctly, the person must have a Jira avatar.',
    ru: 'Чтобы WIP-лимиты на человека работали корректно, у пользователя должен быть установлен аватар.',
  },
};

export const groupSettingsBtnTemplate = (): string =>
  `<button id="${settingsJiraDOM.openEditorBtn}" class="aui-button">Manage per-person WIP-limits</button>`;

export const FormPersonalWipLimit = (): React.ReactNode => {
  const texts = useGetTextsByLocale(TEXTS);
  return (
    <form className="aui">
      <fieldset>
        <table>
          <tr>
            <td>
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 12 }}
                message={<span>{texts.avatarWarning}</span>}
              />
              <div className="field-group">
                <label htmlFor={settingsJiraDOM.idPersonName}>Person JIRA name</label>
                <input
                  className="text medium-field"
                  type="text"
                  id={settingsJiraDOM.idPersonName}
                  name={settingsJiraDOM.idPersonName}
                  placeholder=""
                />
              </div>

              <div className="field-group">
                <label htmlFor={settingsJiraDOM.idLimit}>Max issues at work</label>
                <input
                  className="text medium-field"
                  type="number"
                  id={settingsJiraDOM.idLimit}
                  name={settingsJiraDOM.idLimit}
                  placeholder=""
                />
              </div>
            </td>
            <td>
              <div className="field-group columns" style={{ display: 'flex' }}>
                <label htmlFor={settingsJiraDOM.idColumnSelect}>Columns</label>
                <select
                  id={settingsJiraDOM.idColumnSelect}
                  className="select2"
                  multiple
                  style={{ margin: '0 12px', width: '195px' }}
                  size={4}
                />
                <button id={settingsJiraDOM.idApplyColumnSelect} className="aui-button aui-button-link">
                  Apply columns
                  <br />
                  for selected users
                </button>
              </div>

              <div className="field-group swimlanes" style={{ display: 'flex' }}>
                <label htmlFor={settingsJiraDOM.idSwimlaneSelect}>Swimlanes</label>
                <select
                  id={settingsJiraDOM.idSwimlaneSelect}
                  className="select2"
                  multiple
                  style={{ margin: '0 12px', width: '195px' }}
                  size={5}
                />
                <button id={settingsJiraDOM.idApplySwimlaneSelect} className="aui-button aui-button-link">
                  Apply swimlanes
                  <br />
                  for selected users
                </button>
              </div>
            </td>
          </tr>
          <tr>
            <td>&nbsp;</td>
            <td>
              <div className="buttons-container">
                <div className="buttons">
                  <button className="aui-button aui-button-primary" type="submit" id={settingsJiraDOM.idButtonAddLimit}>
                    Add limit
                  </button>
                  <button
                    className="aui-button aui-button-primary"
                    type="submit"
                    disabled
                    id={settingsJiraDOM.idButtonEditLimit}
                  >
                    Edit limit
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </fieldset>
    </form>
  );
};

// Define types for input parameters
interface PersonalWipLimit {
  id: string;
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
