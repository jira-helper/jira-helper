import type { ProjectIssueType } from '../jiraApi';

export interface IIssueTypeService {
  loadForProject(projectKey: string): Promise<ProjectIssueType[]>;
  clearCache(projectKey?: string): void;
}
