import { BoardPagePageObject } from '../BoardPagePageObject';

const CLOUD_CARD_SELECTOR = '[data-testid="board.content.cell.card"], [data-testid="platform-board-kit.ui.card.card"]';

const PERSON_AVATAR_SELECTOR = 'img[src*="avatar-management"], img[src*="gravatar.com"]';

export function findCloudAvatarUrlFromDom(username: string): string | null {
  if (!username) return null;
  const needle = username.trim().toLowerCase();

  for (const card of Array.from(document.querySelectorAll<HTMLElement>(CLOUD_CARD_SELECTOR))) {
    const assignee = BoardPagePageObject.getAssigneeFromIssue(card);
    const matchesAssignee = assignee != null && assignee.trim().toLowerCase() === needle;
    const matchesAccountId = username.includes(':') && card.querySelector(`img[src*="${username}"]`) != null;
    if (!matchesAssignee && !matchesAccountId) continue;

    const avatarImg = card.querySelector<HTMLImageElement>(PERSON_AVATAR_SELECTOR);
    if (avatarImg?.src) return avatarImg.src;
  }

  return null;
}
