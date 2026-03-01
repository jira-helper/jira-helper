import { globalContainer } from 'dioma';
import { getProjectIssueTypesToken } from '../di/jiraApiTokens';
import type { ProjectIssueType } from '../jiraApi';
import { getIssueTypesFromDOM } from './getIssueTypesFromDOM';
import { getProjectKeyFromURL } from './getProjectKeyFromURL';

// In-memory cache for issue types by project key (scoped to current tab)
const issueTypesCache: Map<string, ProjectIssueType[]> = new Map();

/**
 * Load issue types from API with caching
 */
export async function loadIssueTypesForProject(projectKey: string): Promise<ProjectIssueType[]> {
  // Check cache first
  if (issueTypesCache.has(projectKey)) {
    return issueTypesCache.get(projectKey)!;
  }

  try {
    const getProjectIssueTypes = globalContainer.inject(getProjectIssueTypesToken);
    const result = await getProjectIssueTypes(projectKey);
    if (!result.err) {
      const types = result.val;
      // Cache the result
      issueTypesCache.set(projectKey, types);
      return types;
    }
  } catch (error) {
    // eslint-disable-next-line no-console -- fallback logging when API fails
    console.warn('Failed to load issue types from API', error);
  }

  // Fallback to empty array if API fails
  return [];
}

/**
 * Clear cache for a specific project or all projects
 */
export function clearIssueTypesCache(projectKey?: string): void {
  if (projectKey) {
    issueTypesCache.delete(projectKey);
  } else {
    issueTypesCache.clear();
  }
}

/**
 * Load issue types with fallback to DOM
 */
export async function loadIssueTypes(): Promise<string[]> {
  const projectKey = getProjectKeyFromURL();
  if (projectKey) {
    const types = await loadIssueTypesForProject(projectKey);
    if (types.length > 0) {
      return types.map(t => t.name);
    }
  }

  // Fallback to DOM parsing
  return getIssueTypesFromDOM();
}

/**
 * Generate HTML for issue type selector with "count all types" checkbox and project input
 */
