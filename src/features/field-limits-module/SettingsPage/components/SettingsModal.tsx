/* eslint-disable local/no-inline-styles -- Legacy inline styles; migrate to CSS classes when touching this file. */
import React from 'react';
import { Modal, Alert, Spin } from 'antd';
import { LimitForm } from './LimitForm';
import { LimitsTable } from './LimitsTable';
import { settingsUIModelToken } from '../../tokens';
import { useDi } from 'src/infrastructure/di/diContext';
import { useGetTextsByLocale } from 'src/shared/texts';
import { FIELD_LIMITS_TEXTS } from '../../texts';
import type { SettingsUIModel } from '../models/SettingsUIModel';
import type { LimitFormInput } from '../../types';

export const SettingsModal: React.FC = () => {
  const { model, useModel } = useDi().inject(settingsUIModelToken);
  const snap = useModel();
  const actions = model as SettingsUIModel;
  const texts = useGetTextsByLocale(FIELD_LIMITS_TEXTS);

  const handleOk = async () => {
    await actions.save();
  };

  const handleCancel = () => {
    actions.close();
  };

  const handleAdd = (input: LimitFormInput) => {
    actions.addLimit(input);
  };

  const handleEdit = (input: LimitFormInput) => {
    if (snap.editingLimitKey) {
      actions.updateLimit(snap.editingLimitKey, input);
      actions.setEditingLimitKey(null);
    }
  };

  const handleEditClick = (limitKey: string) => {
    actions.setEditingLimitKey(limitKey);
  };

  const handleDelete = (limitKey: string) => {
    actions.deleteLimit(limitKey);
  };

  const handleColorChange = (limitKey: string, color: string) => {
    actions.setLimitColor(limitKey, color);
  };

  const editingLimit = snap.editingLimitKey ? (snap.draft.limits[snap.editingLimitKey] ?? null) : null;

  return (
    <Modal
      title={texts.modalTitle}
      open={snap.isOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={snap.isSaving}
      destroyOnClose
      width={900}
      data-testid="field-limits-settings-modal"
    >
      {snap.isLoading && (
        <div style={{ textAlign: 'center', padding: 20 }} data-testid="field-limits-modal-loading">
          <Spin />
        </div>
      )}

      {snap.error && (
        <Alert type="error" message={snap.error} style={{ marginBottom: 16 }} data-testid="field-limits-error-alert" />
      )}

      {!snap.isLoading && (
        <>
          <LimitForm
            fields={snap.cardLayoutFields}
            columns={snap.columns}
            swimlanes={snap.swimlanes}
            editingLimit={editingLimit}
            onAdd={handleAdd}
            onEdit={handleEdit}
            disabled={snap.isSaving}
            texts={texts}
          />

          <LimitsTable
            limits={snap.draft.limits}
            columns={snap.columns}
            swimlanes={snap.swimlanes}
            fields={snap.cardLayoutFields}
            onEdit={handleEditClick}
            onDelete={handleDelete}
            onColorChange={handleColorChange}
            texts={texts}
          />
        </>
      )}
    </Modal>
  );
};
