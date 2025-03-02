import { useShallow } from 'zustand/react/shallow';
import { useJiraSubtasksStore } from 'src/shared/jira/stores/jiraSubtasks/jiraSubtasks';

export const useGetSubtasksForStatusSettings = () => {
  const { data } = useJiraSubtasksStore(
    useShallow(state => {
      return { data: state.data };
    })
  );

  const issues = Object.values(data).flatMap(item => [...(item?.subtasks || []), ...(item?.externalLinks || [])]);

  const statuses: Record<
    number,
    { projects: string[]; name: string; statusCategory: 'new' | 'indeterminate' | 'done' }
  > = {};
  issues.forEach(issue => {
    const project = issue.fields.project.key;
    const statusName = issue.fields.status.name;
    const { statusId } = issue;

    if (!statuses[statusId]) {
      statuses[statusId] = {
        projects: [],
        name: statusName,
        statusCategory: issue.statusCategory,
      };
    }

    if (!statuses[statusId].projects.includes(project)) {
      statuses[statusId].projects.push(project);
    }
  });

  return { statuses };
};
