/* eslint-disable local/no-inline-styles -- AntD Select option/tag composition needs small dynamic layout styles. */
import React, { useCallback, useRef, useState } from 'react';
import { Select, Spin, Tag } from 'antd';

const TagAvatar: React.FC<{ url: string; name: string }> = ({ url, name }) => {
  const [failed, setFailed] = useState(false);
  const letter = name ? name.charAt(0).toUpperCase() : '?';
  if (failed || !url) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#dfe1e6',
          color: '#42526e',
          fontSize: 9,
          fontWeight: 600,
          flexShrink: 0,
        }}
      >
        {letter}
      </span>
    );
  }
  return (
    <img src={url} alt="" width={16} height={16} style={{ borderRadius: '50%' }} onError={() => setFailed(true)} />
  );
};
import type { JiraUser } from 'src/infrastructure/jira/jiraApi';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export type SelectedJiraUser = {
  name: string;
  displayName: string;
  self: string;
};

export interface JiraUserSelectProps {
  value?: SelectedJiraUser | null;
  onChange?: (person: SelectedJiraUser | null) => void;
  searchUsers: (query: string) => Promise<JiraUser[]>;
  id?: string;
  placeholder?: string;
}

export const JiraUserSelect: React.FC<JiraUserSelectProps> = ({
  value,
  onChange,
  searchUsers,
  id,
  placeholder = 'Type to search users...',
}) => {
  const [options, setOptions] = useState<JiraUser[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback(
    (searchText: string) => {
      setError(null);
      setNoResults(false);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      if (searchText.length < MIN_QUERY_LENGTH) {
        setOptions([]);
        setFetching(false);
        return;
      }

      setFetching(true);

      debounceTimer.current = setTimeout(async () => {
        try {
          const users = await searchUsers(searchText);
          setOptions(users);
          setNoResults(users.length === 0);
        } catch {
          setError('Search failed, try again');
          setOptions([]);
        } finally {
          setFetching(false);
        }
      }, DEBOUNCE_MS);
    },
    [searchUsers]
  );

  const handleSelect = useCallback(
    (value: unknown, option: Record<string, unknown>) => {
      const userName = (option?.key ||
        option?.value ||
        (option?.props as Record<string, unknown> | undefined)?.key ||
        (option?.props as Record<string, unknown> | undefined)?.value ||
        value) as string | undefined;
      const user = typeof userName === 'string' ? options.find(u => u.name === userName) : undefined;
      if (user && onChange) {
        onChange({
          name: user.name,
          displayName: user.displayName,
          self: user.self,
        });
      }
    },
    [options, onChange]
  );

  const handleClear = useCallback(() => {
    onChange?.(null);
    setOptions([]);
    setNoResults(false);
    setError(null);
  }, [onChange]);

  const selectValue = value ? { value: value.name, label: value.displayName || value.name } : undefined;

  const notFoundContent = (() => {
    if (fetching) return <Spin size="small" />;
    if (error) return <span style={{ color: '#ff4d4f' }}>{error}</span>;
    if (noResults) return <span>No users found</span>;
    return null;
  })();

  return (
    <Select
      id={id}
      showSearch
      allowClear
      labelInValue
      filterOption={false}
      placeholder={placeholder}
      value={selectValue}
      onSearch={handleSearch}
      onSelect={handleSelect}
      onClear={handleClear}
      notFoundContent={notFoundContent}
      loading={fetching}
      style={{ width: '100%' }}
    >
      {options.map(user => (
        <Select.Option key={user.name} value={user.name}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TagAvatar url={user.avatarUrls?.['16x16'] || user.avatarUrls?.['32x32'] || ''} name={user.displayName} />
              <span>{user.displayName}</span>
            </div>
          </Select.Option>
        ))}
      </Select>
  );
};

export interface MultiJiraUserSelectProps {
  values?: SelectedJiraUser[];
  onChange?: (persons: SelectedJiraUser[]) => void;
  searchUsers: (query: string) => Promise<JiraUser[]>;
  buildAvatarUrl?: (login: string) => string;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
  'aria-describedby'?: string;
}

export const MultiJiraUserSelect: React.FC<MultiJiraUserSelectProps> = ({
  values = [],
  onChange,
  searchUsers,
  buildAvatarUrl,
  disabled = false,
  id,
  placeholder = 'Type to search users...',
  'aria-describedby': ariaDescribedBy,
}) => {
  const [options, setOptions] = useState<JiraUser[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetSearchState = useCallback(() => {
    setSearchValue('');
    setOptions([]);
    setNoResults(false);
    setError(null);
    setFetching(false);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
  }, []);

  const handleSearch = useCallback(
    (searchText: string) => {
      setSearchValue(searchText);
      setError(null);
      setNoResults(false);

      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      if (searchText.length < MIN_QUERY_LENGTH) {
        setOptions([]);
        setFetching(false);
        return;
      }

      setFetching(true);

      debounceTimer.current = setTimeout(async () => {
        try {
          const users = await searchUsers(searchText);
          setOptions(users);
          setNoResults(users.length === 0);
        } catch {
          setError('Search failed, try again');
          setOptions([]);
        } finally {
          setFetching(false);
        }
      }, DEBOUNCE_MS);
    },
    [searchUsers]
  );

  function extractDisplayName(option: Record<string, unknown>): string | undefined {
    const children = option?.children;
    if (children && typeof children === 'object' && 'props' in (children as any)) {
      const { props } = children as any;
      if (props?.children && Array.isArray(props.children)) {
        for (const child of props.children) {
          if (child?.type === 'span' && child?.props?.children) {
            return String(child.props.children);
          }
        }
      }
      if (typeof props?.children === 'string') return props.children;
    }
    return undefined;
  }

  const handleSelect = useCallback(
    (_value: unknown, _option: Record<string, unknown>) => {
      const displayName = extractDisplayName(_option);
      let user: JiraUser | undefined;
      if (displayName) {
        user = options.find(u => u.displayName === displayName || u.name === displayName);
      }
      if (!user && options.length === 1) {
        user = options[0];
      }
      if (user && onChange) {
        const newPerson: SelectedJiraUser = {
          name: user.name,
          displayName: user.displayName,
          self: user.self,
        };
        if (!values.some(v => v.name === newPerson.name)) {
          onChange([...values, newPerson]);
        }
      }
      resetSearchState();
    },
    [options, onChange, values, resetSearchState]
  );

  const handleRemove = useCallback(
    (nameToRemove: string) => {
      onChange?.(values.filter(v => v.name !== nameToRemove));
    },
    [onChange, values]
  );

  const notFoundContent = (() => {
    if (fetching) return <Spin size="small" />;
    if (error) return <span style={{ color: '#ff4d4f' }}>{error}</span>;
    if (noResults) return <span>No users found</span>;
    return null;
  })();

  return (
    <div>
      <Select
        id={id}
        aria-describedby={ariaDescribedBy}
        showSearch
        disabled={disabled}
        filterOption={false}
        placeholder={placeholder}
        value={null}
        searchValue={searchValue}
        onSearch={handleSearch}
        onSelect={handleSelect}
        notFoundContent={notFoundContent}
        loading={fetching}
        style={{ width: '100%' }}
      >
        {options.map(user => (
          <Select.Option key={user.name} value={user.name}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TagAvatar url={user.avatarUrls?.['16x16'] || user.avatarUrls?.['32x32'] || ''} name={user.displayName} />
              <span>{user.displayName}</span>
            </div>
          </Select.Option>
        ))}
      </Select>
      {values.length > 0 && (
        <div data-testid="multi-person-selected" style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {values.map(person => (
            <Tag
              key={person.name}
              closable
              onClose={() => handleRemove(person.name)}
              data-person-name={person.name}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, paddingInlineStart: 4 }}
            >
              {buildAvatarUrl && (
                <TagAvatar url={buildAvatarUrl(person.name)} name={person.displayName || person.name} />
              )}
              <span>{person.displayName || person.name}</span>
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
};

export const PersonNameSelect = JiraUserSelect;
export const MultiPersonSelect = MultiJiraUserSelect;
