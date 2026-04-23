# Multi-Person WIP Limits Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow creating a single WIP limit rule for multiple persons instead of separate rules per person.

**Architecture:** Change `PersonLimit.person` (single object) to `PersonLimit.persons` (array). Each person in the array renders their own avatar badge with per-person issue count but shared limit value. Settings UI changes to multi-select persons. Board rendering creates one avatar per person.

**Tech Stack:** TypeScript, React 18, Ant Design 5, Valtio, Vitest, Cypress

---

## File Structure

```
property/types.ts                    - PersonLimit type: person → persons
property/migrateProperty.ts          - Migration from v2.30 to v2.31
SettingsPage/state/types.ts          - FormData.person → FormData.persons
SettingsPage/models/SettingsUIModel.ts - Handle array of persons
SettingsPage/components/PersonNameSelect.tsx - Multi-select with badge display
SettingsPage/components/PersonalWipLimitTable.tsx - Display persons array
BoardPage/models/types.ts            - PersonLimitStats.person → persons
BoardPage/models/BoardRuntimeModel.ts - Iterate over persons array for matching
BoardPage/components/AvatarsContainer.tsx - Render one badge per person
BoardPage/utils/isPersonsIssue.ts     - Match assignee against persons array
BoardPage/utils/isPersonLimitAppliedToIssue.ts - Match assignee against persons array
```

---

## Task 1: Update property/types.ts

**Files:**
- Modify: `src/features/person-limits-module/property/types.ts`

- [ ] **Step 1: Add PersonLimit_2_31 type with persons array**

Add new type after PersonLimit_2_30:

```typescript
/**
 * PersonLimit v2.31 — persons field changed from single object to array.
 */
export type PersonLimit_2_31 = Omit<PersonLimit_2_30, 'person'> & {
  persons: Array<{ name: string; displayName?: string; self: string }>;
};

export type PersonWipLimitsProperty_2_31 = {
  limits: PersonLimit_2_31[];
};
```

- [ ] **Step 2: Update PersonLimit type alias**

Change PersonLimit to point to v2.31:

```typescript
// Before
export type PersonLimit = PersonLimit_2_30;

// After
export type PersonLimit = PersonLimit_2_31;
```

- [ ] **Step 3: Run typecheck**

Run: `npm run lint:typescript 2>&1 | head -50`
Expected: No errors related to PersonLimit

- [ ] **Step 4: Commit**

```bash
git add src/features/person-limits-module/property/types.ts
git commit -m "feat(person-limits): add v2.31 type with persons array"
```

---

## Task 2: Update property/migrateProperty.ts

**Files:**
- Modify: `src/features/person-limits-module/property/migrateProperty.ts`

- [ ] **Step 1: Add migration from v2.29/v2.30 to v2.31**

Add new migration function:

```typescript
/**
 * Migrates a single limit from v2.29/v2.30 to v2.31 format.
 * Converts single `person` object to `persons` array.
 * Idempotent — does not overwrite existing values.
 */
export function migratePersonLimitToLatest(
  limit: PersonLimit_2_29 | PersonLimit_2_30 | PersonLimit_2_31
): PersonLimit_2_31 {
  // Already migrated
  if ('persons' in limit) {
    return limit as PersonLimit_2_31;
  }

  // Convert from v2.29 or v2.30 (single person object)
  return {
    ...limit,
    persons: [limit.person],
    showAllPersonIssues: 'showAllPersonIssues' in limit ? limit.showAllPersonIssues : true,
  } as PersonLimit_2_31;
}

/**
 * Migrates PersonWipLimitsProperty to latest format (v2.31).
 */
export function migratePropertyToLatest(
  data: PersonWipLimitsProperty_2_29 | PersonWipLimitsProperty_2_30 | PersonWipLimitsProperty
): PersonWipLimitsProperty {
  return {
    limits: data.limits.map(migratePersonLimitToLatest),
  };
}
```

- [ ] **Step 2: Update existing migrateProperty to call new migration**

Change the existing `migrateProperty` function to:

```typescript
export function migrateProperty(data: PersonWipLimitsProperty_2_29 | PersonWipLimitsProperty): PersonWipLimitsProperty {
  return migratePropertyToLatest(data);
}
```

- [ ] **Step 3: Add tests for migration**

Add tests to `src/features/person-limits-module/property/migrateProperty.test.ts`:

