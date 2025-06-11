export interface CustomGroup {
  id: number;
  name: string;
  description: string;
  mode: 'field' | 'jql';
  // For 'field' mode:
  fieldId?: string;
  value?: string;
  // For 'jql' mode:
  jql?: string;
  // Common:
  showAsCounter: boolean;
  badgeDoneColor: string;
  badgePendingColor: string;
  hideCompleted: boolean;
}
