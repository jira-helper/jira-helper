import React from 'react';
import { useGetFields } from 'src/shared/jira/fields/useGetFields';
import { useGetSettings } from 'src/features/sub-tasks-progress/SubTaskProgressSettings/hooks/useGetSettings';
import { CustomGroupSettings } from './CustomGroupSettings';
import { addCustomGroup, updateCustomGroup, removeCustomGroup } from './actions';

export const CustomGroupSettingsContainer: React.FC = () => {
  const { fields, isLoading } = useGetFields();

  const fieldsMapped = fields.map(f => ({
    id: f.id,
    name: f.name,
  }));

  const { settings } = useGetSettings();
  const { customGroups } = settings;
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <CustomGroupSettings
      groups={customGroups}
      fields={fieldsMapped}
      onAddGroup={addCustomGroup}
      onUpdateGroup={updateCustomGroup}
      onRemoveGroup={removeCustomGroup}
    />
  );
};
