import React from 'react';
import { Modal, Button } from 'antd';
import styles from './SettingsModal.module.css';

const MODAL_WIDTH = 1040;

export type SettingsModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
  isSaving?: boolean;
  okButtonText?: string;
  cancelButtonText?: string;
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  title,
  children,
  onClose,
  onSave,
  isSaving = false,
  okButtonText = 'Save',
  cancelButtonText = 'Cancel',
}) => (
  <Modal
    open
    title={title}
    onCancel={onClose}
    width={MODAL_WIDTH}
    className={styles.settingsModal}
    maskClosable={false}
    getContainer={false}
    footer={[
      <Button key="cancel" onClick={onClose} disabled={isSaving}>
        {cancelButtonText}
      </Button>,
      <Button key="save" type="primary" onClick={onSave} loading={isSaving}>
        {okButtonText}
      </Button>,
    ]}
  >
    {children}
  </Modal>
);
