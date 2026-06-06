// src/cloud/ui/SettingsButton.tsx
// Кнопка открытия настроек Jira Helper для Jira Cloud

import React, { useState, useEffect, useRef } from 'react';
import { SettingsPanel } from '../PluginSettings/SettingsPanel';
import styles from './settings.module.css';

const ANT_OVERLAY_SELECTORS = [
  '.ant-popover',
  '.ant-select-dropdown',
  '.ant-color-picker-dropdown',
  '.ant-picker-dropdown',
  '.ant-modal-root',
  '.ant-dropdown',
  '.ant-tabs',
  '.ant-message',
  '.ant-notification',
  '.ant-tooltip',
].join(', ');

export const SettingsButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const popupEl = popupRef.current;
      if (!popupEl) return;

      const path = (event.composedPath?.() ?? []) as EventTarget[];
      if (path.includes(popupEl)) return;

      const target = event.target as Element | null;
      if (target?.closest?.(ANT_OVERLAY_SELECTORS)) return;

      setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown, true);
    document.addEventListener('touchstart', handlePointerDown, true);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown, true);
      document.removeEventListener('touchstart', handlePointerDown, true);
    };
  }, [isOpen]);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={popupRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          padding: '0',
          border: '1px solid #dfe1e6',
          borderRadius: '4px',
          backgroundColor: isOpen ? '#e9f2ff' : '#ffffff',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        title="Jira Helper Settings"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isOpen ? '#0052cc' : '#42526e'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.popup}>
          <div className={styles.header}>
            <span className={styles.title}>Jira Helper</span>
            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
              ×
            </button>
          </div>
          <div className={styles.content}>
            <SettingsPanel />
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsButton;