import React, { useState } from 'react';
import Modal from 'antd/es/modal';
import { Tabs, type TabsProps } from 'antd';
import { WithDi } from 'src/infrastructure/di/diContext';
import { globalContainer } from 'dioma';
import { ErrorBoundary } from 'src/shared/components/ErrorBoundary';
import { useGetTextsByLocale } from 'src/shared/texts';
import { Image } from '../../shared/components/Image';
import logoUrl from '../../assets/jira_helper_512x512.png';
import styles from './BoardSettingsComponent.module.css';
import { useBoardSettingsStore } from './stores/boardSettings/boardSettings';
import { BOARD_SETTINGS_TEXTS } from './texts';

const stickyTabsNavigationStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 2,
  background: 'var(--ant-color-bg-elevated, #fff)',
  boxShadow: '0 1px 0 var(--ant-color-split, rgba(0, 0, 0, 0.06))',
};

export const renderStickySettingsTabBar: TabsProps['renderTabBar'] = (props, DefaultTabBar) => (
  // eslint-disable-next-line local/no-inline-styles -- AntD injects tab nav positioning at runtime; inline style keeps sticky behavior stable in Jira.
  <DefaultTabBar {...props} style={{ ...props.style, ...stickyTabsNavigationStyle }} />
);

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
          body: {
            maxHeight: 'calc(100vh - 160px)',
            overflowY: 'auto',
            paddingTop: 0,
          },
          footer: {
            borderTop: '1px solid var(--ant-color-split, rgba(0, 0, 0, 0.06))',
            marginTop: 0,
            paddingTop: 16,
          },
        }}
      >
        <Tabs
          className="jh-board-settings-tabs"
          data-jh-component="boardSettingsTabs"
          defaultActiveKey={settings[0]?.id}
          renderTabBar={renderStickySettingsTabBar}
        >
          {settings.map(setting => (
            <Tabs.TabPane tab={setting.title} key={setting.id}>
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
