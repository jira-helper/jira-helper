import { beforeEach, describe, expect, it, vi } from 'vitest';
import { linkifyEpicLinkBadges, unlinkifyEpicLinkBadges } from './linkifyEpicLinkBadges';

describe('linkifyEpicLinkBadges', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('wraps Jira Epic Link extra field content with a browse link', () => {
    const card = document.createElement('div');
    card.innerHTML = `
      <span class="ghx-extra-field" data-tooltip="Epic Link: EPIC-123">
        <span class="ghx-extra-field-content">Миграция на новый API</span>
      </span>
    `;
    document.body.appendChild(card);

    linkifyEpicLinkBadges(card);

    const link = card.querySelector<HTMLAnchorElement>('a[data-jh-epic-link="true"]');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', `${window.location.origin}/browse/EPIC-123`);
    expect(link).toHaveTextContent('Миграция на новый API');
    expect(link).toHaveStyle({ textDecoration: 'none' });

    link?.dispatchEvent(new MouseEvent('mouseenter'));
    expect(link).toHaveStyle({ textDecoration: 'underline' });

    link?.dispatchEvent(new MouseEvent('mouseleave'));
    expect(link).toHaveStyle({ textDecoration: 'none' });
  });

  it('wraps Jira highlighted Epic Link label when epic key is stored in data-epickey', () => {
    const card = document.createElement('div');
    card.innerHTML = `
      <div class="ghx-highlighted-fields">
        <div class="ghx-highlighted-field">
          <span class="aui-label ghx-label-13" title="[Orders] Tech Debt Backlog" data-epickey="TTP-30226">
            [Orders] Tech Debt Backlog
          </span>
        </div>
      </div>
    `;
    document.body.appendChild(card);

    linkifyEpicLinkBadges(card);

    const link = card.querySelector<HTMLAnchorElement>('a[data-jh-epic-link="true"]');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', `${window.location.origin}/browse/TTP-30226`);
    expect(link).toHaveTextContent('[Orders] Tech Debt Backlog');
  });

  it('does not wrap the same Epic Link field twice', () => {
    const card = document.createElement('div');
    card.innerHTML = `
      <span class="ghx-extra-field" data-tooltip="Epic Link: EPIC-123">
        <span class="ghx-extra-field-content">Миграция на новый API</span>
      </span>
    `;

    linkifyEpicLinkBadges(card);
    linkifyEpicLinkBadges(card);

    expect(card.querySelectorAll('a[data-jh-epic-link="true"]')).toHaveLength(1);
  });

  it('unwraps jira-helper Epic Link anchors back to plain badge content', () => {
    const card = document.createElement('div');
    card.innerHTML = `
      <div class="ghx-highlighted-fields">
        <div class="ghx-highlighted-field">
          <span class="aui-label ghx-label-13" title="[Orders] Tech Debt Backlog" data-epickey="TTP-30226">
            [Orders] Tech Debt Backlog
          </span>
        </div>
      </div>
    `;

    linkifyEpicLinkBadges(card);
    unlinkifyEpicLinkBadges(card);

    expect(card.querySelector('a[data-jh-epic-link="true"]')).not.toBeInTheDocument();
    expect(card.querySelector('.aui-label')).toHaveTextContent('[Orders] Tech Debt Backlog');
  });

  it('leaves Epic Link field unchanged when no issue key is available', () => {
    const card = document.createElement('div');
    card.innerHTML = `
      <span class="ghx-extra-field" data-tooltip="Epic Link">
        <span class="ghx-extra-field-content">Миграция на новый API</span>
      </span>
    `;

    linkifyEpicLinkBadges(card);

    expect(card.querySelector('a')).not.toBeInTheDocument();
    expect(card.querySelector('.ghx-extra-field-content')).toHaveTextContent('Миграция на новый API');
  });

  it('stops click propagation so Jira card handlers do not consume the link click', () => {
    const card = document.createElement('div');
    const parentClick = vi.fn();
    const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);
    card.addEventListener('click', parentClick);
    card.innerHTML = `
      <span class="ghx-extra-field" data-tooltip="Epic Link: EPIC-123">
        <span class="ghx-extra-field-content">Миграция на новый API</span>
      </span>
    `;

    linkifyEpicLinkBadges(card);
    card
      .querySelector<HTMLAnchorElement>('a[data-jh-epic-link="true"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(parentClick).not.toHaveBeenCalled();
    expect(windowOpen).toHaveBeenCalledWith(
      `${window.location.origin}/browse/EPIC-123`,
      '_blank',
      'noopener,noreferrer'
    );
  });
});
