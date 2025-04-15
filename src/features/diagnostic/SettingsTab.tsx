import React from 'react';

import { useDi } from 'src/shared/diContext';
import { loggerToken } from 'src/shared/Logger';
import { Button } from 'antd';
import { saveDiagnosticData } from './actions/saveDiagnosticData';

export const DiagnosticSettingsTabContent = () => {
  const di = useDi();
  const logger = di.inject(loggerToken);
  const [messages, setMessages] = React.useState(logger.getMessages());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessages(logger.getMessages());
    }, 5000);
    return () => clearInterval(interval);
  }, [logger]);

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Button type="primary" onClick={() => setMessages(logger.getMessages())}>
          Force Refresh
        </Button>
        <span>auto-refresh every 5 seconds</span>
      </div>
      <div style={{ marginTop: '16px' }}>
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {messages.map(message => (
            <div
              key={message.timestamp + message.level + message.message}
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
    </div>
  );
};
