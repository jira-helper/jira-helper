const EPIC_LINK_SELECTOR =
  '.ghx-extra-field[data-tooltip*="Epic Link"], .ghx-extra-field[title*="Epic Link"], .ghx-highlighted-field .aui-label[data-epickey]';
const ISSUE_KEY_PATTERN = /\b[A-Z][A-Z0-9]+-\d+\b/;

function getElementsIncludingRoot(root: ParentNode, selector: string): Element[] {
  const elements = Array.from(root.querySelectorAll(selector));

  if (root instanceof Element && root.matches(selector)) {
    return [root, ...elements];
  }

  return elements;
}

function extractIssueKey(value: string | null | undefined): string | null {
  return value?.match(ISSUE_KEY_PATTERN)?.[0] ?? null;
}

function getEpicKey(field: Element): string | null {
  const existingBrowseLink = field.querySelector<HTMLAnchorElement>('a[href*="/browse/"]');
  const valuesToCheck = [
    field.getAttribute('data-epic-key'),
    field.getAttribute('data-epickey'),
    field.getAttribute('data-issue-key'),
    field.getAttribute('data-issuekey'),
    field.getAttribute('data-tooltip'),
    field.getAttribute('title'),
    existingBrowseLink?.getAttribute('href'),
    field.textContent,
  ];

  for (const value of valuesToCheck) {
    const issueKey = extractIssueKey(value);
    if (issueKey) return issueKey;
  }

  return null;
}

function createEpicAnchor(epicKey: string): HTMLAnchorElement {
  const anchor = document.createElement('a');
  anchor.href = `${window.location.origin}/browse/${epicKey}`;
  anchor.dataset.jhEpicLink = 'true';
  anchor.style.color = 'inherit';
  anchor.style.cursor = 'pointer';
  anchor.style.textDecoration = 'none';
  anchor.addEventListener('mouseenter', () => {
    anchor.style.textDecoration = 'underline';
  });
  anchor.addEventListener('mouseleave', () => {
    anchor.style.textDecoration = 'none';
  });
  anchor.addEventListener('focus', () => {
    anchor.style.textDecoration = 'underline';
  });
  anchor.addEventListener('blur', () => {
    anchor.style.textDecoration = 'none';
  });
  anchor.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    window.open(anchor.href, '_blank', 'noopener,noreferrer');
  });
  return anchor;
}

/**
 * Jira Server renders the board card "Epic Link" extra field as plain text.
 * When Jira exposes the epic key in tooltip/attributes, convert that text to a normal browse link.
 */
export function linkifyEpicLinkBadges(root: ParentNode = document): void {
  const fields = getElementsIncludingRoot(root, EPIC_LINK_SELECTOR);

  for (const field of fields) {
    const content = field.querySelector<HTMLElement>('.ghx-extra-field-content') ?? (field as HTMLElement);

    if (content.querySelector('a[data-jh-epic-link="true"], a[href*="/browse/"]')) {
      continue;
    }

    const epicKey = getEpicKey(field);
    if (!epicKey) {
      continue;
    }

    const anchor = createEpicAnchor(epicKey);
    while (content.firstChild) {
      anchor.appendChild(content.firstChild);
    }
    content.appendChild(anchor);
  }
}

export function unlinkifyEpicLinkBadges(root: ParentNode = document): void {
  const links = getElementsIncludingRoot(root, 'a[data-jh-epic-link="true"]');

  for (const link of links) {
    const parent = link.parentNode;
    if (!parent) {
      continue;
    }

    while (link.firstChild) {
      parent.insertBefore(link.firstChild, link);
    }
    parent.removeChild(link);
  }
}
