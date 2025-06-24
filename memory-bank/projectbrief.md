# Project Brief

*Foundation document that shapes all other files*

## Core Requirements
- Support for custom groups on Jira boards using field values and JQL queries.
- Visualization: counters, progress bars, Chart Bar for swimlanes/columns, flag indicators, SLA lines, rulers on Control Chart, full Card Colors highlighting.
- Task description templates (Description Template) with local storage.
- Flexible WIP-limit configuration: for columns, swimlanes, and personal limits.
- Simple and reliable JQL parsing/matching for grouping.
- Group, color, and display mode configuration via the board UI.
- Correct handling of arrays and case-insensitive matching.
- Ability to blur sensitive data on the board.
- Request identification via special header browser-plugin: jira-helper/{version}.

## Project Goals
- Significantly expand visualization and management capabilities on Jira boards.
- Make configuration of groups, colors, limits, and visual elements as intuitive as possible.
- Increase transparency and manageability of processes for teams with any workflow.
- Maintain high code quality and test coverage for all key features.

## Project Scope
- UI components for configuring groups, colors, limits, templates, and visualizations.
- JQL parser and matching logic for custom groups.
- State management for settings, progress, and limits.
- Integration with Jira data, support for Chrome and Firefox.
- Visual enhancements: Chart Bar, Card Colors, SLA, ruler, flags, data blurring.
