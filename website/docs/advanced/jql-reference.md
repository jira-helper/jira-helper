---
sidebar_position: 1
---

# JQL Reference

**JQL** (Jira Query Language) is Jira's SQL-like syntax for filtering issues. Some Jira Helper features accept JQL expressions for configuration — defining which conditions trigger badges or which issues appear on the Gantt chart.

> Jira Helper uses a **simplified JQL parser** that supports a subset of Jira's full syntax. See [Supported Syntax](#supported-syntax) below for what is available — unsupported constructs will cause a parse error.

## Where to Enter JQL

| Feature | JQL Input Location |
|---------|-------------------|
| Issue Condition Checks | **Board Settings → Card Information → «Issue Condition Checks»** tab — each condition gets its own JQL field |
| Issue Links Display | **Board Settings → Card Information → «Issue Links»** tab — JQL to filter source issues and linked tasks |
| Gantt Chart | **Gantt Chart settings → «Bar colors»** (for color rules) or **«Quick filters»** (for filtering) |

---

## Supported Syntax

Jira Helper's parser supports the following JQL subset:

### Comparison operators

- `=` — equals
- `!=` — not equals
- `~` — contains (case-insensitive substring match)
- `!~` — does not contain
- `in (val1, val2, ...)` — matches any of the listed values
- `not in (val1, val2, ...)` — matches none of the listed values

### Logical operators

- `AND`
- `OR`
- `NOT`
- Parentheses `(...)` for grouping

### Special keywords

- `is EMPTY` / `is not EMPTY` — field empty or not
- `EMPTY` can also be used with `=` / `!=`: `field = EMPTY`

### Values

- Unquoted single-word values: `status = Done`
- Quoted values with spaces: `"Issue Size" = "Extra Large"`
- Case-insensitive field names and operator keywords

### Not supported

The following Jira JQL constructs are **not** supported by Jira Helper's parser:

- **Functions**: `currentUser()`, `membersOf()`, `now()`, `startOfDay()`, etc.
- **Comparison operators**: `>`, `<`, `>=`, `<=`
- **Keywords**: `WAS`, `CHANGED`, `ORDER BY`, `LIKE`
- **Subqueries** and nested property access (`parent.field`)
- **Wildcards** and regex matching
- **Date values** and date arithmetic

If you need these, use Jira's native JQL filtering (e.g., board filters, quick filters) to narrow the set of issues first, then apply Jira Helper's JQL to the already-filtered set.

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
| Parse error on save | Using unsupported JQL syntax (functions, `>`, `<`, `WAS`, etc.) | Check the [Supported Syntax](#supported-syntax) section — Jira Helper uses a simplified parser |

## Troubleshooting

### My JQL works in Jira Search but not in Jira Helper

1. Verify the JQL in **Jira's advanced issue search** (`Issues → Search for issues → Advanced`)
2. Copy the validated query exactly
3. Check that your query does not use unsupported syntax — see [Supported Syntax](#supported-syntax)
4. Some Jira Helper inputs have character limits — simplify long queries
5. Reload the board after pasting the query

### Parse error or unexpected behaviour

Jira Helper uses a **simplified JQL parser** that only supports the subset listed in [Supported Syntax](#supported-syntax). Common causes of parse errors:

- Using `>`, `<`, `>=`, `<=` — use `=` with specific values instead
- Using Jira functions like `currentUser()` or `membersOf()`
- Using `WAS` or `CHANGED` keywords
- Using `ORDER BY`

If your query requires these, apply the equivalent filter in Jira's board configuration first, then use a simpler JQL in Jira Helper.

### JQL debug tool

To see how Jira Helper evaluates your JQL queries and which fields are available, use the built-in diagnostic:

1. Open the **Jira Helper** panel on the board
2. Open the browser DevTools Console (F12)
3. Look for `JqlDebugDemo` in the console or use the diagnostic feature

The debug tool shows:
- Available fields and their values for each issue
- How each condition evaluates (matched or not)
- A visual AST tree of your JQL query

## See Also

- [Atlassian JQL documentation](https://support.atlassian.com/jira-software-cloud/docs/advanced-search-reference-jql/)
- [Issue Condition Checks](/docs/features/card-information/issue-condition-checks)
- [Issue Links Display](/docs/features/card-information/issue-links-display)
- [Gantt Chart](/docs/features/gantt-chart)
- [FAQ](/docs/advanced/faq)