```typescript
describe('migratePersonLimitToLatest', () => {
  it('should convert v2.29 limit with single person to persons array', () => {
    const v2_29: PersonLimit_2_29 = {
      id: 1,
      person: { name: 'alice', self: 'http://jira/alice' },
      limit: 5,
      columns: [],
      swimlanes: [],
    };
    const result = migratePersonLimitToLatest(v2_29);
    expect(result.persons).toEqual([{ name: 'alice', self: 'http://jira/alice' }]);
    expect(result.showAllPersonIssues).toBe(true);
  });

  it('should preserve v2.31 limit with persons array', () => {
    const v2_31: PersonLimit_2_31 = {
      id: 1,
      persons: [{ name: 'alice', self: 'http://jira/alice' }],
      limit: 5,
      columns: [],
      swimlanes: [],
      showAllPersonIssues: true,
    };
    const result = migratePersonLimitToLatest(v2_31);
    expect(result).toEqual(v2_31);
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/features/person-limits-module/property/migrateProperty.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/person-limits-module/property/migrateProperty.ts src/features/person-limits-module/property/migrateProperty.test.ts
git commit -m "feat(person-limits): add migration to v2.31 with persons array"
```

---

## Task 3: Update SettingsPage/state/types.ts

**Files:**
- Modify: `src/features/person-limits-module/SettingsPage/state/types.ts`

- [ ] **Step 1: Change FormData.person to FormData.persons**

Update the FormData type:

```typescript
/**
 * Form data structure — current state of the form.
 * `persons` holds the fully resolved Jira users selected via PersonNameSelect.
 */
export type FormData = {
  persons: SelectedPerson[];  // Changed from person: SelectedPerson | null
  limit: number;
  selectedColumns: string[];
  swimlanes: string[];
  includedIssueTypes?: string[];
  showAllPersonIssues?: boolean;
};
```

- [ ] **Step 2: Run typecheck**

Run: `npm run lint:typescript 2>&1 | head -50`
Expected: Errors in files that use `formData.person` — these are expected and will be fixed in subsequent tasks

- [ ] **Step 3: Commit**

```bash
git add src/features/person-limits-module/SettingsPage/state/types.ts
git commit -m "feat(person-limits): change FormData.person to FormData.persons array"
```

---

## Task 4: Update SettingsPage/models/SettingsUIModel.ts

**Files:**
- Modify: `src/features/person-limits-module/SettingsPage/models/SettingsUIModel.ts`

- [ ] **Step 1: Update setEditingId to handle persons array**

Change the setEditingId method:

```typescript
setEditingId(id: number | null): void {
  this.editingId = id;
  if (id !== null) {
    const limit = this.limits.find(l => l.id === id);
    if (limit) {
      const selectedColumns = limit.columns.length === 0 ? [] : limit.columns.map(c => String(c.id));
      const swimlanes = limit.swimlanes.length === 0 ? [] : limit.swimlanes.map(s => String(s.id ?? s.name));
      this.formData = {
        persons: limit.persons.map(p => ({
          name: p.name,
          displayName: p.displayName || p.name,
          self: p.self,
        })),
        limit: limit.limit,
        selectedColumns,
        swimlanes,
        includedIssueTypes: limit.includedIssueTypes,
        showAllPersonIssues: limit.showAllPersonIssues,
      };
    }
  } else {
    this.formData = null;
  }
}
```

- [ ] **Step 2: Update isDuplicate to handle persons array**

Change the isDuplicate method:

```typescript
isDuplicate(personNames: string[], columns: string[], swimlanes: string[], issueTypes?: string[]): boolean {
  return this.limits.some(l => {
    const nameMatch = l.persons.some(p => personNames.includes(p.name));

    const existingColIds = [...l.columns.map(c => c.id)].sort();
    const newColIds = [...columns].sort();
    const colMatch =
      existingColIds.length === newColIds.length && existingColIds.every((id, i) => id === newColIds[i]);

    const existingSwimIds = [...l.swimlanes.map(s => s.id)].sort();
    const newSwimIds = [...swimlanes].sort();
    const swimMatch =
      existingSwimIds.length === newSwimIds.length && existingSwimIds.every((id, i) => id === newSwimIds[i]);

    const existingTypes = [...(l.includedIssueTypes || [])].sort();
    const newTypes = [...(issueTypes || [])].sort();
    const typeMatch = existingTypes.length === newTypes.length && existingTypes.every((t, i) => t === newTypes[i]);

    return nameMatch && colMatch && swimMatch && typeMatch;
  });
}
```

