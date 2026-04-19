import type { ProjectIssueType } from 'src/infrastructure/jira/jiraApi';

export interface IIssueTypeService {
  loadForProject(projectKey: string): Promise<ProjectIssueType[]>;
  clearCache(projectKey?: string): void;
}