export function generateIssueTypeSelectorHTML(
  issueTypes: (ProjectIssueType | string)[] = [],
  selectedTypes: string[] = [],
  groupId: string = '',
  countAllTypes: boolean = true,
  projectKey: string = '',
  isLoading: boolean = false,
  error: string | null = null
): string {
  const normalizedIssueTypes: ProjectIssueType[] = issueTypes.map(type =>
    typeof type === 'string' ? { id: type, name: type, subtask: false } : type
  );

  const selectorId = `issue-type-selector-${groupId || 'default'}`;
  const projectInputId = `project-input-${groupId || 'default'}`;
  const loadBtnId = `load-types-btn-${groupId || 'default'}`;
  const typesContainerId = `types-container-${groupId || 'default'}`;

  return `
    <div id="${selectorId}" class="issue-type-selector-jh" style="margin-top: 10px;">
      <div style="margin-bottom: 12px;">
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input 
            type="checkbox" 
            id="count-all-types-${groupId || 'default'}"
            ${countAllTypes ? 'checked' : ''}
            style="margin-right: 8px;"
          />
          <span style="font-weight: 600;">Count all issue types</span>
        </label>
      </div>
      
      <div id="project-selector-${groupId || 'default'}" style="display: ${countAllTypes ? 'none' : 'block'}; margin-bottom: 12px;">
        <div class="field-group" style="margin-bottom: 8px;">
          <label for="${projectInputId}" style="display: block; margin-bottom: 4px; font-weight: 600;">
            Project Key:
          </label>
          <div style="display: flex; gap: 8px; align-items: center;">
            <input 
              type="text" 
              id="${projectInputId}"
              class="text medium-field"
              value="${projectKey}"
              placeholder="Enter project key (e.g., PROJ)"
              style="flex: 1; padding: 6px 8px; border: 1px solid #dfe1e6; border-radius: 3px;"
            />
            <button 
              type="button"
              id="${loadBtnId}"
              class="aui-button"
              style="white-space: nowrap;"
              ${isLoading ? 'disabled' : ''}
            >
              ${isLoading ? 'Loading...' : 'Load Types'}
            </button>
          </div>
        </div>
        
        ${
          error
            ? `
          <div style="padding: 8px; background: #fff4e6; border: 1px solid #ffab00; border-radius: 3px; color: #bf2600; font-size: 12px; margin-bottom: 8px;">
            ${error}
          </div>
        `
            : ''
        }
        
        ${
          isLoading
            ? `
          <div style="padding: 12px; text-align: center; color: #5e6c84; font-size: 13px;">
            <span style="display: inline-block; width: 16px; height: 16px; border: 2px solid #dfe1e6; border-top-color: #0052cc; border-radius: 50%; animation: spin 0.8s linear infinite; margin-right: 8px;"></span>
            Loading issue types...
          </div>
          <style>
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          </style>
        `
            : ''
        }
        
        <div id="${typesContainerId}" style="display: ${normalizedIssueTypes.length > 0 && !isLoading ? 'block' : 'none'};">
          ${
            normalizedIssueTypes.length > 0
              ? `
            <div style="font-weight: 600; margin-bottom: 8px; font-size: 13px;">Issue types to include:</div>
            <div style="max-height: 200px; overflow-y: auto; border: 1px solid #dfe1e6; border-radius: 3px; padding: 8px; background: #fff;">
              ${normalizedIssueTypes
                .map(
                  type => `
                  <label style="display: block; margin: 4px 0; cursor: pointer;">
                    <input 
                      type="checkbox" 
                      value="${type.name.replace(/"/g, '&quot;')}" 
                      ${selectedTypes.includes(type.name) ? 'checked' : ''}
                      data-issue-type-selector="${groupId}"
                      style="margin-right: 6px;"
                    />
                    ${type.name} ${type.subtask ? '<span style="color: #5e6c84; font-size: 11px;">(Subtask)</span>' : ''}
                  </label>
                `
                )
                .join('')}
            </div>
            <div style="margin-top: 4px; font-size: 11px; color: #5e6c84;">
              Leave empty to count all issue types
            </div>
          `
              : normalizedIssueTypes.length === 0 && !isLoading
                ? `
            <div style="padding: 8px; background: #f4f5f7; border-radius: 3px; font-size: 12px; color: #5e6c84;">
              No issue types found. If you cannot load types from API, you can manually enter types.
            </div>
          `
                : ''
          }
        </div>
      </div>
    </div>
  `;
}

/**
 * Get selected issue types from selector
 */
export function getSelectedIssueTypes(container: Element, groupId: string = ''): string[] {
  const selector = groupId ? `input[data-issue-type-selector="${groupId}"]:checked` : 'input[type="checkbox"]:checked';
  const checkedBoxes = container.querySelectorAll<HTMLInputElement>(selector);
  return Array.from(checkedBoxes).map(box => box.value);
}

/**
 * Check if "count all types" checkbox is checked
 */
export function isCountAllTypesChecked(container: Element, groupId: string = ''): boolean {
  const checkbox = container.querySelector(`#count-all-types-${groupId || 'default'}`) as HTMLInputElement;
  return checkbox ? checkbox.checked : true;
}

/**
 * Get project key from input
 */
export function getProjectKeyFromInput(container: Element, groupId: string = ''): string {
  const input = container.querySelector(`#project-input-${groupId || 'default'}`) as HTMLInputElement;
  return input ? input.value.trim() : '';
}

/**
 * Initialize issue type selector with event handlers
 */
