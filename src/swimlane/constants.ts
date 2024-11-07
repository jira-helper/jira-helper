export const settingsJiraDOM = {
  table: '#ghx-swimlane-table',
  sortableTbody: 'tbody.ui-sortable',
  createTbody: 'tbody.aui-restfultable-create',
  tableHead: 'thead',
  row: 'tr',
  cell: 'td',
  headCell: 'th',
  everythingElseRow: 'ghx-default-swimlane',
  swimlane: '.ghx-swimlane',
  swimlaneHeaderContainer: '.ghx-swimlane-header',
  swimlaneHeader: '.ghx-heading',
};

export const settingsEditBtnTemplate = (btnId: string): string => `<div style="margin-top: 1rem">
            <button id="${btnId}" class="aui-button" type="button">Edit swimlane limits</button>
        </div>`;

export const settingsPopupTableTemplate = (tableId: string, tableBody: string): string => `
   <form class="aui">
     <table id="${tableId}">
        <thead>
          <tr>
            <th>Swimlane</th>
            <th>WIP limits</th>
            <th>
               Is expedite
               <i title="Issues from this swimlane will be ignored from column WIP limits" style="font-style: normal; cursor: pointer;">&#9432;</i>
            </th>
          </tr>
        </thead>
        <tbody>
          ${tableBody}
        </tbody>
      </table>
  </form>
`;

interface TableRowTemplateParams {
  id: string;
  name: string;
  limit: number;
  isIgnored: boolean;
  rowClass: string;
}

export const settingsPopupTableRowTemplate = ({
  id,
  name,
  limit,
  isIgnored,
  rowClass,
}: TableRowTemplateParams): string =>
  `<tr class="${rowClass}" data-swimlane-id="${id}">
      <td>${name}</td>
      <td>
        <input class="text" type="number" value="${limit}"/>
      </td>
      <td>
        <input type="checkbox" ${isIgnored ? 'checked' : ''} /> 
      </td>
  </tr>`;
