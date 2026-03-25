import { Container } from 'dioma';
import type { ProjectIssueType } from '../jiraApi';
import type { GetProjectIssueTypes } from '../di/jiraApiTokens';
import { getProjectIssueTypesToken } from '../di/jiraApiTokens';
import type { IIssueTypeService } from './IIssueTypeService';
import { issueTypeServiceToken } from './tokens';

export class IssueTypeService implements IIssueTypeService {
  private cache = new Map<string, ProjectIssueType[]>();

  constructor(private getProjectIssueTypes: GetProjectIssueTypes) {}

  async loadForProject(projectKey: string): Promise<ProjectIssueType[]> {
    if (this.cache.has(projectKey)) {
      return this.cache.get(projectKey)!;
    }

    try {
      const result = await this.getProjectIssueTypes(projectKey);
      if (!result.err) {
        const types = result.val;
        this.cache.set(projectKey, types);
        return types;
      }
    } catch (error) {
      // eslint-disable-next-line no-console -- fallback logging when API fails
      console.warn('Failed to load issue types from API', error);
    }

    return [];
  }

  clearCache(projectKey?: string): void {
    if (projectKey) {
      this.cache.delete(projectKey);
    } else {
      this.cache.clear();
    }
  }
}

export const registerIssueTypeServiceInDI = (container: Container) => {
  const getProjectIssueTypes = container.inject(getProjectIssueTypesToken);
  container.register({
    token: issueTypeServiceToken,
    value: new IssueTypeService(getProjectIssueTypes),
  });
};
