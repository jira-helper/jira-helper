# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Generating changelog

Run `node scripts/generate-changelog.mjs [from-tag] [to-tag]` to generate entries from git commits.


## [2.30.2] - 2026-04-22

### Fixed

- **person-limits**: Align swimlane handling with the board’s active strategy — hide query swimlanes in settings when the strategy is not “custom”, and ignore saved swimlane filters at runtime so limits still apply on boards without custom swimlanes (Jira’s editmodel can still return historical swimlane definitions).


## [2.30.1] - 2026-04-21

### Fixed

- Fixed person-limits badge disappearing from boards after board updates


## [2.30.0] - 2026-04-18

### Added

- **Issue Condition Checks**: Show small icons on cards when issues match defined conditions (sub-tasks, epic children, linked issues)
- **person-limits**: Person WIP Limits settings tab in board page Jira Helper panel
- **person-limits**: showAllPersonIssues per-limit option
- **column-limits**: CONWIP settings tab in board page Jira Helper panel

### Changed

- **Architecture**: Migrated feature modules to Valtio + Module DI abstraction
- **person-limits**: Migrated from Zustand to Valtio Model + DI
- Centralized settings page button registration via ColumnsSettingsTabPageObject


## [2.29.0] - 2024-10-15

### Added

- **Additional Card Elements**: Issue link display in backlog and board
- **Additional Card Elements**: showInBacklog option for backlog issue elements
- **Additional Card Elements**: Board Backlog page integration
- **Additional Card Elements**: Multiline summary option for issue links
- Debounce utility for IssueSelectorByAttributes

### Fixed

- Fill card with grabber color
- Duplicated requests to Jira API
- Progress bars for external issues in epics
- External links progress tracking
- Sub-tasks progress only for chosen columns
- Detecting backlog screen


## [2.28.0] - 2024-06-01

### Added

- Days to Deadline badge on cards
- Days in Column warning levels per column
- Issue Links Display with configurable rules and colors

### Fixed

- Various UI fixes and improvements


## [2.10.1] - 2021-02-25
### Fixed 

- Fix trouble with expedite swimlane from [@davakh](https://github.com/davakh)


## [2.10.0] - 2021-02-19
### Added

— Choosing color for column WIP-limit from [@davakh](https://github.com/davakh)
— Pop Up for set swimlane WIP-limits from [@davakh](https://github.com/davakh)
— text-template for sub-tasks from [@pavelpower](https://github.com/pavelpower)
— WIP-limit for Epics [@davakh](https://github.com/davakh)
