import style from './styles.module.css';

export const settingsEditBtnTemplate = btnId => `<div class="${style.settingsEditBtn}">
            <button id="${btnId}" class="aui-button" type="button">Edit WIP limits by field</button>
        </div>`;

export const fieldLimitsTableTemplate = ({
  tableId,
  tableBodyId,
  addLimitBtnId,
  editLimitBtnId,
  fieldValueInputId,
  visualNameInputId,
  columnsSelectId,
  swimlanesSelectId,
  wipLimitInputId,
  applySwimlanesId,
  applyColumnsId,
  selectFieldId,
  selectFieldOptions = [],
  swimlaneOptions = [],
  columnOptions = [],
}) => `
   <form class="aui" onsubmit="return false;">
      <fieldset>
        <table>
          <tr>
            <td>
               <div class="field-group">
                <label for="field-name" title="two related fields as one key" style="cursor: help;"><b>Field<sup>*</sup></b></label>
                <select id="${selectFieldId}" class="select" name="field-name" defaultValue="${
  selectFieldOptions[0]?.value
}">
                    ${selectFieldOptions.map(
                      (option, i) =>
                        `<option ${i === 0 ? 'selected="selected"' : ''} value="${option.value}">${
                          option.text
                        }</option>`
                    )}
                </select>
              </div>
              <div class="field-group">
                <label for="field-value" title="two related fields as one key" style="cursor: help;"><b>Field Value<sup>*</sup></b></label>
                <input id="${fieldValueInputId}" class="text medium-field" type="text" name="field-value" placeholder="Field Value">
              </div>
              <div class="field-group">
                <label for="field-value">Visual Name</label>
                <input id="${visualNameInputId}" class="text medium-field" type="text" name="visual-name" placeholder="Visual Name">
              </div>
              <div class="field-group">
                <label for="field-limit">WIP Limit</label>
                <input id="${wipLimitInputId}" class="text medium-field" type="number" name="field-limit" placeholder="0">
              </div>
            </td>
            <td>
              <div class="field-group" style="display: flex">
                <label>Columns</label>
                <select id="${columnsSelectId}" class="select2" multiple style="margin: 0 12px; width: 195px;" size="4">
                  ${columnOptions.map(option => `<option selected value="${option.value}">${option.text}</option>`)}
                </select>
                <button type="button" id="${applyColumnsId}" class="aui-button aui-button-link">Apply columns<br/>for selected users</button>
              </div>
              <div class="field-group" style="display: flex">
                <label>Swimlanes</label>
                <select id="${swimlanesSelectId}" class="select2" multiple style="margin: 0 12px; width: 195px;" size="5">
                  ${swimlaneOptions.map(option => `<option selected value="${option.value}">${option.text}</option>`)}
                </select>
                <button type="button" id="${applySwimlanesId}" class="aui-button aui-button-link">Apply swimlanes<br/>for selected users</button>
              </div>
            </td>
          </tr>
          <tr>
            <td>&nbsp;</td>
            <td>
              <div class="buttons-container">
                <div class="buttons">
                  <button class="aui-button aui-button-primary ${
                    style.addFieldLimitBtn
                  }" type="button" id="${addLimitBtnId}">Add limit</button>
                  <button class="aui-button aui-button-primary ${
                    style.editFieldLimitBtn
                  }" type="submit" disabled id="${editLimitBtnId}">Edit limit</button>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </fieldset>
     </div>
     <table id="${tableId}" class="aui ${style.addFieldLimitTable}">
        <thead>
          <tr>
            <th></th>
            <th>Field Name</th>
            <th>Field Value</th>
            <th>Visual Name</th>
            <th>Limit</th>
            <th>Columns</th>
            <th>Swimlanes</th>
            <th></th>
          </tr>
        </thead>
        <tbody id="${tableBodyId}">
        </tbody>
      </table>
  </form>
`;

export const fieldRowTemplate = ({
  limitKey,
  fieldId,
  fieldName,
  fieldValue,
  visualValue,
  bkgColor,
  limit,
  columns = [],
  swimlanes = [],
  editClassBtn,
  deleteClassBtn,
}) => `
    <tr data-field-project-row="${limitKey}">
      <td><input type="checkbox" class="checkbox" data-id="${limitKey}"></td>
      <td data-type="field-name" data-value="${fieldId}">${fieldName}</td>
      <td data-type="field-value">${fieldValue}</td>
      <td data-type="visual-name"><div colorpicker-data-id="${limitKey}"
          class="${style.visualName}" style="background-color:${bkgColor || 'none'}">${visualValue}</div></td>
      <td data-type="field-limit">${limit}</td>
      <td data-type="field-columns">${columns.map(c => c.name).join(', ')}</td>
      <td data-type="field-swimlanes">${swimlanes.map(s => s.name).join(', ')}</td>
      <td>
        <button class="aui-button ${editClassBtn} ${style.jhControlRowBtn}">Edit</button></br>
        <button class="aui-button ${deleteClassBtn} ${style.jhControlRowBtn}">Delete</button>
      </td>
    </tr>
  `;
