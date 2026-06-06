import React, { useState, useEffect } from 'react';
import Modal from 'antd/es/modal';
import { Tabs } from 'antd';
import { WithDi } from 'src/infrastructure/di/diContext';
import { globalContainer } from 'dioma';
import { ErrorBoundary } from 'src/shared/components/ErrorBoundary';
import { useGetTextsByLocale } from 'src/shared/texts';
import { Image } from '../../shared/components/Image';
import logoUrl from '../../assets/jira_helper_512x512.png';
import styles from './BoardSettingsComponent.module.css';
import { useBoardSettingsStore } from './stores/boardSettings/boardSettings';
import { BOARD_SETTINGS_TEXTS } from './texts';

const getSidebarWidth = (): number => {
  const resizeHandle = document.querySelector('[data-testid="software-board.resize-sidebar"] input[type="range"]');
  if (resizeHandle) {
    return parseInt((resizeHandle as HTMLInputElement).value, 10);
  }
  const sidebar = document.querySelector('[data-testid="software-board.layout.sidebar"]');
  if (sidebar) {
    return sidebar.getBoundingClientRect().width;
  }
  return 0;
};

const BoardSettingsModalInner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOffset, setSidebarOffset] = useState(0);
  const texts = useGetTextsByLocale(BOARD_SETTINGS_TEXTS);
  const settings = useBoardSettingsStore(state => state.data.settings);

  useEffect(() => {
    if (isModalOpen) {
      const sidebar = document.querySelector('[data-testid="software-board.layout.sidebar"]');
      if (sidebar) {
        const offset = sidebar.getBoundingClientRect().right;
        setSidebarOffset(offset);
      } else {
        setSidebarOffset(0);
      }
    }
  }, [isModalOpen]);

  return (
    <>
      <div className={styles.wrapper} data-jh-component="boardSettingsComponent" onClick={() => setIsModalOpen(true)}>
        <Image src={logoUrl} width={32} height={32} />
      </div>
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onClose={() => setIsModalOpen(false)}
        onOk={() => setIsModalOpen(false)}
        destroyOnClose
        width="auto"
        getContainer={false}
        okText={texts.ok}
        cancelText={texts.cancel}
        styles={{
          wrapper: sidebarOffset > 0 ? { marginLeft: `${sidebarOffset}px` } : {},
        }}
      >
        <Tabs defaultActiveKey="1">
          {settings.map(setting => (
            <Tabs.TabPane tab={setting.title} key={setting.title}>
              <ErrorBoundary fallback={<div>Failed to render tab content</div>}>
                <setting.component />
              </ErrorBoundary>
            </Tabs.TabPane>
          ))}
        </Tabs>
      </Modal>
    </>
  );
};

export const BoardSettingsComponent = () => (
  <WithDi container={globalContainer}>
    <BoardSettingsModalInner />
  </WithDi>
);
