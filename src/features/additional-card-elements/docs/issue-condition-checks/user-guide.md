# Issue Condition Checks

| | |
|---|---|
| Where configured | «Board Settings» → «Additional Card Elements» → «Issue Condition Checks» |
| Where visible | Board (detail view) |
| Settings apply to | For the whole team |

## Purpose

Show configurable icon badges on cards when an issue (or related sub-work) matches a JQL condition, so important states stand out without opening every card.

## How to configure

### Where to find settings

1. Open your board, then **«Jira Helper»** → board settings.
2. Open the **«Additional Card Elements»** tab.

### How to configure

- **Enable the feature**: turn on **«Enable additional card elements»**.
- **Choose columns**: in **«Column Selection»**, pick columns where badges appear.
- **Add a condition check**: in **«Issue Condition Checks»**, click **«Add Condition Check»** and configure:
  - **«Name»** — rule name (required).
  - **«Tooltip Text»** — tooltip shown on hover (required).
  - **«Mode»** — check mode:
    - **«Simple»** — only the card itself is evaluated with JQL.
    - **«With Subtasks»** — one JQL for the issue and another for sub-work.
  - **«JQL»** — query for the issue (or `issueJql` in With Subtasks mode).
  - **«Subtask JQL»** — query for sub-work (With Subtasks only).
  - **«Subtask Match Mode»** — **«any»** (at least one match) or **«all»** (all must match).
  - **«Subtask Sources»** — which sub-work counts: direct sub-tasks, epic children, linked issues.
  - **«Icon»** — icon from the set (⚠️, ✅, 🔥, 🚀, etc.).
  - **«Color»** — optional badge background colour.
  - **«Animation»** — **«None»**, **«Pulse»**, **«Breathe»**, **«Blink»**, **«Blink Fast»**, **«Shake»**.

## How to use

- Icon badges appear at the bottom of cards in selected columns.
- Hover shows the configured tooltip text.
- When animation is enabled, the icon draws extra attention (pulse, blink, shake).
- If a background colour is set, the badge sits on a tinted background.
- In **«With Subtasks»** mode you can evaluate sub-tasks, epic children, or linked issues together with the parent.
- Badges do not appear in the backlog.

## Usage scenarios

1. **Blocked work** — icon 🛑 with JQL `status = Blocked`, Blink animation.
2. **Highest priority** — icon 🔥 with JQL `priority = Highest`.
3. **Unassigned** — icon ⚠️ with JQL `assignee is EMPTY`, yellow background.
4. **Overdue subtasks** — With Subtasks, `subtaskJql: duedate < now()`, icon ⏰, match mode `any`.
5. **All subtasks done** — With Subtasks, `subtaskJql: status = Done`, match mode `all`, icon ✅.

## Troubleshooting

- **Icon missing:** Ensure the rule is enabled, JQL is valid, and the issue matches the condition.
- **JQL errors:** JQL is validated as you type; errors are highlighted in settings.
- **Subtasks ignored:** In With Subtasks mode, check **«Subtask Sources»** and that the issue actually has matching sub-work.
- **Animation subtle:** Some animations (e.g. Breathe) are gentle — try Blink or Shake for a stronger effect.
