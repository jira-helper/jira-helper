Testing Plan for loadSubtasksForIssue.ts
Test Scenarios for loadSubtasksForIssue
1. Basic Functionality Tests


Test: Should not call any loaders when all settings are disabled
GIVEN all settings flags in useSubTaskProgressBoardPropertyStore are set to false
WHEN loadSubtasksForIssue is called with an issue key and abort signal
THEN JiraService.fetchSubtasks should not be called
AND JiraService.getExternalIssues should not be called
AND loadIssue should not be called
AND no changes should occur in useJiraSubtasksStore or useJiraExternalIssuesStore


Test: Should call only subtask loader when only subtask settings are enabled
GIVEN subtask settings (countIssuesSubtasks, countEpicIssues, etc.) in useSubTaskProgressBoardPropertyStore are enabled
AND external links settings are disabled
WHEN loadSubtasksForIssue is called with an issue key and abort signal
THEN loadIssue should be called with the issue key and abort signal
AND JiraService.fetchSubtasks should be called with the issue key and abort signal
AND JiraService.getExternalIssues should not be called
AND useJiraSubtasksStore.actions.startLoadingSubtasks should be called with the issue key
AND useJiraSubtasksStore.actions.addSubtasks should be called with the fetched data
AND no changes should occur in useJiraExternalIssuesStore


Test: Should call only external issues loader when only external links settings are enabled
GIVEN external links settings (countIssuesExternalLinks, etc.) in useSubTaskProgressBoardPropertyStore are enabled
AND subtask settings are disabled
WHEN loadSubtasksForIssue is called with an issue key and abort signal
THEN JiraService.getExternalIssues should be called with the issue key and abort signal
AND JiraService.fetchSubtasks should not be called
AND useJiraExternalIssuesStore.actions.startLoadingExternalIssues should be called with the issue key
AND useJiraExternalIssuesStore.actions.addExternalIssues should be called with the fetched data
AND no changes should occur in useJiraSubtasksStore


Test: Should call both loaders when both types of settings are enabled
GIVEN both subtask and external links settings in useSubTaskProgressBoardPropertyStore are enabled
WHEN loadSubtasksForIssue is called with an issue key and abort signal
THEN loadIssue should be called with the issue key and abort signal
AND JiraService.fetchSubtasks should be called with the issue key and abort signal
AND JiraService.getExternalIssues should be called with the issue key and abort signal
AND useJiraSubtasksStore.actions.startLoadingSubtasks should be called with the issue key
AND useJiraSubtasksStore.actions.addSubtasks should be called with the fetched subtasks data
AND useJiraExternalIssuesStore.actions.startLoadingExternalIssues should be called with the issue key
AND useJiraExternalIssuesStore.actions.addExternalIssues should be called with the fetched external issues data

2. Skip Loading Tests


Test: Should skip loading subtasks if already loaded
GIVEN subtask settings in useSubTaskProgressBoardPropertyStore are enabled
AND useJiraSubtasksStore has data for the issue key with state 'loaded'
WHEN loadSubtasksForIssue is called with the issue key and abort signal
THEN JiraService.fetchSubtasks should not be called
AND useJiraSubtasksStore.actions.startLoadingSubtasks should not be called
AND useJiraSubtasksStore.actions.addSubtasks should not be called
AND the store state for the issue should remain unchanged


Test: Should skip loading subtasks if already loading
GIVEN subtask settings in useSubTaskProgressBoardPropertyStore are enabled
AND useJiraSubtasksStore has data for the issue key with state 'loading'
WHEN loadSubtasksForIssue is called with the issue key and abort signal
THEN JiraService.fetchSubtasks should not be called
AND useJiraSubtasksStore.actions.startLoadingSubtasks should not be called
AND useJiraSubtasksStore.actions.addSubtasks should not be called
AND the store state for the issue should remain unchanged


Test: Should skip loading external issues if already loaded
GIVEN external links settings in useSubTaskProgressBoardPropertyStore are enabled
AND useJiraExternalIssuesStore has data for the issue key with state 'loaded'
WHEN loadSubtasksForIssue is called with the issue key and abort signal
THEN JiraService.getExternalIssues should not be called
AND useJiraExternalIssuesStore.actions.startLoadingExternalIssues should not be called
AND useJiraExternalIssuesStore.actions.addExternalIssues should not be called
AND the store state for the issue should remain unchanged


