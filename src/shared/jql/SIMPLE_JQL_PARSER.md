# Simple JQL Parser Documentation

This document describes the implementation and usage of the simple JQL parser found in this directory.

## How it works
- The parser tokenizes the input string, respecting quoted values and parentheses.
- It parses the tokens into an Abstract Syntax Tree (AST) supporting logical and comparison operations.
- The AST is compiled into a matching function that can be used to filter issues by their fields.
- The parser is case-insensitive for field names and operators.

## Supported Syntax
- **Comparison operators:** `=`, `!=`, `in`, `not in`
- **Logical operators:** `AND`, `OR`, `NOT`
- **Parentheses** for grouping: `(...)`
- **Quoted field names and values:** e.g., `"Issue Size" = "Some Value"`
- **Special keywords:** `EMPTY`, `is`, `is not`
- **Array values for fields:** e.g., `labels in (bug, urgent)`
- **Case-insensitive** field names and operators

## Not Supported
- Functions (e.g., `currentUser()`, `startOfDay()`)
- `ORDER BY`, sorting, or subqueries
- Complex field types (dates, numbers, custom Jira functions)
- Wildcards, `LIKE`, `~`, or regex matching
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

## Examples of NOT Supported JQL
- `assignee in (currentUser())`           // Functions not supported
- `created >= startOfDay(-7d)`            // Functions and operators not supported
- `summary ~ "urgent"`                   // ~ (contains) operator not supported
- `ORDER BY created DESC`                 // Sorting not supported
- `parent.status = Done`                  // Nested property access not supported
- `Field1 = value with spaces`            // Value with spaces must be quoted
- `Field1 not in a`                       // Missing parentheses after 'in'

## Error Handling
- The parser throws clear errors for unsupported syntax, missing quotes, or unexpected tokens.
- Example: `Field1 = value with spaces` → Error: Did you forget to quote the value?
- Example: `Field1 not in a` → Error: Expected ( after in 