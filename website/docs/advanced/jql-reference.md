# JQL Reference

Many jira-helper features accept JQL (Jira Query Language) for filtering and configuration.

## Usage in Features

| Feature | JQL Usage |
|---------|-----------|
| Card Colors | JQL query determines which cards get which color |
| Issue Links | JQL filters source and linked tasks |
| Issue Condition Checks | JQL defines conditions for icon badges |
| Gantt Chart | JQL-based quick filters and exclusion rules |

## Examples

### Card Colors
```jql
priority = Highest OR priority = High
```
Highlights high-priority cards in one color.

### Issue Condition Checks
```jql
assignee = currentUser() AND status not in (Done, Closed)
```
Shows an icon on cards assigned to you that aren't done.

### Gantt Exclusion
```jql
type = Sub-task
```
Excludes sub-tasks from the Gantt chart.

For full JQL syntax, see [Atlassian JQL documentation](https://support.atlassian.com/jira-software-cloud/docs/advanced-search-reference-jql/).
