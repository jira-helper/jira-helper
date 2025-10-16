# Additional Card Elements Feature

This feature adds additional elements to Jira cards to improve visibility of task relationships.

## Features

### Issue Links Display

Displays related issues on cards based on link types and JQL filters.

#### Configuration

- **Link Type**: Select the type of relationship to display
- **Direction**: Choose inward, outward, or both directions
- **JQL Filter**: Optional JQL query to filter related issues
- **Columns**: Select which board columns to show the relationships in

#### Example Use Cases

1. **Child Tasks**: Show all child tasks linked via "is Child of" relationship
2. **Blocked Issues**: Display issues that block the current task
3. **Related Ideas**: Show related ideas with specific JQL filter

#### JQL Filtering Examples

- `issueType = "Idea" AND status = "In Progress"` - Show only ideas in progress
- `status != "Done"` - Exclude completed tasks
- `priority in ("High", "Critical")` - Show only high priority tasks

## Usage

1. Go to board settings (click the Jira Helper icon)
2. Navigate to the "Additional Card Elements" tab
3. Configure link display settings:
   - Select link type and direction
   - Optionally add JQL filter
4. Select columns where relationships should be displayed
5. Save settings

## Technical Details

### Architecture

- **BoardPage**: Attaches components to cards
- **IssueLinksSettings**: UI for configuring link displays
- **ColumnSettings**: UI for selecting board columns
- **setIssueLinks**: Action for managing link settings
- **setColumns**: Action for managing column settings

### Store Structure

```typescript
{
  columnsToTrack: string[];   // Selected columns
  issueLinks: IssueLink[];     // Link configurations
}
```

### IssueLink Structure

```typescript
{
  linkType: {
    id: string;                 // Link type ID from Jira
    direction: 'inward' | 'outward';
  },
  jql: string;                 // JQL filter (optional)
}
```

## Files Structure

```
src/features/additional-card-elements/
├── index.ts                           # Initialization
├── BoardPage.ts                       # Board modification
├── types.ts                           # Type definitions
├── stores/
│   ├── additionalCardElementsBoardProperty.ts
│   └── additionalCardElementsBoardProperty.types.ts
├── hooks/
│   └── useGetSettings.ts              # Settings hook
├── BoardSettings/
│   ├── AdditionalCardElementsSettings.tsx
│   ├── ColumnSettings.tsx
│   ├── IssueLinksSettings.tsx
│   └── actions/
│       ├── setColumns.ts
│       ├── setIssueLinks.ts
│       ├── clearIssueLinks.ts
│       └── index.ts
└── README.md
```
