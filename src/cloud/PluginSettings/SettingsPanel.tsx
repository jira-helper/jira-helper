// src/cloud/PluginSettings/SettingsPanel.tsx
// Главная панель настроек плагина Jira Helper (Ant Design)
// Читает табы из useBoardSettingsStore, куда пишут shared модули через registerSettings.

import React, { useState, Component, type ReactNode } from 'react';
import { Tabs } from 'antd';
import { globalContainer } from 'dioma';
import { WithDi } from 'src/infrastructure/di/diContext';
import { useBoardSettingsStore } from 'src/features/board-settings/stores/boardSettings/boardSettings';
import styles from '../ui/settings.module.css';

class TabErrorBoundary extends Component<{ children: ReactNode; tabName: string }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error) {
    console.error(`[SettingsPanel] Tab "${this.props.tabName}" crashed:`, error);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16, color: '#cf222e', fontSize: 13 }}>
          <strong>Ошибка вкладки «{this.props.tabName}»:</strong>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{this.state.error.message}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export const SettingsPanel: React.FC = () => {
  const settings = useBoardSettingsStore(s => s.data.settings);
  const [activeTab, setActiveTab] = useState<string>('');

  const tabs = settings.map(s => ({
    key: s.title,
    label: s.title,
    children: (
      <TabErrorBoundary tabName={s.title}>
        <WithDi container={globalContainer}>
          <s.component />
        </WithDi>
      </TabErrorBoundary>
    ),
  }));

  const current = activeTab || tabs[0]?.key || '';

  if (tabs.length === 0) {
    return (
      <div className={styles.panel}>
        <div style={{ padding: 16, color: '#6b778c', fontSize: 13 }}>Нет настроек для отображения</div>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <Tabs
        activeKey={current}
        onChange={key => setActiveTab(key)}
        items={tabs}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
      />
    </div>
  );
};

export default SettingsPanel;
