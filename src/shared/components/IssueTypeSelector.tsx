/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useDi } from 'src/infrastructure/di/diContext';
import { routingServiceToken } from 'src/infrastructure/routing';
import { issueTypeServiceToken } from '../issueType';
import { debounce } from '../utils';
import type { ProjectIssueType } from 'src/infrastructure/jira/jiraApi';

export interface IssueTypeSelectorTexts {
  countAllIssueTypes: string;
  selectedIssueTypes: string;
  projectKeyHint: string;
  projectKeyLabel: string;
  projectKeyPlaceholder: string;
  loadingIssueTypes: string;
  issueTypesFromProject: string;
  selectTypesHint: string;
  noIssueTypesFound: string;
  enterProjectKey: string;
  noTypesForProject: string;
  failedToLoadTypes: string;
  subtask: string;
  remove: string;
}

const DEFAULT_TEXTS: IssueTypeSelectorTexts = {
  countAllIssueTypes: 'Count all issue types',
  selectedIssueTypes: 'Selected issue types:',
  projectKeyHint: 'Enter project key to load issue types (auto-loads after typing):',
  projectKeyLabel: 'Project Key:',
  projectKeyPlaceholder: 'Enter project key (e.g., PROJ)',
  loadingIssueTypes: 'Loading issue types...',
  issueTypesFromProject: 'Issue types from project',
  selectTypesHint: 'Select types from this project to add to your selection above',
  noIssueTypesFound: 'No issue types found. Click "Load Types" to fetch types for project',
  enterProjectKey: 'Please enter a project key',
  noTypesForProject: 'No issue types found for project',
  failedToLoadTypes: 'Failed to load issue types',
  subtask: 'Subtask',
  remove: 'Remove',
};

interface IssueTypeSelectorProps {
  groupId: string;
  selectedTypes: string[];
  onSelectionChange: (selectedTypes: string[], countAllTypes: boolean) => void;
  initialCountAllTypes?: boolean;
  initialProjectKey?: string;
  texts?: IssueTypeSelectorTexts;
}

