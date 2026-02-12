import React, { useState } from 'react';
import { SettingsModal } from './SettingsModal';
import { PersonalWipLimitContainer } from '../PersonalWipLimitContainer';
import { useSettingsUIStore } from '../../stores/settingsUIStore';
import { createPersonLimit, updatePersonLimit } from '../../actions';
import { getUser } from '../../../../shared/jiraApi';
import type { FormData, Column, Swimlane } from '../../state/types';

export type SettingsModalContainerProps = {
  columns: Column[];
  swimlanes: Swimlane[];
  onClose: () => void;
  onSave: () => Promise<void>;
};

export const SettingsModalContainer: React.FC<SettingsModalContainerProps> = ({
  columns,
  swimlanes,
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

  const handleAddLimit = async (formData: FormData): Promise<void> => {
    const store = useSettingsUIStore.getState();

    if (store.data.editingId !== null) {
      // Edit mode
      const existingLimit = store.data.limits.find(l => l.id === store.data.editingId);
      if (!existingLimit) return;
      const updatedLimit = updatePersonLimit({ existingLimit, formData, columns, swimlanes });
      store.actions.updateLimit(store.data.editingId, updatedLimit);
    } else {
      // Add mode
      const fullPerson = await getUser(formData.personName);
      const personLimit = createPersonLimit({
        formData,
        person: {
          name: fullPerson.name ?? fullPerson.displayName,
          displayName: fullPerson.displayName,
          self: fullPerson.self,
          avatar: fullPerson.avatarUrls['32x32'],
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
      <PersonalWipLimitContainer columns={columns} swimlanes={swimlanes} onAddLimit={handleAddLimit} />
    </SettingsModal>
  );
};
