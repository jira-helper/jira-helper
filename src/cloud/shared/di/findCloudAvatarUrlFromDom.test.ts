import { describe, expect, it } from 'vitest';
import { findCloudAvatarUrlFromDom } from './findCloudAvatarUrlFromDom';

describe('findCloudAvatarUrlFromDom', () => {
  it('reads the person avatar from a team-managed board.content.cell.card', () => {
    document.body.innerHTML = `
      <div data-testid="board.content.cell.card">
        <span aria-label="Исполнитель: Maxim Sosnov"></span>
        <img src="https://example.net/issuetype.png" alt="Задача" />
        <img src="https://avatar-management--avatars.example/557058:acct/hash/128" alt="" />
      </div>
    `;

    expect(findCloudAvatarUrlFromDom('Maxim Sosnov')).toBe(
      'https://avatar-management--avatars.example/557058:acct/hash/128'
    );
  });

  it('still reads company-managed platform-board-kit cards', () => {
    document.body.innerHTML = `
      <div data-testid="platform-board-kit.ui.card.card">
        <span hidden>Assignee: xCredo</span>
        <img src="https://secure.gravatar.com/avatar/abc" alt="" />
      </div>
    `;

    expect(findCloudAvatarUrlFromDom('xCredo')).toBe('https://secure.gravatar.com/avatar/abc');
  });
});
