import { Token } from 'dioma';
import { modelEntry, type ModelEntry } from 'src/infrastructure/di/Module';

export type IssueSetting = {
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.ComponentType<any>;
};

export type IssueSettingsModel = {
  settings: IssueSetting[];
};

const entry: ModelEntry<IssueSettingsModel> = modelEntry({ settings: [] });

export const issueSettingsModelToken = new Token<ModelEntry<IssueSettingsModel>>('IssueSettingsModel');

export function getIssueSettingsEntry(): ModelEntry<IssueSettingsModel> {
  return entry;
}

export function addIssueSetting(setting: IssueSetting): void {
  if (entry.model.settings.some(s => s.title === setting.title)) return;
  entry.model.settings.push(setting);
}

export function resetIssueSettings(): void {
  entry.model.settings.splice(0);
}
