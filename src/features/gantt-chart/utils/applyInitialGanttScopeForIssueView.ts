import type { GanttSettingsModel } from '../models/GanttSettingsModel';
import type { SettingsScope } from '../types';

function buildScopeFromInitialLevel(
  preferredLevel: SettingsScope['level'] | null,
  projectKey: string,
  issueType: string
): SettingsScope {
  if (preferredLevel === null) {
    return { level: 'global' };
  }
  if (preferredLevel === 'global') {
    return { level: 'global' };
  }
  if (preferredLevel === 'projectIssueType' && issueType.trim()) {
    return { level: 'projectIssueType', projectKey, issueType: issueType.trim() };
  }
  return { level: 'project', projectKey };
}

/**
 * Picks the initial `currentScope` after {@link GanttSettingsModel.load} and page context
 * (`contextProjectKey`, `contextIssueType`) are set — same rules as
 * `GanttChartIssuePage` page-modification `loadData`.
 */
export function applyInitialGanttScopeForIssueView(model: GanttSettingsModel): void {
  const projectKey = model.contextProjectKey;
  const issueType = model.contextIssueType;
  const initialLevel = model.effectiveScopeLevel ?? model.preferredScopeLevel;
  const scope = buildScopeFromInitialLevel(initialLevel, projectKey, issueType);
  model.setScope(scope);
}
