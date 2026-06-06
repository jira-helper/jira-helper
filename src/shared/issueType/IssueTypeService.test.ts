import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Ok, Err } from 'ts-results';
import { IssueTypeService } from './IssueTypeService';
import type { GetProjectIssueTypes } from 'src/infrastructure/di/jiraApiTokens';

describe('IssueTypeService', () => {
  let getProjectIssueTypes: GetProjectIssueTypes;
  let service: IssueTypeService;

  beforeEach(() => {
    getProjectIssueTypes = vi.fn();
    service = new IssueTypeService(getProjectIssueTypes);
  });

  describe('loadForProject', () => {
    it('should load types from API', async () => {
      const mockTypes = [
        { id: '1', name: 'Task', subtask: false },
        { id: '2', name: 'Bug', subtask: false },
      ];

      vi.mocked(getProjectIssueTypes).mockResolvedValue(Ok(mockTypes));

      const types = await service.loadForProject('TEST');

      expect(types).toEqual(mockTypes);
      expect(getProjectIssueTypes).toHaveBeenCalledWith('TEST');
    });

    it('should cache results', async () => {
      const mockTypes = [{ id: '1', name: 'Task', subtask: false }];
      vi.mocked(getProjectIssueTypes).mockResolvedValue(Ok(mockTypes));

      await service.loadForProject('TEST');
      await service.loadForProject('TEST');

      expect(getProjectIssueTypes).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when API returns error result', async () => {
      vi.mocked(getProjectIssueTypes).mockResolvedValue(Err(new Error('API Error')));

      const types = await service.loadForProject('TEST');

      expect(types).toEqual([]);
    });

    it('should return empty array when API throws', async () => {
      vi.mocked(getProjectIssueTypes).mockRejectedValue(new Error('Network error'));

      const types = await service.loadForProject('TEST');

      expect(types).toEqual([]);
    });

    it('should not cache failed results', async () => {
      const mockTypes = [{ id: '1', name: 'Task', subtask: false }];
      vi.mocked(getProjectIssueTypes).mockResolvedValueOnce(Err(new Error('fail')));
      vi.mocked(getProjectIssueTypes).mockResolvedValueOnce(Ok(mockTypes));

      await service.loadForProject('TEST');
      const types = await service.loadForProject('TEST');

      expect(types).toEqual(mockTypes);
      expect(getProjectIssueTypes).toHaveBeenCalledTimes(2);
    });
  });

  describe('clearCache', () => {
    it('should clear cache for specific project', async () => {
      const mockTypes = [{ id: '1', name: 'Task', subtask: false }];
      vi.mocked(getProjectIssueTypes).mockResolvedValue(Ok(mockTypes));

      await service.loadForProject('TEST');
      service.clearCache('TEST');
      await service.loadForProject('TEST');

      expect(getProjectIssueTypes).toHaveBeenCalledTimes(2);
    });

    it('should clear entire cache when no key provided', async () => {
      const mockTypes = [{ id: '1', name: 'Task', subtask: false }];
      vi.mocked(getProjectIssueTypes).mockResolvedValue(Ok(mockTypes));

      await service.loadForProject('TEST');
      await service.loadForProject('OTHER');
      service.clearCache();
      await service.loadForProject('TEST');
      await service.loadForProject('OTHER');

      expect(getProjectIssueTypes).toHaveBeenCalledTimes(4);
    });
  });
});
