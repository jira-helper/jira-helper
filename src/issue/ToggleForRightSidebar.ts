import { PageModification } from '../shared/PageModification';
import { getIssueId } from '../routing';
import { issueDOM } from './domSelectors';

// Defining the structure of the toggleMap object
const toggleMap = {
  false: { text: ' >> ', title: 'Collapse sidebar' },
  true: { text: ' << ', title: 'Expand sidebar' },
};

// Function to change visibility of the sidebar
function changeHiddenSidebar(toggle: HTMLButtonElement): void {
  const sidebar = document.querySelector<HTMLElement>(issueDOM.rightSidebar);
  if (sidebar) {
    sidebar.hidden = !sidebar.hidden;
    toggle.textContent = toggleMap[`${sidebar.hidden}`].text;
    toggle.title = toggleMap[`${sidebar.hidden}`].title;
  }
}

// Function to create the toggle button element
const getToggle = (sidebarHidden: boolean): HTMLButtonElement => {
  const toggle = document.createElement('button');
  toggle.textContent = toggleMap[`${sidebarHidden}`].text;
  toggle.title = toggleMap[`${sidebarHidden}`].title;
  toggle.setAttribute('class', 'aui-button');
  toggle.addEventListener('click', () => {
    changeHiddenSidebar(toggle);
  });
  return toggle;
};

// Extending the PageModification class
export default class extends PageModification<any, Element> {
  // Method to check if the modification should be applied
  shouldApply(): boolean {
    return getIssueId() != null;
  }

  // Method to get the modification ID
  getModificationId(): string {
    return 'toggle-right-sidebar';
  }

  // Method to wait for loading required elements
  waitForLoading(): Promise<Element> {
    return Promise.all([
      this.waitForElement(issueDOM.rightSidebar),
      this.waitForElement(issueDOM.rightOptionsBar),
    ]).then(([, b]) => b);
  }

  // Method to apply the modification
  async apply(): Promise<void> {
    const opsBar = document.querySelector<HTMLElement>(issueDOM.rightOptionsBar);
    if (opsBar) {
      const toggle = getToggle(false);
      opsBar.appendChild(toggle);
    }
  }
}