Test: Should skip loading external issues if already loading
GIVEN external links settings in useSubTaskProgressBoardPropertyStore are enabled
AND useJiraExternalIssuesStore has data for the issue key with state 'loading'
WHEN loadSubtasksForIssue is called with the issue key and abort signal
THEN JiraService.getExternalIssues should not be called
AND useJiraExternalIssuesStore.actions.startLoadingExternalIssues should not be called
AND useJiraExternalIssuesStore.actions.addExternalIssues should not be called
AND the store state for the issue should remain unchanged


3. Error Handling Tests


Test: Should handle errors when loading subtasks
GIVEN subtask settings in useSubTaskProgressBoardPropertyStore are enabled
AND JiraService.fetchSubtasks is mocked to return an error result
WHEN loadSubtasksForIssue is called with an issue key and abort signal
THEN useJiraSubtasksStore.actions.startLoadingSubtasks should be called with the issue key
AND useJiraSubtasksStore.actions.removeSubtasks should be called with the issue key
AND the store state for the issue should reflect the error


Test: Should handle errors when loading external issues
GIVEN external links settings in useSubTaskProgressBoardPropertyStore are enabled
AND JiraService.getExternalIssues is mocked to return an error result
WHEN loadSubtasksForIssue is called with an issue key and abort signal
THEN useJiraExternalIssuesStore.actions.startLoadingExternalIssues should be called with the issue key
AND useJiraExternalIssuesStore.actions.removeExternalIssues should be called with the issue key
AND the store state for the issue should reflect the error


4. Issue Type Specific Tests


Test: Should skip loading external issues for Epic when countEpicExternalLinks is disabled
GIVEN countEpicExternalLinks in useSubTaskProgressBoardPropertyStore is false
AND useJiraIssuesStore has an Epic issue with the given key
WHEN loadSubtasksForIssue is called with the Epic issue key and abort signal
THEN JiraService.getExternalIssues should not be called
AND useJiraExternalIssuesStore.actions.addExternalIssues should be called with an empty array
AND the store state for the issue should show empty external issues


Test: Should skip loading external issues for Task when countIssuesExternalLinks is disabled
GIVEN countIssuesExternalLinks in useSubTaskProgressBoardPropertyStore is false
AND useJiraIssuesStore has a Task issue with the given key
WHEN loadSubtasksForIssue is called with the Task issue key and abort signal
THEN JiraService.getExternalIssues should not be called
AND useJiraExternalIssuesStore.actions.addExternalIssues should be called with an empty array
AND the store state for the issue should show empty external issues


Test: Should skip loading external issues for Sub-task when countSubtasksExternalLinks is disabled
GIVEN countSubtasksExternalLinks in useSubTaskProgressBoardPropertyStore is false
AND useJiraIssuesStore has a Sub-task issue with the given key
WHEN loadSubtasksForIssue is called with the Sub-task issue key and abort signal
THEN JiraService.getExternalIssues should not be called
AND useJiraExternalIssuesStore.actions.addExternalIssues should be called with an empty array
AND the store state for the issue should show empty external issues

5. Issue Loading Tests


Test: Should load issue data if not available for external issues
GIVEN external links settings in useSubTaskProgressBoardPropertyStore are enabled
AND useJiraIssuesStore does not have data for the issue key
WHEN loadSubtasksForIssue is called with the issue key and abort signal
THEN loadIssue should be called with the issue key and abort signal
AND JiraService.getExternalIssues should be called after loadIssue completes
AND useJiraExternalIssuesStore should be updated with the fetched data


Test: Should handle case when issue cannot be loaded for external issues
GIVEN external links settings in useSubTaskProgressBoardPropertyStore are enabled
AND useJiraIssuesStore does not have data for the issue key
AND loadIssue is called but still no issue data is available
WHEN loadSubtasksForIssue is called with the issue key and abort signal
THEN useJiraExternalIssuesStore.actions.addExternalIssues should be called with an empty array
AND the store state should reflect empty external issues