Note: isDuplicate now checks if ANY person in the limit matches ANY person in the new input. This means a limit with persons [A, B] would be a "duplicate" when trying to add [A] or [B] alone. Consider if this is the desired behavior — alternatively, require ALL persons to match for duplicate detection.

- [ ] **Step 3: Run typecheck**

Run: `npm run lint:typescript 2>&1 | head -50`
Expected: Type errors in components that use SettingsUIModel — expected

- [ ] **Step 4: Run tests**

Run: `npm test -- src/features/person-limits-module/SettingsPage/models/SettingsUIModel.test.ts`
Expected: Some tests may fail due to person → persons change

- [ ] **Step 5: Commit**

```bash
git add src/features/person-limits-module/SettingsPage/models/SettingsUIModel.ts
git commit -m "feat(person-limits): update SettingsUIModel for persons array"
```

---

## Task 5: Update SettingsPage/components/PersonNameSelect.tsx

**Files:**
- Modify: `src/features/person-limits-module/SettingsPage/components/PersonNameSelect.tsx`

- [ ] **Step 1: Add multi-select support**

Add a new component for selecting multiple persons with badge display:

```typescript
import React, { useState, useRef, useCallback } from 'react';
import { Select, Spin, Tag } from 'antd';
import type { JiraUser } from 'src/infrastructure/jira/jiraApi';
import type { SelectedPerson } from '../state/types';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

export interface MultiPersonSelectProps {
  values?: SelectedPerson[];
  onChange?: (persons: SelectedPerson[]) => void;
  searchUsers: (query: string) => Promise<JiraUser[]>;
  id?: string;
  placeholder?: string;
}

export const MultiPersonSelect: React.FC<MultiPersonSelectProps> = ({
  values = [],
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
        const newPerson: SelectedPerson = {
          name: user.name,
          displayName: user.displayName,
          self: user.self,
        };
        if (!values.some(v => v.name === newPerson.name)) {
          onChange([...values, newPerson]);
        }
      }
    },
    [options, onChange, values]
  );

  const handleRemove = useCallback(
    (nameToRemove: string) => {
      if (onChange) {
        onChange(values.filter(v => v.name !== nameToRemove));
      }
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
        showSearch
        allowClear
        filterOption={false}
        placeholder={placeholder}
        onSearch={handleSearch}
        onSelect={handleSelect}
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
      {values.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {values.map(person => (
            <Tag
              key={person.name}
              closable
              onClose={() => handleRemove(person.name)}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {person.displayName || person.name}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
};
```

- [ ] **Step 2: Export both components from index**

Check `src/features/person-limits-module/SettingsPage/components/index.ts` and add export for MultiPersonSelect if needed.

- [ ] **Step 3: Run typecheck**

Run: `npm run lint:typescript 2>&1 | head -50`

- [ ] **Step 4: Commit**

```bash
git add src/features/person-limits-module/SettingsPage/components/PersonNameSelect.tsx
git commit -m "feat(person-limits): add MultiPersonSelect component with badge display"
```

---

## Task 6: Update SettingsPage/components/PersonalWipLimitTable.tsx

**Files:**
- Modify: `src/features/person-limits-module/SettingsPage/components/PersonalWipLimitTable.tsx`

- [ ] **Step 1: Update person column to display array**

Change the person column render function:

```typescript
{
  title: texts.person,
  key: 'persons',
  render: (_: any, record: PersonLimit) => {
    const persons = 'persons' in record ? record.persons : [record.person];
    return persons.map(p => p.displayName || p.name).join(', ');
  },
},
```

- [ ] **Step 2: Run typecheck**

Run: `npm run lint:typescript 2>&1 | head -50`

- [ ] **Step 3: Commit**

```bash
git add src/features/person-limits-module/SettingsPage/components/PersonalWipLimitTable.tsx
git commit -m "feat(person-limits): update PersonalWipLimitTable for persons array"
```

---

## Task 7: Update BoardPage/models/types.ts

**Files:**
- Modify: `src/features/person-limits-module/BoardPage/models/types.ts`

- [ ] **Step 1: Change PersonLimitStats.person to persons array**