export function initIssueTypeSelector(
  container: Element,
  groupId: string = '',
  onStateChange: (state: {
    countAllTypes: boolean;
    projectKey: string;
    selectedTypes: string[];
    issueTypes: ProjectIssueType[];
    isLoading: boolean;
    error: string | null;
  }) => void
): () => void {
  const selectorId = `issue-type-selector-${groupId || 'default'}`;
  const selectorElement = container.querySelector(`#${selectorId}`);
  if (!selectorElement) return () => {};

  const projectInputId = `project-input-${groupId || 'default'}`;
  const loadBtnId = `load-types-btn-${groupId || 'default'}`;
  const countAllCheckboxId = `count-all-types-${groupId || 'default'}`;
  const projectSelectorId = `project-selector-${groupId || 'default'}`;
  const typesContainerId = `types-container-${groupId || 'default'}`;

  let currentState = {
    countAllTypes: true,
    projectKey: '',
    selectedTypes: [] as string[],
    issueTypes: [] as ProjectIssueType[],
    isLoading: false,
    error: null as string | null,
  };

  const updateState = (updates: Partial<typeof currentState>) => {
    currentState = { ...currentState, ...updates };
    onStateChange(currentState);
  };

  const loadIssueTypes = async (projectKey: string) => {
    if (!projectKey) {
      updateState({ error: 'Please enter a project key', isLoading: false });
      return;
    }

    updateState({ isLoading: true, error: null });

    try {
      const types = await loadIssueTypesForProject(projectKey);
      updateState({
        issueTypes: types,
        isLoading: false,
        error: types.length === 0 ? `No issue types found for project "${projectKey}"` : null,
      });

      // Show types container
      const typesContainer = selectorElement.querySelector(`#${typesContainerId}`) as HTMLElement;
      if (typesContainer) {
        typesContainer.style.display = types.length > 0 ? 'block' : 'block';
      }
    } catch (error) {
      updateState({
        isLoading: false,
        error: `Failed to load issue types: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  };

  // Handle "count all types" checkbox
  const countAllCheckbox = selectorElement.querySelector(`#${countAllCheckboxId}`) as HTMLInputElement;
  let handleCountAllChange: (() => void) | null = null;
  if (countAllCheckbox) {
    handleCountAllChange = () => {
      const countAllTypes = countAllCheckbox.checked;
      const projectSelector = selectorElement.querySelector(`#${projectSelectorId}`) as HTMLElement;
      if (projectSelector) {
        projectSelector.style.display = countAllTypes ? 'none' : 'block';
      }
      updateState({ countAllTypes });
    };
    countAllCheckbox.addEventListener('change', handleCountAllChange);
  }

  // Handle load button and Enter key - declared here for cleanup scope
  const loadBtn = selectorElement.querySelector(`#${loadBtnId}`) as HTMLButtonElement;
  const projectInput = selectorElement.querySelector(`#${projectInputId}`) as HTMLInputElement;
  const handleLoadClick = () => {
    if (projectInput) {
      const projectKey = projectInput.value.trim();
      updateState({ projectKey });
      loadIssueTypes(projectKey);
    }
  };
  const handleInputKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (projectInput) {
        const projectKey = projectInput.value.trim();
        updateState({ projectKey });
        loadIssueTypes(projectKey);
      }
    }
  };
  if (loadBtn) {
    loadBtn.addEventListener('click', handleLoadClick);
  }
  if (projectInput) {
    projectInput.addEventListener('keypress', handleInputKeyPress);
  }

  // Handle checkbox changes for issue types
  const handleTypeCheckboxChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.type === 'checkbox' && target.hasAttribute('data-issue-type-selector')) {
      const selectedTypes = getSelectedIssueTypes(selectorElement, groupId);
      updateState({ selectedTypes });
    }
  };
  selectorElement.addEventListener('change', handleTypeCheckboxChange);

  // Try to load from current URL project key if available
  const currentProjectKey = getProjectKeyFromURL();
  if (currentProjectKey && projectInput) {
    projectInput.value = currentProjectKey;
    updateState({ projectKey: currentProjectKey });
    // Auto-load if checkbox is unchecked
    if (countAllCheckbox && !countAllCheckbox.checked) {
      loadIssueTypes(currentProjectKey);
    }
  }

  return () => {
    // Cleanup
    if (countAllCheckbox && handleCountAllChange) {
      countAllCheckbox.removeEventListener('change', handleCountAllChange);
    }
    if (loadBtn) {
      loadBtn.removeEventListener('click', handleLoadClick);
    }
    if (projectInput) {
      projectInput.removeEventListener('keypress', handleInputKeyPress);
    }
    selectorElement.removeEventListener('change', handleTypeCheckboxChange);
  };
}
