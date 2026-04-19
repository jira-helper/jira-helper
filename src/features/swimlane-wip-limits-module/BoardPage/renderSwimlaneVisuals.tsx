import React from 'react';
import type { IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import type { BoardRuntimeModel } from './models/BoardRuntimeModel';
import { LimitBadge } from './components/LimitBadge';

const BADGE_KEY = 'swimlane-limit-badge';

export function renderSwimlaneVisuals(model: BoardRuntimeModel, pageObject: IBoardPagePageObject): void {
  const swimlanes = pageObject.getSwimlanes();

  for (const swimlane of swimlanes) {
    pageObject.removeSwimlaneComponent(swimlane.header, BADGE_KEY);

    const stats = model.getSwimlaneStats(swimlane.id);
    const setting = model.settings[swimlane.id];

    if (!stats || !setting?.limit) {
      pageObject.highlightSwimlane(swimlane.header, false);
      continue;
    }

    pageObject.insertSwimlaneComponent(
      swimlane.header,
      React.createElement(LimitBadge, {
        count: stats.count,
        limit: setting.limit,
        exceeded: stats.isOverLimit,
      }),
      BADGE_KEY
    );

    pageObject.highlightSwimlane(swimlane.header, stats.isOverLimit);
  }
}