```typescript
export type PersonLimitStats = {
  id: number;
  persons: Array<{
    name: string;
    displayName?: string;
  }>;
  limit: number;
  issues: Element[];
  columns: Array<{ id: string; name: string }>;
  swimlanes: Array<{ id: string; name: string }>;
  includedIssueTypes?: string[];
  showAllPersonIssues: boolean;
};
```

- [ ] **Step 2: Run typecheck**

Run: `npm run lint:typescript 2>&1 | head -100`

- [ ] **Step 3: Commit**

```bash
git add src/features/person-limits-module/BoardPage/models/types.ts
git commit -m "feat(person-limits): change PersonLimitStats.person to persons array"
```

---

## Task 8: Update BoardPage/utils/isPersonsIssue.ts

**Files:**
- Modify: `src/features/person-limits-module/BoardPage/utils/isPersonsIssue.ts`

- [ ] **Step 1: Update to check against persons array**

```typescript
import type { PersonLimitStats } from '../models/types';

/**
 * Checks if an issue belongs to any of the persons by assignee match.
 * Used when showAllPersonIssues is true — ignores column/swimlane/type filters.
 *
 * Matches by name or legacy displayName against any person in the array.
 */
export const isPersonsIssue = (stats: Pick<PersonLimitStats, 'persons'>, assignee: string | null): boolean => {
  return stats.persons.some(
    person => person.name === assignee || (person.displayName != null && person.displayName === assignee)
  );
};
```

- [ ] **Step 2: Run tests**

Run: `npm test -- src/features/person-limits-module/BoardPage/utils/isPersonsIssue.test.ts`
Expected: Tests fail, need to update

- [ ] **Step 3: Update tests**

Update `src/features/person-limits-module/BoardPage/utils/isPersonsIssue.test.ts` to use new API:

```typescript
describe('isPersonsIssue', () => {
  it('should return true when assignee matches any person in array', () => {
    const stats = {
      persons: [{ name: 'alice' }, { name: 'bob' }],
    };
    expect(isPersonsIssue(stats, 'alice')).toBe(true);
    expect(isPersonsIssue(stats, 'bob')).toBe(true);
  });

  it('should return true when assignee matches displayName', () => {
    const stats = {
      persons: [{ name: 'alice', displayName: 'Alice Smith' }],
    };
    expect(isPersonsIssue(stats, 'Alice Smith')).toBe(true);
  });

  it('should return false when assignee does not match any person', () => {
    const stats = {
      persons: [{ name: 'alice' }],
    };
    expect(isPersonsIssue(stats, 'charlie')).toBe(false);
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/features/person-limits-module/BoardPage/utils/isPersonsIssue.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/person-limits-module/BoardPage/utils/isPersonsIssue.ts src/features/person-limits-module/BoardPage/utils/isPersonsIssue.test.ts
git commit -m "feat(person-limits): update isPersonsIssue for persons array"
```

---

## Task 9: Update BoardPage/utils/isPersonLimitAppliedToIssue.ts

**Files:**
- Modify: `src/features/person-limits-module/BoardPage/utils/isPersonLimitAppliedToIssue.ts`

- [ ] **Step 1: Update to check against persons array**

```typescript
import type { PersonLimitStats } from '../models/types';

/**
 * Checks if a limit applies to a given issue.
 *
 * The limit applies when ALL conditions are met:
 * 1. Assignee matches any person in the persons array (by name, or legacy displayName)
 * 2. Issue is in one of the specified columns (or all columns if empty)
 * 3. Issue is in one of the specified swimlanes (or all swimlanes if empty)
 * 4. Issue type matches one of the included types (or all types if empty/undefined)
 */
export const isPersonLimitAppliedToIssue = (
  stats: Pick<PersonLimitStats, 'persons' | 'columns' | 'swimlanes' | 'includedIssueTypes'>,
  assignee: string | null,
  columnId: string,
  swimlaneId?: string | null,
  issueType?: string | null
): boolean => {
  // 1. Check assignee match against any person in array
  const isAssigneeMatch = stats.persons.some(
    person => person.name === assignee || (person.displayName != null && person.displayName === assignee)
  );
  if (!isAssigneeMatch) return false;

  // 2. Check column match (empty array = all columns)
  const isColumnMatch = stats.columns.length === 0 || stats.columns.some(column => column.id === columnId);
  if (!isColumnMatch) return false;

  // 3. Check swimlane match (empty array = all swimlanes)
  const isSwimlaneMatch =
    stats.swimlanes.length === 0 ||
    (swimlaneId != null && stats.swimlanes.some(sw => sw.id === swimlaneId));
  if (!isSwimlaneMatch) return false;

  // 4. Check issue type match (undefined/empty = all types)
  const isTypeMatch =
    !stats.includedIssueTypes ||
    stats.includedIssueTypes.length === 0 ||
    (issueType != null && stats.includedIssueTypes.includes(issueType));

  return isTypeMatch;
};
```

