# Progress

## What works
- Custom group configuration UI (field and JQL modes).
- Badge counter and progress bar display for groups.
- JQL parser and matcher with case-insensitive, array-aware logic.
- Unit tests for all major matching scenarios.

## What's left to build
- Further UI/UX improvements for group management.
- More advanced JQL features if needed.
- Additional integration with Jira board data as requirements evolve.

## Current status
- Core features are implemented and tested.
- All current unit tests pass after recent logic updates.

## Known issues
- Edge cases in JQL parsing may arise as new requirements/tests are added.
- UI may need further refinement for large boards or many custom groups.

## Future Plans
1. Add demo mode for debugging custom JQL: User enters a task key, debug mode downloads task info and checks JQL against the task, showing which conditions matched and which did not.
2. Add tooltip around JQL mode with description and limitations of the JQL implementation.
