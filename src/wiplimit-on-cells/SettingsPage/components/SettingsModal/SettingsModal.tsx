import React from 'react';
import { Modal, Button } from 'antd';

export type SettingsModalProps = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
  onClear: () => void;
  isSaving?: boolean;
  okButtonText?: string;
};

/**
 * SettingsModal - View компонент модального окна для редактирования WIP limits.
 * Обёртка над antd Modal с кнопками Save, Cancel и Clear.
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({
  title,
  children,
  onClose,
  onSave,
  onClear,
  isSaving = false,
  okButtonText = 'Save',
}) => (
  <Modal
    open
    title={title}
    onCancel={onClose}
    width={800}
    maskClosable={false}
    destroyOnClose
    footer={[
      <Button key="clear" onClick={onClear} disabled={isSaving} danger>
        Clear and save all data
      </Button>,
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