- [ ] **Step 2: Run tests**

Run: `npm test -- src/features/person-limits-module/BoardPage/utils/isPersonLimitAppliedToIssue.test.ts`
Expected: Tests fail, need to update

- [ ] **Step 3: Update tests**

Update test file to use persons array:

```typescript
describe('isPersonLimitAppliedToIssue', () => {
  it('should return true when assignee matches any person in array', () => {
    const stats = {
      persons: [{ name: 'alice' }, { name: 'bob' }],
      columns: [],
      swimlanes: [],
    };
    expect(isPersonLimitAppliedToIssue(stats, 'alice', 'col-1')).toBe(true);
    expect(isPersonLimitAppliedToIssue(stats, 'bob', 'col-1')).toBe(true);
  });
});
```

- [ ] **Step 4: Run tests**

Run: `npm test -- src/features/person-limits-module/BoardPage/utils/isPersonLimitAppliedToIssue.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/person-limits-module/BoardPage/utils/isPersonLimitAppliedToIssue.ts src/features/person-limits-module/BoardPage/utils/isPersonLimitAppliedToIssue.test.ts
git commit -m "feat(person-limits): update isPersonLimitAppliedToIssue for persons array"
```

---

## Task 10: Update BoardPage/models/BoardRuntimeModel.ts

**Files:**
- Modify: `src/features/person-limits-module/BoardPage/models/BoardRuntimeModel.ts`

- [ ] **Step 1: Update calculateStats to build persons array in stats**

The calculateStats method creates PersonLimitStats from property limits. Need to update to use `persons` array:

```typescript
calculateStats(): PersonLimitStats[] {
  const { limits } = this.propertyModel.data;
  const stats: PersonLimitStats[] = limits.map(limit => ({
    id: computeLimitId(limit),
    persons: limit.persons.map(p => ({ name: p.name, displayName: p.displayName })),
    limit: limit.limit,
    issues: ref([]) as unknown as Element[],
    columns: limit.columns,
    swimlanes: limit.swimlanes,
    includedIssueTypes: limit.includedIssueTypes,
    showAllPersonIssues: limit.showAllPersonIssues,
  }));
  // ... rest unchanged
}
```

- [ ] **Step 2: Run typecheck**

Run: `npm run lint:typescript 2>&1 | head -50`

- [ ] **Step 3: Commit**

```bash
git add src/features/person-limits-module/BoardPage/models/BoardRuntimeModel.ts
git commit -m "feat(person-limits): update BoardRuntimeModel for persons array"
```

---

## Task 11: Update BoardPage/components/AvatarsContainer.tsx

**Files:**
- Modify: `src/features/person-limits-module/BoardPage/components/AvatarsContainer.tsx`

- [ ] **Step 1: Render one badge per person in persons array**

Change the render logic to iterate over `stat.persons` array:

```typescript
import React from 'react';
import { useDi } from 'src/infrastructure/di/diContext';
import { buildAvatarUrlToken } from 'src/infrastructure/di/jiraApiTokens';
import { boardRuntimeModelToken } from '../../tokens';
import { AvatarBadge } from './AvatarBadge';

export const AvatarsContainer: React.FC = () => {
  const container = useDi();
  const buildAvatarUrl = container.inject(buildAvatarUrlToken);
  const { model, useModel } = container.inject(boardRuntimeModelToken);
  const { stats, activeLimitId } = useModel();

  const handleClick = (limitId: number) => {
    model.toggleActiveLimitId(limitId);
  };

  if (stats.length === 0) {
    return null;
  }

  return (
    <div id="avatars-limits" style={{ display: 'inline-flex', marginLeft: 30 }}>
      {stats.flatMap(stat =>
        stat.persons.map(person => {
          const personIssues = stat.issues.filter(issue => {
            const assignee = model.getAssigneeFromIssue(issue);
            return assignee === person.name || assignee === person.displayName;
          });
          return (
            <AvatarBadge
              key={`${stat.id}-${person.name}`}
              avatar={buildAvatarUrl(person.name)}
              personName={person.name}
              limitId={stat.id}
              currentCount={personIssues.length}
              limit={stat.limit}
              isActive={activeLimitId === stat.id}
              onClick={handleClick}
            />
          );
        })
      )}
    </div>
  );
};
```

