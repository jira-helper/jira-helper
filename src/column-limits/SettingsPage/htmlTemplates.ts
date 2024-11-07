import style from './styles.module.css';
import { generateColorByFirstChars as generateColor } from '../shared/utils';

// Template for group settings button
export const groupSettingsBtnTemplate = ({
  groupOfBtnsId = '',
  openEditorBtn = '',
}: {
  groupOfBtnsId?: string;
  openEditorBtn?: string;
}) =>
  `<div id="${groupOfBtnsId}" class="aui-buttons ${style.jhGroupOfBtns}"><button id="${openEditorBtn}" class="aui-button">Group Settings</button></div>`;

// Template for form
export const formTemplate = ({
  leftBlock = '',
  rightBlock = '',
  id = 'jh-wip-limits-id',
}: {
  leftBlock?: string;
  rightBlock?: string;
  id?: string;
}) =>
  `<form class="aui ${style.form}" id="${id}">
    <div class="${style.formLeftBlock}">${leftBlock}</div>
    <div class="${style.formRightBlock}">${rightBlock}</div>
    </form>`;

// Template for groups container
export const groupsTemplate = ({ id = 'jh-groups-template', children = '' }: { id?: string; children?: string }) =>
  `<div id="${id}">${children}</div>`;

// Template for a single group
export const groupTemplate = ({
  dropzoneClass = '',
  groupLimitsClass = '',
  withoutGroupId = '',
  groupId = '',
  customGroupColor,
  groupMax = '',
  columnsHtml = '',
}: {
  dropzoneClass?: string;
  groupLimitsClass?: string;
  withoutGroupId?: string;
  groupId?: string;
  customGroupColor?: string;
  groupMax?: string;
  columnsHtml?: string;
}) => `
        <div
          class="${style.columnGroupJH} "
          style="${groupId !== withoutGroupId ? `background-color: ${customGroupColor || generateColor(groupId)}` : ''}"
        >
            ${
              groupId === withoutGroupId
                ? ''
                : `<section class="${style.columnGroupLimitsJH}">
                  <span>Limit for group:</span>
                  <input data-group-id="${groupId}" class="${groupLimitsClass}" value="${groupMax}"/>
                </section>`
            }
          <div class="${style.columnListJH} ${dropzoneClass}" data-group-id="${groupId}">${columnsHtml}</div>
      </div>
    `;

// Template for a single column
export const columnTemplate = ({
  columnId = '',
  dataGroupId = '',
  columnTitle = '',
  draggableClass,
}: {
  columnId?: string;
  dataGroupId?: string;
  columnTitle?: string;
  draggableClass?: string;
}) =>
  `<div data-column-id="${columnId}" data-group-id="${dataGroupId}" class="${style.columnDraggableJH} ${draggableClass}" draggable="true">${columnTitle}</div>`;

// Template for drag-over-here area
export const dragOverHereTemplate = ({
  dropzoneId = '',
  dropzoneClass = '',
}: {
  dropzoneId?: string;
  dropzoneClass?: string;
}) =>
  `<div  class="${style.addGroupDropzoneJH} ${dropzoneClass}" id="${dropzoneId}">Drag column over here to create group</div>`;
