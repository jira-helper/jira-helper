export interface IssueSelector {
  mode: 'field' | 'jql';
  fieldId?: string; // ID поля для режима 'field'
  value?: string; // Значение поля для режима 'field'
  jql?: string; // JQL запрос для режима 'jql'
}

export interface IssueSelectorByAttributesProps {
  value: IssueSelector;
  onChange: (selector: IssueSelector) => void;
  fields: Array<{ id: string; name: string }>;
  mode?: 'field' | 'jql';
  disabled?: boolean;
  testIdPrefix?: string;
}
