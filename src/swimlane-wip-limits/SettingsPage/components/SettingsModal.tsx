import React from 'react';
import { Modal, Alert, Spin } from 'antd';
import { SwimlaneLimitsTable } from './SwimlaneLimitsTable';
import { settingsUIModelToken } from '../../tokens';
import { useDi } from 'src/shared/diContext';
import type { SwimlaneSetting } from '../../types';
import type { SettingsUIModel } from '../models/SettingsUIModel';

export const SettingsModal: React.FC = () => {
  const { model, useModel } = useDi().inject(settingsUIModelToken);
  const snap = useModel();
  const actions = model as SettingsUIModel;

  const handleOk = async () => {
    await actions.save();
  };

  const handleCancel = () => {
    actions.close();
  };

  const handleChange = (swimlaneId: string, update: Partial<SwimlaneSetting>) => {
    actions.updateDraft(swimlaneId, update);
  };

  return (
    <Modal
      title="Swimlane WIP Limits"
      open={snap.isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={snap.isSaving}
      width={600}
      data-testid="settings-modal"
    >
      {snap.isLoading && (
        <div style={{ textAlign: 'center', padding: 20 }} data-testid="settings-modal-loading">
          <Spin />
        </div>
      )}

      {snap.error && <Alert type="error" message={snap.error} style={{ marginBottom: 16 }} data-testid="error-alert" />}

      {!snap.isLoading && (
        <SwimlaneLimitsTable
          swimlanes={snap.swimlanes}
          settings={snap.draft}
          onChange={handleChange}
          disabled={snap.isSaving}
        />
      )}
    </Modal>
  );
};
