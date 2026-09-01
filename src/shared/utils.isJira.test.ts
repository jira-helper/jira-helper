import { describe, expect, it } from 'vitest';

import { isJiraPage } from './utils';

describe('isJiraPage', () => {
  it('does not throw when document.body is missing (document_start)', () => {
    expect(() => isJiraPage({ body: null })).not.toThrow();
    expect(isJiraPage({ body: null })).toBe(false);
  });

  it('is true only when body id is jira', () => {
    expect(isJiraPage({ body: { id: 'jira' } as HTMLElement })).toBe(true);
    expect(isJiraPage({ body: { id: '' } as HTMLElement })).toBe(false);
  });
});
