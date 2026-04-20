import React, { useState } from 'react';
import Modal from 'antd/es/modal';
import { Tabs } from 'antd';
import { WithDi } from 'src/shared/diContext';
import { globalContainer } from 'dioma';
import { ErrorBoundary } from 'src/shared/components/ErrorBoundary';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { Texts } from 'src/shared/texts';
import { Image } from 'src/shared/components/Image';
import logoUrl from 'src/assets/jira_helper_512x512.png';
import { getIssueSettingsEntry } from './issueSettingsModel';

const ISSUE_SETTINGS_TEXTS = {
  close: { en: 'Close', ru: 'Закрыть' },
} satisfies Texts<'close'>;

const IssueSettingsModalInner: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const texts = useGetTextsByLocale(ISSUE_SETTINGS_TEXTS);
  const { useModel } = getIssueSettingsEntry();
  const { settings } = useModel();

  return (
    <>
      <div
        data-jh-component="issueSettingsButton"
        title="Jira Helper Settings"
        onClick={() => setIsOpen(true)}
        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
      >
        <Image src={logoUrl} width={24} height={24} />
      </div>
      <Modal open={isOpen} onCancel={() => setIsOpen(false)} destroyOnClose width={720} footer={null} zIndex={1000}>
        <Tabs defaultActiveKey="0">
          {settings.map((setting, idx) => (
            <Tabs.TabPane tab={setting.title} key={String(idx)}>
              <ErrorBoundary fallback={<div>Failed to render tab content</div>}>
                <setting.component />
              </ErrorBoundary>
            </Tabs.TabPane>
          ))}
        </Tabs>
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <button className="aui-button" onClick={() => setIsOpen(false)}>
            {texts.close}
          </button>
        </div>
      </Modal>
    </>
  );
};

export const IssueSettingsComponent: React.FC = () => (
  <WithDi container={globalContainer}>
    <IssueSettingsModalInner />
  </WithDi>
);
