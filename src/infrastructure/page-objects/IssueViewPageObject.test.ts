import { describe, it, expect, beforeEach } from 'vitest';
import { IssueViewPageObject } from './IssueViewPageObject';

describe('IssueViewPageObject', () => {
  let pageObject: IssueViewPageObject;

  beforeEach(() => {
    pageObject = new IssueViewPageObject();
    document.body.innerHTML = '';
  });

  describe('selectors', () => {
    it('exposes Jira issue view selectors', () => {
      expect(pageObject.selectors.detailsBlock).toBe('#details-module');
      expect(pageObject.selectors.attachmentModule).toBe('#attachmentmodule');
      expect(pageObject.selectors.issueType).toBe('#type-val');
    });
  });

  describe('getIssueType', () => {
    it('returns issue type from #type-val textContent', () => {
      const typeVal = document.createElement('span');
      typeVal.id = 'type-val';
      typeVal.textContent = '  Story  ';
      document.body.appendChild(typeVal);

      expect(pageObject.getIssueType()).toBe('Story');
    });

    it('returns null when #type-val is not present', () => {
      expect(pageObject.getIssueType()).toBeNull();
    });

    it('returns null when #type-val has empty text', () => {
      const typeVal = document.createElement('span');
      typeVal.id = 'type-val';
      typeVal.textContent = '   ';
      document.body.appendChild(typeVal);

      expect(pageObject.getIssueType()).toBeNull();
    });
  });

  describe('addSectionInMainFlow', () => {
    it('creates container after #attachmentmodule', () => {
      const attach = document.createElement('div');
      attach.id = 'attachmentmodule';
      document.body.appendChild(attach);

      const container = pageObject.addSectionInMainFlow('gantt-chart');

      expect(container).not.toBeNull();
      const section = document.querySelector('[data-jh-section="gantt-chart"]');
      expect(section).not.toBeNull();
      expect(attach.nextElementSibling).toBe(section);
    });

    it('falls back to after #details-module when #attachmentmodule is absent', () => {
      const details = document.createElement('div');
      details.id = 'details-module';
      document.body.appendChild(details);

      const container = pageObject.addSectionInMainFlow('gantt-chart');

      expect(container).not.toBeNull();
      expect(details.nextElementSibling?.getAttribute('data-jh-section')).toBe('gantt-chart');
    });

    it('returns null when no anchor exists', () => {
      expect(pageObject.addSectionInMainFlow('gantt-chart')).toBeNull();
    });

    it('returns existing container if section already exists', () => {
      const attach = document.createElement('div');
      attach.id = 'attachmentmodule';
      document.body.appendChild(attach);

      const first = pageObject.addSectionInMainFlow('gantt-chart');
      const second = pageObject.addSectionInMainFlow('gantt-chart');

      expect(first).toBe(second);
      expect(document.querySelectorAll('[data-jh-section="gantt-chart"]')).toHaveLength(1);
    });
  });

  describe('removeSectionInMainFlow', () => {
    it('removes the section from DOM', () => {
      const attach = document.createElement('div');
      attach.id = 'attachmentmodule';
      document.body.appendChild(attach);
      pageObject.addSectionInMainFlow('gantt-chart');

      pageObject.removeSectionInMainFlow('gantt-chart');

      expect(document.querySelector('[data-jh-section="gantt-chart"]')).toBeNull();
    });
  });

  describe('insertToolbarButton', () => {
    it('appends host to .aui-toolbar2-secondary', () => {
      const toolbar = document.createElement('div');
      toolbar.className = 'aui-toolbar2-secondary';
      document.body.appendChild(toolbar);

      const host = pageObject.insertToolbarButton();

      expect(host).not.toBeNull();
      expect(host?.getAttribute('data-jh-component')).toBe('issueSettingsHost');
      expect(toolbar.lastElementChild).toBe(host);
    });

    it('returns existing host on repeat call', () => {
      const toolbar = document.createElement('div');
      toolbar.className = 'aui-toolbar2-secondary';
      document.body.appendChild(toolbar);

      const first = pageObject.insertToolbarButton();
      const second = pageObject.insertToolbarButton();

      expect(first).toBe(second);
      expect(toolbar.querySelectorAll('[data-jh-component="issueSettingsHost"]')).toHaveLength(1);
    });

    it('returns null when toolbar is absent', () => {
      expect(pageObject.insertToolbarButton()).toBeNull();
    });
  });

  describe('removeToolbarButton', () => {
    it('removes the toolbar button host', () => {
      const toolbar = document.createElement('div');
      toolbar.className = 'aui-toolbar2-secondary';
      document.body.appendChild(toolbar);
      pageObject.insertToolbarButton();

      pageObject.removeToolbarButton();

      expect(document.querySelector('[data-jh-component="issueSettingsHost"]')).toBeNull();
    });
  });
});