export const IssueTypeSelector: React.FC<IssueTypeSelectorProps> = ({
  groupId,
  selectedTypes: initialSelectedTypes,
  onSelectionChange,
  initialCountAllTypes = true,
  initialProjectKey = '',
  texts: propTexts,
}) => {
  const texts = propTexts ?? DEFAULT_TEXTS;
  const textsRef = useRef(texts);
  textsRef.current = texts;
  const container = useDi();
  const [countAllTypes, setCountAllTypes] = useState(initialCountAllTypes);
  const [projectKey, setProjectKey] = useState(
    initialProjectKey || container.inject(routingServiceToken).getProjectKeyFromURL() || ''
  );
  const [currentProjectTypes, setCurrentProjectTypes] = useState<ProjectIssueType[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(initialSelectedTypes);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if we should auto-load on mount
  const shouldAutoLoadRef = useRef(!countAllTypes && projectKey);

  // Track if this is the first render to avoid calling onSelectionChange on mount
  const isFirstRenderRef = useRef(true);

  // Track previous values to avoid unnecessary calls
  const prevSelectedTypesRef = useRef<string[]>(initialSelectedTypes);
  const prevCountAllTypesRef = useRef<boolean>(initialCountAllTypes);

  // Sync with parent props when they change (for controlled behavior)
  useEffect(() => {
    setCountAllTypes(initialCountAllTypes);
  }, [initialCountAllTypes]);

  useEffect(() => {
    setSelectedTypes(initialSelectedTypes);
  }, [initialSelectedTypes]);

  // Notify parent about selection changes (but not on first render)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      prevSelectedTypesRef.current = selectedTypes;
      prevCountAllTypesRef.current = countAllTypes;
      return;
    }

    // Only call if values actually changed
    const selectedTypesChanged =
      selectedTypes.length !== prevSelectedTypesRef.current.length ||
      selectedTypes.some((type, idx) => type !== prevSelectedTypesRef.current[idx]);
    const countAllTypesChanged = countAllTypes !== prevCountAllTypesRef.current;

    if (selectedTypesChanged || countAllTypesChanged) {
      prevSelectedTypesRef.current = selectedTypes;
      prevCountAllTypesRef.current = countAllTypes;
      onSelectionChange(selectedTypes, countAllTypes);
    }
  }, [selectedTypes, countAllTypes, onSelectionChange]);

  // Load types function with useCallback to maintain stable reference
  const loadTypes = useCallback(async (key: string) => {
    const t = textsRef.current;
    if (!key.trim()) {
      setError(t.enterProjectKey);
      setCurrentProjectTypes([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const types = await container.inject(issueTypeServiceToken).loadForProject(key.trim());
      setCurrentProjectTypes(types);
      if (types.length === 0) {
        setError(`${t.noTypesForProject} "${key}"`);
      }
    } catch (err) {
      setError(`${t.failedToLoadTypes}: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setCurrentProjectTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced load function using useRef to persist across renders
  const debouncedLoadTypesRef = useRef(debounce(loadTypes, 500));

  // Update the debounced function when loadTypes changes
  useEffect(() => {
    debouncedLoadTypesRef.current = debounce(loadTypes, 500);
  }, [loadTypes]);

  // Auto-load types on mount if project key is available
  useEffect(() => {
    if (shouldAutoLoadRef.current && !countAllTypes && projectKey) {
      debouncedLoadTypesRef.current(projectKey);
      shouldAutoLoadRef.current = false;
    }
  }, []);

  const handleCountAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setCountAllTypes(newValue);
    if (newValue) {
      // Clear selection when enabling "count all"
      setSelectedTypes([]);
    }
  };

  const handleProjectKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKey = e.target.value;
    setProjectKey(newKey);
    setError(null);

    // Clear current project types (but keep selected types)
    setCurrentProjectTypes([]);

    // Debounced load
    if (newKey.trim()) {
      debouncedLoadTypesRef.current(newKey);
    } else {
      setCurrentProjectTypes([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleTypeCheckboxChange = (typeName: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes(prev => (prev.includes(typeName) ? prev : [...prev, typeName]));
    } else {
      setSelectedTypes(prev => prev.filter(t => t !== typeName));
    }
  };

  const handleRemoveSelectedType = (typeName: string) => {
    setSelectedTypes(prev => prev.filter(t => t !== typeName));
  };

  return (
    <div style={{ marginTop: 0, paddingTop: 0 }}>
      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', minHeight: 32 }}>
          <input
            type="checkbox"
            checked={countAllTypes}
            onChange={handleCountAllChange}
            style={{ marginRight: '8px' }}
          />
          <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{texts.countAllIssueTypes}</span>
        </label>
      </div>

      {!countAllTypes && (
        <div>
          {/* Selected types chips above input */}
          {selectedTypes.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '13px' }}>{texts.selectedIssueTypes}</div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  padding: '8px',
                  background: '#f4f5f7',
                  border: '1px solid #dfe1e6',
                  borderRadius: '3px',
                  minHeight: '40px',
                }}
              >
                {selectedTypes.map(typeName => (
                  <span
                    key={typeName}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 8px',
                      background: '#fff',
                      border: '1px solid #dfe1e6',
                      borderRadius: '3px',
                      fontSize: '12px',
                      color: '#172b4d',
                    }}
                  >
                    {typeName}
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedType(typeName)}
                      style={{
                        marginLeft: '6px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#5e6c84',
                        fontSize: '14px',
                        lineHeight: '1',
                        padding: '0',
                        width: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title={texts.remove}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#5e6c84' }}>{texts.projectKeyHint}</div>

          <div className="field-group" style={{ marginBottom: '8px' }}>
            <label
              htmlFor={`project-input-${groupId}`}
              style={{ display: 'block', marginBottom: '4px', fontWeight: 600 }}
            >
              {texts.projectKeyLabel}
            </label>
            <input
              type="text"
              id={`project-input-${groupId}`}
              className="text medium-field"
              value={projectKey}
              onChange={handleProjectKeyChange}
              onKeyPress={handleKeyPress}
              placeholder={texts.projectKeyPlaceholder}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #dfe1e6',
                borderRadius: '3px',
              }}
            />
          </div>

          {error && (
            <div
              style={{
                padding: '8px',
                background: '#fff4e6',
                border: '1px solid #ffab00',
                borderRadius: '3px',
                color: '#bf2600',
                fontSize: '12px',
                marginBottom: '8px',
              }}
            >
              {error}
            </div>
          )}

          {isLoading && (
            <div style={{ padding: '12px', textAlign: 'center', color: '#5e6c84', fontSize: '13px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '16px',
                  height: '16px',
                  border: '2px solid #dfe1e6',
                  borderTopColor: '#0052cc',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  marginRight: '8px',
                }}
              />
              {texts.loadingIssueTypes}
              <style>
                {`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}
              </style>
            </div>
          )}

          {currentProjectTypes.length > 0 && !isLoading && (
            <div>
              <div style={{ fontWeight: 600, marginBottom: '8px', fontSize: '13px' }}>
                {texts.issueTypesFromProject} "{projectKey}":
              </div>
              <div
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid #dfe1e6',
                  borderRadius: '3px',
                  padding: '8px',
                  background: '#fff',
                }}
              >
                {currentProjectTypes.map(type => (
                  <label key={type.id} style={{ display: 'block', margin: '4px 0', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      value={type.name}
                      checked={selectedTypes.includes(type.name)}
                      onChange={e => handleTypeCheckboxChange(type.name, e.target.checked)}
                      style={{ marginRight: '6px' }}
                    />
                    {type.name}{' '}
                    {type.subtask && <span style={{ color: '#5e6c84', fontSize: '11px' }}>({texts.subtask})</span>}
                  </label>
                ))}
              </div>
              <div style={{ marginTop: '4px', fontSize: '11px', color: '#5e6c84' }}>{texts.selectTypesHint}</div>
            </div>
          )}

          {currentProjectTypes.length === 0 && projectKey && !isLoading && !error && (
            <div
              style={{ padding: '8px', background: '#f4f5f7', borderRadius: '3px', fontSize: '12px', color: '#5e6c84' }}
            >
              {texts.noIssueTypesFound} "{projectKey}".
            </div>
          )}
        </div>
      )}
    </div>
  );
};
