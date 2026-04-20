import React from 'react';
import { Modal } from 'antd';

export interface GanttFullscreenModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

/** Full-viewport modal for the Gantt chart; keeps children mounted while toggling visibility (antd destroyOnClose=false). */
export const GanttFullscreenModal: React.FC<GanttFullscreenModalProps> = ({ visible, onClose, children }) => (
  <Modal
    open={visible}
    onCancel={onClose}
    zIndex={1000}
    footer={null}
    width="100vw"
    style={{ top: 0, padding: 0, margin: 0, maxWidth: '100vw' }}
    styles={{
      content: { padding: 0, margin: 0, borderRadius: 0 },
      body: { height: 'calc(100vh - 55px)', overflow: 'auto', padding: 16 },
    }}
    closable
    keyboard
    destroyOnClose={false}
    maskClosable={false}
  >
    {children}
  </Modal>
);
