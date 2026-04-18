import React, { useState, useRef, useCallback } from 'react';
import { Select, Spin } from 'antd';
import type { JiraUser } from 'src/shared/jiraApi';
import type { SelectedPerson } from '../state/types';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export interface PersonNameSelectProps {
  value?: SelectedPerson | null;
  onChange?: (person: SelectedPerson | null) => void;
  searchUsers: (query: string) => Promise<JiraUser[]>;
  id?: string;
  placeholder?: string;
}

export const PersonNameSelect: React.FC<PersonNameSelectProps> = ({
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
    (_: unknown, option: any) => {
      const user = options.find(u => u.name === option.key);
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
            <img
              src={user.avatarUrls?.['16x16'] || user.avatarUrls?.['32x32'] || ''}
              alt=""
              width={16}
              height={16}
              style={{ borderRadius: '50%' }}
            />
            <span>{user.displayName}</span>
            <span style={{ color: '#999', fontSize: '0.85em' }}>{user.name}</span>
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};
