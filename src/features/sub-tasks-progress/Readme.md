## Sub-task Progress

### Overview

The **Sub-task Progress** feature enables the display of a progress bar on a Jira issue card. This progress bar visually reflects the completion status of related issues, including:

- Tasks and subtasks within an Epic  
- Subtasks of a task  
- Issues linked to the current issue

The feature queries data directly from the Jira Server. Improper usage may lead to significant load on the server, so it is recommended to use this feature selectively and configure it appropriately.

### Key Features

- **Progress Tracking Across Hierarchies:**  
  Visualize progress for Epics, Tasks, and Sub-tasks based on their child or linked issues.

- **Configurable Column Display:**  
  Progress bars can be enabled for specific columns on the Jira board.

- **Flexible Grouping:**  
  Group and calculate progress by one or more fields, such as:
  - `Project`
  - `Reporter`
  - `Assignee`
  - `Issue Type`
  - And other fields

- **Status Filtering:**  
  Option to exclude certain issue statuses from the progress calculation.

- **Dependency Awareness:**  
  If a sub-task is marked as `is blocked by` another issue or flagged, a warning indicator is shown on the parent task’s card.

### User Story

**As a team lead**, I want to monitor the progress of Epics directly from the board without opening each one. 

I want the ability to group progress by various fields like project, assignee, reporter, or issue type to understand task distribution and performance.  

In our workflow, we link issues that are blocked via the `is blocked by` relation. **As a team lead**, I want to see a visual warning on an issue card if any sub-task is blocked or flagged so I can quickly address bottlenecks.
