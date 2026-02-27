import React, { useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { PersonalWipLimitContainer } from '../PersonalWipLimitContainer';
import { useSettingsUIStore } from '../../stores/settingsUIStore';
import { createPersonLimit, updatePersonLimit } from '../../actions';
import type { SearchUsers } from '../../../../shared/di/jiraApiTokens';
import type { FormData, Column, Swimlane } from '../../state/types';

export type SettingsModalContainerProps = {
  columns: Column[];
  swimlanes: Swimlane[];
  searchUsers: SearchUsers;
  onClose: () => void;
  onSave: () => Promise<void>;
};

export const SettingsModalContainer: React.FC<SettingsModalContainerProps> = ({
  columns,
  swimlanes,
  searchUsers,
  onClose,
  onSave,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLimit = (formData: FormData): void => {
    const store = useSettingsUIStore.getState();

    if (store.data.editingId !== null) {
      const existingLimit = store.data.limits.find(l => l.id === store.data.editingId);
      if (!existingLimit) return;
      const updatedLimit = updatePersonLimit({ existingLimit, formData, columns, swimlanes });
      store.actions.updateLimit(store.data.editingId, updatedLimit);
    } else {
      if (!formData.person) return;
      const personLimit = createPersonLimit({
        formData,
        person: {
          name: formData.person.name,
          displayName: formData.person.displayName,
          self: formData.person.self,
          avatar: formData.person.avatar,
        },
        columns,
        swimlanes,
        id: Date.now(),
      });
      store.actions.addLimit(personLimit);
    }
  };

  return (
    <SettingsModal title="Personal WIP Limit" onClose={onClose} onSave={handleSave} isSaving={isSaving}>
      <PersonalWipLimitContainer
        columns={columns}
        swimlanes={swimlanes}
        searchUsers={searchUsers}
        onAddLimit={handleAddLimit}
      />
    </SettingsModal>
  );
};
