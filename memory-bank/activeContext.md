# Active Context

## Current work focus
- Ensuring the JQL parser and matcher logic is robust, especially for 'is not EMPTY' and array/case-insensitive matching.
- Maintaining and updating unit tests to reflect new requirements and edge cases.

## Recent changes
- Refactored JQL parser to handle quoted field names, case-insensitivity, and array values.
- Updated logic for 'is not EMPTY' to match new test expectations.
- Improved custom group configuration UI and badge counter display.

## Next steps
- Continue refining the JQL parser as new requirements/tests arise.
- Expand UI/UX for custom group management.
- Document technical decisions and patterns in the memory bank.

## Active decisions and considerations
- Always treat field names as case-insensitive.
- Prefer explicit, test-driven changes to matching logic.
- Keep the UI responsive and user-friendly for group configuration.
