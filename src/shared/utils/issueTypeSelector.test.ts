import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Ok, Err } from 'ts-results';
import {
  generateIssueTypeSelectorHTML,
  getSelectedIssueTypes,
  loadIssueTypes,
  clearIssueTypesCache,
} from './issueTypeSelector';
import { getProjectIssueTypes } from '../jiraApi';
import { getIssueTypesFromDOM } from './getIssueTypesFromDOM';
import { getProjectKeyFromURL } from './getProjectKeyFromURL';

// Mock dependencies
vi.mock('../jiraApi');
vi.mock('./getIssueTypesFromDOM');
vi.mock('./getProjectKeyFromURL');

describe('issueTypeSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearIssueTypesCache();
  });

  describe('generateIssueTypeSelectorHTML', () => {
    it('should generate HTML with checkboxes for issue types', () => {
      const issueTypes = ['Task', 'Bug', 'Story'];
      const html = generateIssueTypeSelectorHTML(issueTypes);

      expect(html).toContain('Task');
      expect(html).toContain('Bug');
      expect(html).toContain('Story');
      expect(html).toContain('type="checkbox"');
      expect(html).toContain('Issue types to include:');
    });

    it('should mark selected types as checked', () => {
      const issueTypes = ['Task', 'Bug', 'Story'];
      const selectedTypes = ['Task', 'Story'];
      const html = generateIssueTypeSelectorHTML(issueTypes, selectedTypes, 'group1');

      // Check that Task and Story are checked
      expect(html).toContain('value="Task"');
      expect(html).toContain('value="Story"');
      expect(html).toContain('data-issue-type-selector="group1"');
    });

    it('should escape quotes in type names in value attribute', () => {
      const issueTypes = ['Task "Special"', 'Bug'];
      const html = generateIssueTypeSelectorHTML(issueTypes);

      // Value attribute should have escaped quotes
      expect(html).toContain('value="Task &quot;Special&quot;"');
      // Label text can contain quotes (it's safe in HTML)
      expect(html).toContain('Task "Special"');
    });

    it('should show message when no types available', () => {
      const html = generateIssueTypeSelectorHTML([]);

      expect(html).toContain('No issue types found');
      expect(html).toContain('manually enter types');
    });

    it('should include groupId in checkbox data attribute', () => {
      const issueTypes = ['Task', 'Bug'];
      const html = generateIssueTypeSelectorHTML(issueTypes, [], 'my-group-id');

      expect(html).toContain('data-issue-type-selector="my-group-id"');
    });
  });

  describe('getSelectedIssueTypes', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    it('should return selected issue types from checkboxes', () => {
      document.body.innerHTML = `
        <div>
          <input type="checkbox" value="Task" checked data-issue-type-selector="group1" />
          <input type="checkbox" value="Bug" data-issue-type-selector="group1" />
          <input type="checkbox" value="Story" checked data-issue-type-selector="group1" />
        </div>
      `;

      const container = document.body;
      const selected = getSelectedIssueTypes(container, 'group1');

      expect(selected).toEqual(['Task', 'Story']);
    });

    it('should return empty array when no checkboxes are checked', () => {
      document.body.innerHTML = `
        <div>
          <input type="checkbox" value="Task" data-issue-type-selector="group1" />
          <input type="checkbox" value="Bug" data-issue-type-selector="group1" />
        </div>
      `;

      const container = document.body;
      const selected = getSelectedIssueTypes(container, 'group1');

      expect(selected).toEqual([]);
    });

    it('should filter by groupId when provided', () => {
      document.body.innerHTML = `
        <div>
          <input type="checkbox" value="Task" checked data-issue-type-selector="group1" />
          <input type="checkbox" value="Bug" checked data-issue-type-selector="group2" />
          <input type="checkbox" value="Story" checked data-issue-type-selector="group1" />
        </div>
      `;

      const container = document.body;
      const selected = getSelectedIssueTypes(container, 'group1');

      expect(selected).toEqual(['Task', 'Story']);
    });

    it('should return all checked when groupId is empty', () => {
      document.body.innerHTML = `
        <div>
          <input type="checkbox" value="Task" checked />
          <input type="checkbox" value="Bug" />
          <input type="checkbox" value="Story" checked />
        </div>
      `;

      const container = document.body;
      const selected = getSelectedIssueTypes(container);

      expect(selected).toEqual(['Task', 'Story']);
    });
  });

  describe('loadIssueTypes', () => {
    it('should load types from API when projectKey is available', async () => {
      const mockProjectKey = 'TEST';
      const mockTypes = [
        { id: '1', name: 'Task', subtask: false },
        { id: '2', name: 'Bug', subtask: false },
      ];

      vi.mocked(getProjectKeyFromURL).mockReturnValue(mockProjectKey);
      vi.mocked(getProjectIssueTypes).mockResolvedValue(Ok(mockTypes));

      const types = await loadIssueTypes();

      expect(types).toEqual(['Task', 'Bug']);
      expect(getProjectIssueTypes).toHaveBeenCalledWith(mockProjectKey);
    });

    it('should fallback to DOM parsing when API fails', async () => {
      const mockProjectKey = 'TEST';
      const mockDomTypes = ['Task', 'Bug'];

      vi.mocked(getProjectKeyFromURL).mockReturnValue(mockProjectKey);
      vi.mocked(getProjectIssueTypes).mockResolvedValue(Err(new Error('API Error')));
      vi.mocked(getIssueTypesFromDOM).mockReturnValue(mockDomTypes);

      const types = await loadIssueTypes();

      expect(types).toEqual(mockDomTypes);
      expect(getIssueTypesFromDOM).toHaveBeenCalled();
    });

    it('should fallback to DOM parsing when projectKey is not available', async () => {
      const mockDomTypes = ['Task', 'Bug'];

      vi.mocked(getProjectKeyFromURL).mockReturnValue(null);
      vi.mocked(getIssueTypesFromDOM).mockReturnValue(mockDomTypes);

      const types = await loadIssueTypes();

      expect(types).toEqual(mockDomTypes);
      expect(getIssueTypesFromDOM).toHaveBeenCalled();
      expect(getProjectIssueTypes).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      const mockProjectKey = 'TEST';
      const mockDomTypes = ['Task'];

      vi.mocked(getProjectKeyFromURL).mockReturnValue(mockProjectKey);
      vi.mocked(getProjectIssueTypes).mockRejectedValue(new Error('Network error'));
      vi.mocked(getIssueTypesFromDOM).mockReturnValue(mockDomTypes);

      const types = await loadIssueTypes();

      expect(types).toEqual(mockDomTypes);
      expect(getIssueTypesFromDOM).toHaveBeenCalled();
    });
  });
});
