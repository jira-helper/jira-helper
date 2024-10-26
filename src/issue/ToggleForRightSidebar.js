import { PageModification } from '../shared/PageModification';
import { getIssueId } from '../routing';
import { issueDOM } from './domSelectors';

const toggleMap = {
  false: { text: ' >> ', title: 'Collapse sidebar' },
  true: { text: ' << ', title: 'Expand sidebar' },
};

function changeHiddenSidebar(toggle) {
  const sidebar = document.querySelector(issueDOM.rightSidebar);
  if (sidebar) {
    sidebar.hidden = !sidebar.hidden;
    toggle.textContent = toggleMap[sidebar.hidden].text;
    toggle.title = toggleMap[sidebar.hidden].title;
  }
}

const getToggle = sidebarHidden => {
  const toggle = document.createElement('button');
  toggle.textContent = toggleMap[sidebarHidden].text;
  toggle.title = toggleMap[sidebarHidden].title;
  toggle.setAttribute('class', 'aui-button');
  toggle.addEventListener('click', () => {
    changeHiddenSidebar(toggle);
  });
  return toggle;
};

export default class extends PageModification {
  shouldApply() {
    return getIssueId() != null;
  }

  getModificationId() {
    return 'toggle-right-sidebar';
  }

  waitForLoading() {
    return Promise.all([this.waitForElement(issueDOM.rightSidebar), this.waitForElement(issueDOM.rightOptionsBar)]);
  }

  async apply() {
    const opsBar = document.querySelector(issueDOM.rightOptionsBar);
    const toggle = getToggle(false);
    opsBar.appendChild(toggle);
  }
}
