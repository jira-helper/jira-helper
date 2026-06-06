# Card Colors

Makes your Jira **Card Colors** rules easier to see by optionally filling the whole issue card with a soft tint of the same color, not just the thin strip on the left.

## What it does

- Uses the same JQL-based card colors you already set in Jira; only changes how strongly the color shows (full card vs. strip only).
- Applies a light, readable background tint that matches each card’s assigned color.
- Leaves **flagged** cards looking normal so urgency markers stay obvious.
- Leaves cards alone when they already show special highlighting (for example WIP limit warnings), so those warnings stay visible.

## How to set up

1. Open your board.
2. Go to **Board settings** (gear on the board).
3. Open the **Card Colors** tab (the native Jira screen where you define colors with JQL).
4. Above the color rules table, find the **Fill whole card** option (with a short before/after explanation in the tooltip).

Only people who can change board settings—typically **board admins**—can turn this on or off. It is saved with the board like other board settings.

## Behavior on the board

When **Fill whole card** is enabled, each issue card on the board can show a gentle full-card tint that follows your Card Colors rules. The left color strip from Jira remains; the rest of the card gains a matching light background. Flagged cards and cards with certain other highlights keep their normal styling. When the option is off, cards look like standard Jira (strip only).
