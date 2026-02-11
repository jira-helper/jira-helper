import React from 'react';
import { Modal, Button } from 'antd';

export type SettingsModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
  isSaving?: boolean;
  okButtonText?: string;
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  title,
  children,
  onClose,
  onSave,
  isSaving = false,
  okButtonText = 'Save',
}) => (
  <Modal
    open
    title={title}
    onCancel={onClose}
    width={800}
    maskClosable={false}
    footer={[
      <Button key="cancel" onClick={onClose} disabled={isSaving}>
        Cancel
      </Button>,
      <Button key="save" type="primary" onClick={onSave} loading={isSaving}>
        {okButtonText}
      </Button>,
    ]}
  >
    {children}
  </Modal>
);
