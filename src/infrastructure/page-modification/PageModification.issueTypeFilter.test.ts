import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PageModification } from './PageModification';

// Create a test class that extends PageModification to test protected methods
class TestPageModification extends PageModification {
  public testGetIssueTypeFromCard(card: Element): string | null {
    return this.getIssueTypeFromCard(card);
  }

  public testShouldCountIssue(card: Element, includedIssueTypes?: string[]): boolean {
    return this.shouldCountIssue(card, includedIssueTypes);
  }
}

describe('PageModification - Issue Type Filtering', () => {
  let instance: TestPageModification;

  beforeEach(() => {
    instance = new TestPageModification();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('getIssueTypeFromCard', () => {
    it('should extract issue type from card with title attribute', () => {
      document.body.innerHTML = `
        <div class="ghx-issue">
          <div class="ghx-type" title="Task"></div>
        </div>
      `;

      const card = document.querySelector('.ghx-issue')!;
      const type = instance.testGetIssueTypeFromCard(card);

      expect(type).toBe('Task');
    });

    it('should extract type from title with colon (Russian format)', () => {
      document.body.innerHTML = `
        <div class="ghx-issue">
          <div class="ghx-type" title="Тип запроса: Idea"></div>
        </div>
      `;

      const card = document.querySelector('.ghx-issue')!;
      const type = instance.testGetIssueTypeFromCard(card);

      expect(type).toBe('Idea');
    });

    it('should return null when type element is missing', () => {
      document.body.innerHTML = `
        <div class="ghx-issue">
          <div>No type element</div>
        </div>
      `;

      const card = document.querySelector('.ghx-issue')!;
      const type = instance.testGetIssueTypeFromCard(card);

      expect(type).toBeNull();
    });

    it('should return null when title attribute is missing', () => {
      document.body.innerHTML = `
        <div class="ghx-issue">
          <div class="ghx-type"></div>
        </div>
      `;

      const card = document.querySelector('.ghx-issue')!;
      const type = instance.testGetIssueTypeFromCard(card);

      expect(type).toBeNull();
    });

    it('should trim whitespace from type name', () => {
      document.body.innerHTML = `
        <div class="ghx-issue">
          <div class="ghx-type" title="  Bug  "></div>
        </div>
      `;

      const card = document.querySelector('.ghx-issue')!;
      const type = instance.testGetIssueTypeFromCard(card);

      expect(type).toBe('Bug');
    });

    it('should handle empty title after colon', () => {
      document.body.innerHTML = `
        <div class="ghx-issue">
          <div class="ghx-type" title="Type: "></div>
        </div>
      `;

      const card = document.querySelector('.ghx-issue')!;
      const type = instance.testGetIssueTypeFromCard(card);

      expect(type).toBeNull();
    });
  });

  describe('shouldCountIssue', () => {
    it('should return true when no filter is set', () => {
      document.body.innerHTML = `
        <div class="ghx-issue">
          <div class="ghx-type" title="Task"></div>
        </div>
      `;

      const card = document.querySelector('.ghx-issue')!;
      const shouldCount = instance.testShouldCountIssue(card);

      expect(shouldCount).toBe(true);
    });

    it('should return true when includedIssueTypes is empty array', () => {
      document.body.innerHTML = `
        <div class="ghx-issue">
          <div class="ghx-type" title="Task"></div>
        </div>
      `;

      const card = document.querySelector('.ghx-issue')!;
      const shouldCount = instance.testShouldCountIssue(card, []);

      expect(shouldCount).toBe(true);
    });

    it('should return true when issue type is in included list', () => {
      document.body.innerHTML = `
        <div class="ghx-issue">
          <div class="ghx-type" title="Task"></div>
        </div>
      `;

      const card = document.querySelector('.ghx-issue')!;
      const shouldCount = instance.testShouldCountIssue(card, ['Task', 'Bug']);

      expect(shouldCount).toBe(true);
    });

    it('should return false when issue type is not in included list', () => {
      document.body.innerHTML = `
        <div class="ghx-issue">
          <div class="ghx-type" title="Story"></div>
        </div>
      `;

      const card = document.querySelector('.ghx-issue')!;
      const shouldCount = instance.testShouldCountIssue(card, ['Task', 'Bug']);

      expect(shouldCount).toBe(false);
    });

    it('should return false when issue has no type', () => {
      document.body.innerHTML = `
        <div class="ghx-issue">
          <div>No type</div>
        </div>
      `;

      const card = document.querySelector('.ghx-issue')!;
      const shouldCount = instance.testShouldCountIssue(card, ['Task', 'Bug']);

      expect(shouldCount).toBe(false);
    });

    it('should handle multiple types correctly', () => {
      document.body.innerHTML = `
        <div class="ghx-issue">
          <div class="ghx-type" title="Task"></div>
        </div>
      `;

      const card = document.querySelector('.ghx-issue')!;
      const shouldCount1 = instance.testShouldCountIssue(card, ['Task']);
      const shouldCount2 = instance.testShouldCountIssue(card, ['Bug', 'Story']);

      expect(shouldCount1).toBe(true);
      expect(shouldCount2).toBe(false);
    });

    it('should be case-sensitive in type matching', () => {
      document.body.innerHTML = `
        <div class="ghx-issue">
          <div class="ghx-type" title="Task"></div>
        </div>
      `;

      const card = document.querySelector('.ghx-issue')!;
      const shouldCount = instance.testShouldCountIssue(card, ['task']); // lowercase

      expect(shouldCount).toBe(false);
    });
  });
});
