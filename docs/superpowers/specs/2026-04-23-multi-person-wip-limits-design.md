# Multi-Person WIP Limits Design

## Overview

Allow creating a single WIP limit rule for multiple persons simultaneously, instead of creating separate rules per person.

**Example:** 10 team members need individual WIP limits of 5 → create ONE rule with 10 persons instead of 10 separate rules.

## Data Model Change

### Before
```typescript
type PersonLimit = {
  id: number;
  person: { name: string; displayName?: string; self: string };
  limit: number;
  columns: Array<{ id: string; name: string }>;
  swimlanes: Array<{ id: string; name: string }>;
  includedIssueTypes?: string[];
  showAllPersonIssues: boolean;
}
```

### After
```typescript
type PersonLimit = {
  id: number;
  persons: Array<{ name: string; displayName?: string; self: string }>;
  limit: number;
  columns: Array<{ id: string; name: string }>;
  swimlanes: Array<{ id: string; name: string }>;
  includedIssueTypes?: string[];
  showAllPersonIssues: boolean;
}
```

### Migration
- `person` field renamed to `persons` (array)
- Old limits with single `person` → auto-convert to `persons: [person]`
- Migration runs on property load

## SettingsPage Changes

### PersonNameSelect Component
- Change to multi-select mode
- After selection, display selected users as avatar badges
- Each badge has remove (×) button

### Form Layout
```
┌─────────────────────────────────────┐
│ Persons: [👤 Alice ×] [👤 Bob ×]    │
│ Limit: [5]                          │
│ Columns: [All ▼]                    │
│ Swimlanes: [All ▼]                  │
└─────────────────────────────────────┘
```

### PersonalWipLimitTable
- Display all persons in a cell, horizontally
- Format: "👤 Alice, 👤 Bob, 👤 Charlie"

## BoardPage Changes

### AvatarsContainer
- For each `PersonLimit` with `N` persons → render `N` avatar badges
- Each badge shows: avatar + `count/limit` where `count` is only for that specific person
- Limit value is shared across all badges of the same rule

### Logic
```typescript
// For rule with persons: [A, B, C] and limit: 5
// AvatarBadge A: count(A's issues) / 5
// AvatarBadge B: count(B's issues) / 5
// AvatarBadge C: count(C's issues) / 5
```

## Files to Modify

1. `property/types.ts` — PersonLimit type change
2. `property/migrateProperty.ts` — add migration from v2.30 to v2.31
3. `SettingsPage/state/types.ts` — FormData.person → FormData.persons
4. `SettingsPage/models/SettingsUIModel.ts` — handle array of persons
5. `SettingsPage/components/PersonNameSelect.tsx` — multi-select support
6. `SettingsPage/components/PersonalWipLimitTable.tsx` — display persons array
7. `BoardPage/models/BoardRuntimeModel.ts` — iterate over persons array for stats
8. `BoardPage/components/AvatarsContainer.tsx` — render one badge per person
9. `BoardPage/components/AvatarBadge.tsx` — use person object

## Testing

- Add range to existing feature files
- Multi-person creation in add-limit.feature
- Multi-person editing in edit-limit.feature
- Board rendering with multiple avatars per rule
