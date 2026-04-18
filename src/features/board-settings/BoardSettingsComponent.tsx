import React, { useState } from 'react';
import Modal from 'antd/es/modal';
import { Tabs } from 'antd';
import { WithDi } from 'src/shared/diContext';
import { globalContainer } from 'dioma';
import { ErrorBoundary } from 'src/shared/components/ErrorBoundary';
import { useGetTextsByLocale } from 'src/shared/texts';
import { Image } from '../../shared/components/Image';
import logoUrl from '../../assets/jira_helper_512x512.png';
import styles from './BoardSettingsComponent.module.css';
import { useBoardSettingsStore } from './stores/boardSettings/boardSettings';
import { BOARD_SETTINGS_TEXTS } from './texts';

const BoardSettingsModalInner = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const texts = useGetTextsByLocale(BOARD_SETTINGS_TEXTS);
  const settings = useBoardSettingsStore(state => state.data.settings);

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
          footer: {
            borderTop: '1px solid var(--ant-color-split, rgba(0, 0, 0, 0.06))',
            marginTop: 0,
            paddingTop: 16,
          },
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
