---
name: ux-review-improvment-cycle
description: Runs an iterative UX review and improvement loop for jira-helper UI changes. Use when the user asks to improve visual quality, usability, toolbar/settings appearance, or explicitly mentions the UX review improvement cycle.
---

# UX Review Improvment Cycle

## Purpose

Use this skill to improve jira-helper UI through repeated fresh UX reviews. Each review must come from a new sub-agent with no previous round context, so the score and feedback stay independent.

## Workflow

1. Prepare context for review:
   - Identify the changed UI surface and user goal.
   - Provide current screenshots, Storybook links/stories, or relevant component paths when available.
   - Include constraints from jira-helper: existing design patterns, Ant Design as the UI foundation, accessibility, i18n, and Chrome extension/Jira page integration.
   - For Jira user selection, require reuse of the person WIP limits user picker; extract it to shared if another feature needs it.

2. Launch a fresh UX expert sub-agent:
   - Use a new sub-agent invocation for every round.
   - Ask for a 0-100 UX score.
   - Ask for prioritized, actionable feedback that can be applied in code.
   - Ask the reviewer to separate important issues from nice-to-have polish.

3. Apply feedback:
   - Fix important UX issues first.
   - Keep edits scoped to the reviewed UI.
   - Preserve existing behavior unless the review identifies a UX problem in that behavior.
   - Add or update focused tests/stories when the UI contract changes.

4. Verify:
   - Run relevant unit/component tests, Storybook checks, lint, or browser smoke tests for the changed surface.
   - Capture fresh screenshots or confirm the relevant Storybook states are updated before the next review round.

5. Repeat with another fresh UX expert sub-agent:
   - Do not resume the previous UX sub-agent.
   - Provide the current implementation and new screenshots/stories.
   - Ask again for a 0-100 score and actionable feedback.

6. Stop the cycle when:
   - The fresh UX review score is 90 or higher, or
   - No important comments remain.

## UX Review Prompt Template

```markdown
You are a senior UX/UI reviewer for jira-helper, a Chrome extension integrated into Jira.

Review this UI surface: [component/feature/page].
User goal: [goal].
Context and constraints:
- Use jira-helper's existing visual patterns where possible.
- Build UI on Ant Design components rather than hand-rolled form/button/layout controls.
- Reuse the person WIP limits user picker for Jira users; extract it to shared when needed by another feature.
- Preserve accessibility and keyboard usability.
- Avoid feedback that requires broad product redesign unless it blocks usability.

Artifacts:
- Screenshots: [paths or omitted]
- Storybook stories: [links/names or omitted]
- Relevant files: [paths]

Return:
1. UX score from 0 to 100.
2. Important issues that should be fixed before stopping the cycle.
3. Nice-to-have improvements.
4. Concrete code-level recommendations where possible.
```

## Reporting

After each round, summarize:

- The UX score.
- Important comments applied.
- Important comments intentionally not applied and why.
- Verification performed.
- Whether the cycle stops or continues.
