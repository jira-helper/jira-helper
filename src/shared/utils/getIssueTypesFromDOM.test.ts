import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getIssueTypesFromDOM } from './getIssueTypesFromDOM';

describe('getIssueTypesFromDOM', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should extract issue types from DOM cards', () => {
    document.body.innerHTML = `
      <div class="ghx-issue">
        <div class="ghx-type" title="Task"></div>
      </div>
      <div class="ghx-issue">
        <div class="ghx-type" title="Bug"></div>
      </div>
      <div class="ghx-issue">
        <div class="ghx-type" title="Story"></div>
      </div>
    `;

    const types = getIssueTypesFromDOM();

    expect(types).toContain('Task');
    expect(types).toContain('Bug');
    expect(types).toContain('Story');
    expect(types.length).toBe(3);
  });

  it('should return sorted types', () => {
    document.body.innerHTML = `
      <div class="ghx-issue">
        <div class="ghx-type" title="Zebra"></div>
      </div>
      <div class="ghx-issue">
        <div class="ghx-type" title="Apple"></div>
      </div>
      <div class="ghx-issue">
        <div class="ghx-type" title="Banana"></div>
      </div>
    `;

    const types = getIssueTypesFromDOM();

    expect(types).toEqual(['Apple', 'Banana', 'Zebra']);
  });

  it('should handle types with colon in title (Russian format)', () => {
    document.body.innerHTML = `
      <div class="ghx-issue">
        <div class="ghx-type" title="Тип запроса: Idea"></div>
      </div>
      <div class="ghx-issue">
        <div class="ghx-type" title="Тип запроса: Task"></div>
      </div>
    `;

    const types = getIssueTypesFromDOM();

    expect(types).toContain('Idea');
    expect(types).toContain('Task');
    expect(types.length).toBe(2);
  });

  it('should deduplicate issue types', () => {
    document.body.innerHTML = `
      <div class="ghx-issue">
        <div class="ghx-type" title="Task"></div>
      </div>
      <div class="ghx-issue">
        <div class="ghx-type" title="Task"></div>
      </div>
      <div class="ghx-issue">
        <div class="ghx-type" title="Bug"></div>
      </div>
    `;

    const types = getIssueTypesFromDOM();

    expect(types).toEqual(['Bug', 'Task']);
    expect(types.length).toBe(2);
  });

  it('should return empty array when no issue types found', () => {
    document.body.innerHTML = '<div class="ghx-issue"></div>';

    const types = getIssueTypesFromDOM();

    expect(types).toEqual([]);
  });

  it('should ignore issues without title attribute', () => {
    document.body.innerHTML = `
      <div class="ghx-issue">
        <div class="ghx-type"></div>
      </div>
      <div class="ghx-issue">
        <div class="ghx-type" title="Task"></div>
      </div>
    `;

    const types = getIssueTypesFromDOM();

    expect(types).toEqual(['Task']);
  });

  it('should handle empty title attributes', () => {
    document.body.innerHTML = `
      <div class="ghx-issue">
        <div class="ghx-type" title=""></div>
      </div>
      <div class="ghx-issue">
        <div class="ghx-type" title="Task"></div>
      </div>
    `;

    const types = getIssueTypesFromDOM();

    expect(types).toEqual(['Task']);
  });

  it('should trim whitespace from type names', () => {
    document.body.innerHTML = `
      <div class="ghx-issue">
        <div class="ghx-type" title="  Task  "></div>
      </div>
      <div class="ghx-issue">
        <div class="ghx-type" title="Bug"></div>
      </div>
    `;

    const types = getIssueTypesFromDOM();

    expect(types).toContain('Task');
    expect(types).toContain('Bug');
  });
});
