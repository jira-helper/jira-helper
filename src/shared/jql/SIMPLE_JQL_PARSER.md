# Simple JQL Parser Documentation

This document describes the implementation and usage of the simple JQL parser found in this directory.

## How it works
- The parser tokenizes the input string, respecting quoted values and parentheses.
- It parses the tokens into an Abstract Syntax Tree (AST) supporting logical and comparison operations.
- The AST is compiled into a matching function that can be used to filter issues by their fields.
- The parser is case-insensitive for field names and operators.
- Date functions use an injectable clock (`parseJql(jql, { now })`); production defaults to `() => new Date()`.

## Supported Syntax
- **Comparison operators:** `=`, `!=`, `in`, `not in`, `<`, `>`, `<=`, `>=`, `~`, `!~`
- **Logical operators:** `AND`, `OR`, `NOT`
- **Parentheses** for grouping: `(...)`
- **Quoted field names and values:** e.g., `"Issue Size" = "Some Value"`
- **Special keywords:** `EMPTY`, `is`, `is not`
- **Array values for fields:** e.g., `labels in (bug, urgent)`
- **Date functions:** `now()`, `startOfDay/Week/Month/Year([inc])`, `endOfDay/Week/Month/Year([inc])`
- **Case-insensitive** field names and operators

### Date / number comparisons
- Ordered operators compare numeric literals and date/datetime values.
- Date-only (`YYYY-MM-DD`) and period boundaries use the **local** timezone of the clock.
- Week starts on **Monday** (ISO-8601).
- Increment syntax matches Jira: `"+1d"`, `"-3w"`, `"2M"`, `"y|M|w|d|h|m"` (unit defaults to the function's natural period).

## Not Supported
- User/group/server functions (e.g. `currentUser()`, `membersOf()`, `openSprints()`)
- `ORDER BY`, sorting, or subqueries
- Wildcards, `LIKE`, regex matching
- Nested property access (e.g., `parent.field`)
- Comments or multiline queries

## Examples of Supported JQL
- `project = THF`
- `status != Done`
- `labels in (bug, urgent)`
- `labels not in (feature, enhancement)`
- `"Issue Size" = "Large"`
- `Field1 = value AND Field2 != other`
- `(Field1 = a OR Field2 = b) AND Field2 != c`
- `Field1 is EMPTY`
- `Field1 is not EMPTY`
- `labels = bug`
- `project = THF AND "Issue Size" is not EMPTY`
- `duedate < now()`
- `created >= startOfDay("-7d")`
- `"Story Points" > 13`
- `"End date" is EMPTY OR "End date" < now()`

## Examples of NOT Supported JQL
- `assignee = currentUser()`               // User functions not supported
- `sprint in openSprints()`                 // Server-side functions not supported
- `ORDER BY created DESC`                   // Sorting not supported
- `parent.status = Done`                    // Nested property access not supported
- `Field1 = value with spaces`              // Value with spaces must be quoted
- `Field1 not in a`                         // Missing parentheses after 'in'

## Error Handling
- The parser throws clear errors for unsupported syntax, missing quotes, or unexpected tokens.
- Example: `Field1 = value with spaces` → Error: Did you forget to quote the value?
- Example: `Field1 not in a` → Error: Expected ( after in
- Example: `assignee = currentUser()` → Error: Unsupported function: currentuser()
