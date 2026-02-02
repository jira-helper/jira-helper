import style from './styles.module.css';

// Template for group settings button
export const groupSettingsBtnTemplate = ({
  groupOfBtnsId = '',
  openEditorBtn = '',
}: {
  groupOfBtnsId?: string;
  openEditorBtn?: string;
}) =>
  `<div id="${groupOfBtnsId}" class="aui-buttons ${style.jhGroupOfBtns}"><button id="${openEditorBtn}" class="aui-button">Group Settings</button></div>`;
