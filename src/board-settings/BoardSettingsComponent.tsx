import React, { useState } from 'react';
import Modal from 'antd/es/modal';
import { Tabs } from 'antd';
import { WithDi } from 'src/shared/diContext';
import { globalContainer } from 'dioma';
import { ErrorBoundary } from 'src/shared/components/ErrorBoundary';
import { Image } from '../shared/components/Image';
import logoUrl from '../assets/jira_helper_32x32.png';
import styles from './BoardSettingsComponent.module.css';
import { useBoardSettingsStore } from './stores/boardSettings/boardSettings';

export const BoardSettingsComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const settings = useBoardSettingsStore(state => state.data.settings);

  return (
    <WithDi container={globalContainer}>
      <div className={styles.wrapper} onClick={() => setIsModalOpen(true)}>
        <Image src={logoUrl} width={32} height={32} />
      </div>
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onClose={() => setIsModalOpen(false)}
        onOk={() => setIsModalOpen(false)}
        width="auto"
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
    </WithDi>
  );
};
