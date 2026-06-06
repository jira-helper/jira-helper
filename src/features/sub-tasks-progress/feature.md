# Sub-tasks progress

Shows stacked progress bars and/or compact counters on board cards for child and linked work—sub-tasks, epic children, issue links, and optional external links—so you can see To Do, In Progress, Done, and Blocked at a glance.

## What it does

- Splits work into **four buckets**: to do, in progress, done, and blocked, based on how you map Jira **statuses** into those buckets (and you can leave some statuses out of the totals).
- Lets you choose **what to count**: for example epic children, sub-tasks, linked issues (with optional restriction by **link type**), and optional “external” linked items—each can be turned on or off.
- Supports **grouping**—for example by project, assignee, or issue type—or custom groupings using a field or a filter, with separate styling for bars vs simple counters.
- Can show **multi-segment bars**, a **single** combined bar, and/or **numeric counters**; you can hide groups when everything is complete or show only incomplete work.
- Optionally treats Jira **flags** and **blocked-by** style links as blocked in the counts and can show **short warning hints** on the card when something relevant is blocked or flagged.
- **Colors** can follow a preset scheme or a custom palette for the segments.

## How to set up

1. Open your Jira board and go to **Jira Helper** board settings.
2. Open the tab **Sub-tasks progress**.
3. Turn the feature on. Use **Reset all settings** if you want to restore this tab’s defaults.
4. Under **columns** (or the equivalent multi-select for tracked columns), choose **which columns show progress on cards**.
5. In the counting section, enable the **sources** you want (epic children, sub-tasks, links, external links, etc.) and link-type filters if offered.
6. Configure **grouping**: default grouping field, any ignored groups, and custom groups (names, what defines the group, bar vs counter, colors, when to hide or show).
7. Map **statuses** to the four progress categories; adjust **colors** if you use custom schemes.
8. Optionally turn on **blocked / flagged** handling and related warnings.

Settings are **per board** in Jira Helper. People who can change Jira Helper settings for that board can save these options.

## Behavior on the board

- In **tracked columns**, each card gets the progress strip and/or counters you configured, grouped as in your settings.
- Blocked and flagged behavior only appears if you enable those options; warning text appears on the card when the rules apply.
