---
sidebar_position: 1
---

# JQL Reference

**JQL** (Jira Query Language) is Jira's SQL-like syntax for filtering issues. Many Jira Helper features accept JQL expressions for configuration — defining which cards get colored, which conditions trigger badges, or which issues appear on the Gantt chart.

> **Performance note:** Complex JQL queries with many `OR` clauses or nested sub-queries can slow down rendering. Prefer simple, focused queries for better board performance.

## Where to Enter JQL

Each feature has its own JQL input field, located in different places within the extension:

| Feature | JQL Input Location |
|---------|-------------------|
| Card Colors | **Jira Board Settings → Card Colors** — the native Jira color-rule table (not a Jira Helper dialog) |
| Issue Condition Checks | **Board Settings → Card Information → Issue Condition Checks** tab — each condition gets its own JQL field |
| Issue Links Display | **Board Settings → Card Information → Issue Links** tab — JQL to filter source issues and linked tasks |
| Gantt Chart | **Gantt Chart settings → Bar Colour Rules** (for color rules) or **Quick Filters** (for filtering) |

<!-- SCREENSHOT: The Issue Condition Checks settings dialog with a JQL input field highlighted, showing the query "assignee = currentUser() AND status != Done" -->

---

## Supported JQL Functions

Jira Helper supports all standard JQL that your Jira instance supports, including:

- **Field comparisons:** `=`, `!=`, `>`, `<`, `>=`, `<=`, `~` (contains), `!~` (does not contain)
- **Logical operators:** `AND`, `OR`, `NOT`
- **Keywords:** `EMPTY`, `NULL`, `IS`, `IN`, `NOT IN`, `WAS`, `CHANGED`
- **Ordering:** `ORDER BY`
- **Functions:** `currentUser()`, `membersOf()`, `now()`, `startOfDay()`, `endOfWeek()`, and all other Jira-supported functions

---

## Card Colors

JQL queries define which cards get which background color. These use Jira's native Card Colors feature — Jira Helper extends it by filling the whole card.

### Examples

```jql
priority = Highest OR priority = High
```
Highlights urgent and high-priority cards.

```jql
type = Bug AND status != Closed
```
Colors open bugs for visibility.

```jql
labels = hotfix AND fixVersion = EMPTY
```
Flags hotfix-labeled issues that haven't been assigned a release.

---

## Issue Condition Checks

JQL conditions display custom icon badges on cards. When the JQL evaluates to `true` for an issue, the badge appears.

### Examples

```jql
assignee = currentUser() AND status not in (Done, Closed)
```
Shows a badge on cards assigned to you that aren't done.

```jql
duedate < now() AND resolution = Unresolved
```
Flags overdue unresolved issues with a warning icon.

```jql
"Story Points" > 13
```
Marks large stories that may need splitting.

```jql
fixVersion is EMPTY AND type != Epic
```
Highlights issues without a target release.

---

## Issue Links Display

JQL filters which issues show their linked relationships on cards.

### Filter source issues

```jql
type = Story
```
Only show linked issues on Story cards.

```jql
type != Sub-task
```
Exclude sub-tasks from showing link badges.

### Filter linked tasks

```jql
status != Done
```
Only show linked issues that are still open.

---

## Gantt Chart

JQL appears in two places in the Gantt chart: **bar colour rules** and **quick filters**.

### Bar Colour Rules

```jql
type = Bug
```
Color all bug bars red in the timeline.

```jql
priority >= High
```
Highlight high-priority task bars.

### Quick Filters (interactive filtering)

```jql
assignee = currentUser()
```
Show only your tasks on the chart.

```jql
type = Sub-task
```
Filter to sub-tasks only.

### Exclusion Filters

```jql
status = Cancelled
```
Prevent cancelled issues from cluttering the timeline.

```jql
priority = Low
```
Exclude low-priority items from the chart.

---

## Common Mistakes

| Problem | Cause | Solution |
|---------|-------|---------|
| Query returns no results | Field name mismatch | Copy field names from Jira's own JQL editor autocomplete |
| Syntax error on save | Unclosed quotes or parentheses | Use Jira's built-in JQL search (`Issues → Search for issues`) to validate your query first |
| `currentUser()` doesn't work as expected | The function evaluates for the current Jira user, not the board viewer | Test the query in Jira's issue search while logged in as the target user |
| Empty results for `fixVersion` queries | Archived or unreleased versions may not match | Use `fixVersion is EMPTY` for unassigned; check version name spelling |
| Cards not colored despite matching JQL | Card Colors uses Jira's native rules — see [WIP Limits troubleshooting](/docs/advanced/faq#card-colors-not-applying--whole-card-not-colored) | Verify the JQL rule exists in Jira's Card Colors settings, not just Jira Helper |

## Troubleshooting

### My JQL works in Jira Search but not in Jira Helper

1. Verify the JQL in **Jira's advanced issue search** (`Issues → Search for issues → Advanced`)
2. Copy the validated query exactly
3. Some Jira Helper inputs have character limits — simplify long queries
4. Reload the board after pasting the query

### Query slow to apply

Complex queries (many `OR` clauses, text searches with `~`, sub-queries) can be slow to evaluate. Try:
- Replace `OR` lists with `IN` when possible: `status IN (Open, "In Progress", Review)`
- Avoid `text ~ "..."` on large boards
- Split one complex rule into multiple simpler rules

### Card colors not matching

Card Colors JQL rules are evaluated **top-to-bottom**, and the **first match wins**. Reorder your rules in Jira's native Card Colors settings.

## See Also

- [Atlassian JQL documentation](https://support.atlassian.com/jira-software-cloud/docs/advanced-search-reference-jql/)
- [Card Colors](/docs/features/board-visualization/card-colors)
- [Issue Condition Checks](/docs/features/card-information/issue-condition-checks)
- [Issue Links Display](/docs/features/card-information/issue-links-display)
- [Gantt Chart](/docs/features/gantt-chart)
- [FAQ](/docs/advanced/faq)