Note: `getAssigneeFromIssue` is a method on `pageObject` not `model`. Need to expose it or refactor. Check if BoardRuntimeModel has access to pageObject or if we need to add a helper.

Actually, looking at the code, BoardRuntimeModel has `this.pageObject`. We need to add a public method or compute the filtered issues in BoardRuntimeModel.

Alternative: Instead of filtering in AvatarsContainer, add a method to BoardRuntimeModel that returns per-person issue counts.

- [ ] **Step 2: Add helper to BoardRuntimeModel for per-person counts**

Add to BoardRuntimeModel:

```typescript
/**
 * Get issue count for a specific person within a limit's stats.
 */
getPersonIssueCount(stat: PersonLimitStats, personName: string): number {
  return stat.issues.filter(issue => {
    const assignee = this.pageObject.getAssigneeFromIssue(issue);
    return assignee === personName;
  }).length;
}
```

- [ ] **Step 3: Run typecheck**

Run: `npm run lint:typescript 2>&1 | head -50`

- [ ] **Step 4: Commit**

```bash
git add src/features/person-limits-module/BoardPage/components/AvatarsContainer.tsx src/features/person-limits-module/BoardPage/models/BoardRuntimeModel.ts
git commit -m "feat(person-limits): render one avatar per person in persons array"
```

---

## Task 12: Run full test suite and fix failures

**Files:**
- Modify: Various files as needed

- [ ] **Step 1: Run all tests**

Run: `npm test -- src/features/person-limits-module/`
Expected: Some tests may fail due to API changes

- [ ] **Step 2: Fix test failures**

Fix any test failures related to the changes. Common issues:
- Tests expecting `person` instead of `persons`
- Tests expecting single person object instead of array

- [ ] **Step 3: Run Cypress tests**

Run: `npm run cy:run -- --spec "cypress/e2e/person-limits-module/**/*.cy.tsx"`
Expected: Should pass with updated test scenarios

- [ ] **Step 4: Run lint**

Run: `npm run lint:eslint && npm run lint:typescript`
Expected: No errors

- [ ] **Step 5: Commit all remaining changes**

```bash
git add -A
git commit -m "feat(person-limits): complete multi-person WIP limits implementation"
```

---

## Task 13: Integration testing

**Files:**
- Test: Manual testing on Jira board

- [ ] **Step 1: Build extension**

Run: `npm run build`
Expected: Successful build

- [ ] **Step 2: Test multi-person limit creation**

Manual test:
1. Open board settings
2. Create new limit
3. Select multiple persons in PersonNameSelect
4. Verify badges appear in form
5. Save
6. Verify table shows all persons
7. Open board, verify multiple avatars render for multi-person limits

- [ ] **Step 3: Test editing multi-person limit**

Manual test:
1. Edit existing multi-person limit
2. Add/remove persons
3. Save and verify

---

## Verification Checklist

- [ ] TypeScript compiles without errors
- [ ] All unit tests pass
- [ ] Cypress tests pass
- [ ] ESLint passes
- [ ] Build succeeds
- [ ] Manual testing on Jira board works

---

## Spec Coverage Check

1. **Data Model Change** ✓
   - Task 1: property/types.ts
   - Task 2: property/migrateProperty.ts

2. **SettingsPage Changes** ✓
   - Task 3: SettingsPage/state/types.ts
   - Task 4: SettingsPage/models/SettingsUIModel.ts
   - Task 5: SettingsPage/components/PersonNameSelect.tsx
   - Task 6: SettingsPage/components/PersonalWipLimitTable.tsx

3. **BoardPage Changes** ✓
   - Task 7: BoardPage/models/types.ts
   - Task 8: BoardPage/utils/isPersonsIssue.ts
   - Task 9: BoardPage/utils/isPersonLimitAppliedToIssue.ts
   - Task 10: BoardPage/models/BoardRuntimeModel.ts
   - Task 11: BoardPage/components/AvatarsContainer.tsx

4. **Testing** ✓
   - Task 12: Run tests and fix failures
   - Task 13: Integration testing
