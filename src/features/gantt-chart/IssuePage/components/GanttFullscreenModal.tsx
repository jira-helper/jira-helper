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
    style={{ top: 0, paddingBottom: 0, margin: 0, maxWidth: '100vw' }}
    styles={{
      mask: { background: 'rgba(9,30,66,0.6)' },
      wrapper: { padding: 0, overflow: 'hidden' },
      content: {
        padding: 0,
        margin: 0,
        borderRadius: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      },
      body: { flex: 1, minHeight: 0, overflow: 'auto', padding: 16 },
    }}
    closable
    keyboard
    destroyOnClose={false}
    maskClosable={false}
  >
    <div
      data-testid="gantt-fullscreen-modal"
      role="document"
      tabIndex={-1}
      onKeyDown={e => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
      style={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </div>
  </Modal>
);
