import React, { useState } from 'react';
import Modal from 'antd/es/modal';
import { Tabs } from 'antd';
import { BoardSettingsTabContent } from 'src/sub-tasks-progress/components/BoardSettings/BoardSettingsTabContent';
import { Image } from '../shared/components/Image';
import logoUrl from '../assets/jira_helper_32x32.png';
import styles from './BoardSettingsComponent.module.css';

export const BoardSettingsComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className={styles.wrapper} onClick={() => setIsModalOpen(true)}>
      <Image src={logoUrl} width={32} height={32} />
      <Modal open={isModalOpen} onCancel={() => setIsModalOpen(false)}>
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="General" key="1">
            Content of tab 1
          </Tabs.TabPane>
          <Tabs.TabPane tab="Sub-tasks progress" key="2">
            <BoardSettingsTabContent />
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};
