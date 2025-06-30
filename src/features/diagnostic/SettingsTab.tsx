import React from 'react';

import { useDi } from 'src/shared/diContext';
import { loggerToken } from 'src/shared/Logger';
import { Button } from 'antd';
import { saveDiagnosticData } from './actions/saveDiagnosticData';
import { JqlDebugDemo } from './JqlDebugDemo';

export const DiagnosticSettingsTabContent = () => {
  const di = useDi();
  const logger = di.inject(loggerToken);
  const [messages, setMessages] = React.useState(logger.getMessages());
  const [filterText, setFilterText] = React.useState('');

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessages(logger.getMessages());
    }, 5000);
    return () => clearInterval(interval);
  }, [logger]);

  const messagesFiltered = messages.filter(message => {
    return message.message.toLowerCase().includes(filterText);
  });

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Button type="primary" onClick={() => setMessages(logger.getMessages())}>
          Force Refresh
        </Button>
        <span>auto-refresh every 5 seconds</span>
      </div>
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="text"
          placeholder="Filter messages..."
          style={{ padding: '4px 8px', flex: 1 }}
          onChange={e => {
            setFilterText(e.target.value.toLowerCase());
          }}
        />
      </div>
      <div style={{ marginTop: '16px' }}>
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {messagesFiltered.map(message => (
            <div
              key={message.timestamp + Date.now() + Math.random()}
              style={{
                padding: '8px',
                borderBottom: '1px solid #ddd',
                display: 'flex',
                gap: '16px',
              }}
            >
              <div style={{ flex: 1 }}>
                {`${new Date(message.timestamp).toLocaleString()} ${message.level.toUpperCase()}: ${message.message}`}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: '16px' }}>
        <Button type="primary" onClick={saveDiagnosticData}>
          save diagnostic data
        </Button>
      </div>
      <JqlDebugDemo />
    </div>
  );
};
