import { describe, expect, it, vi } from 'vitest';

import { Routes, type Route } from '../routing';
import type { IRoutingService } from '../routing/IRoutingService';
import { PageModification } from './PageModification';
import runModifications from './runModifications';

class FakeBoardModification extends PageModification {
  applyCount = 0;
  clearCount = 0;
  boardId = '1';

  getModificationId(): string {
    return `fake-board-${this.boardId}`;
  }

  apply(): void {
    this.applyCount += 1;
  }

  clear(): void {
    this.clearCount += 1;
    super.clear();
  }
}

describe('runModifications board change', () => {
  it('clears and re-applies when the board id changes after a URL event', async () => {
    const modification = new FakeBoardModification();
    let onUrlChange: ((url: string) => void) | undefined;

    const routingService = {
      getCurrentRoute: () => Routes.BOARD,
      getBoardIdFromURL: () => modification.boardId,
      getSearchParam: () => null,
      getReportNameFromURL: () => null,
      getIssueId: () => null,
      getProjectKeyFromURL: () => null,
      onUrlChange: (cb: (url: string) => void) => {
        onUrlChange = cb;
      },
    } satisfies IRoutingService;

    runModifications({ [Routes.BOARD]: [modification] }, routingService);
    await vi.waitFor(() => expect(modification.applyCount).toBe(1));

    modification.boardId = '2';
    onUrlChange?.('https://x.atlassian.net/jira/software/projects/TRB/boards/2');
    await vi.waitFor(() => expect(modification.applyCount).toBe(2));

    expect(modification.clearCount).toBe(1);
    expect(modification.getModificationId()).toBe('fake-board-2');
  });

  it('clears board modifications when the URL leaves the board (unrecognized route)', async () => {
    const modification = new FakeBoardModification();
    let onUrlChange: ((url: string) => void) | undefined;
    let currentRoute: Route | null = Routes.BOARD;

    const routingService = {
      getCurrentRoute: () => currentRoute,
      getBoardIdFromURL: () => modification.boardId,
      getSearchParam: () => null,
      getReportNameFromURL: () => null,
      getIssueId: () => null,
      getProjectKeyFromURL: () => null,
      onUrlChange: (cb: (url: string) => void) => {
        onUrlChange = cb;
      },
    } satisfies IRoutingService;

    runModifications({ [Routes.BOARD]: [modification] }, routingService);
    await vi.waitFor(() => expect(modification.applyCount).toBe(1));

    currentRoute = null;
    onUrlChange?.('https://x.atlassian.net/jira/software/projects/KAN/list');
    await vi.waitFor(() => expect(modification.clearCount).toBe(1));
    expect(modification.applyCount).toBe(1);
  });
});
