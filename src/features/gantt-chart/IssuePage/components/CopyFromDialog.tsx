import React, { useCallback, useEffect, useState } from 'react';
import { Button, Modal, Radio, Space } from 'antd';
import { useGetTextsByLocale } from 'src/shared/texts';
import type { Texts } from 'src/shared/texts';

const COPY_FROM_DIALOG_TEXTS = {
  title: {
    en: 'Copy settings from',
    ru: 'Копировать настройки из',
  },
  scopeLegend: {
    en: 'Source scope',
    ru: 'Источник',
  },
  copy: {
    en: 'Copy',
    ru: 'Копировать',
  },
  cancel: {
    en: 'Cancel',
    ru: 'Отмена',
  },
} satisfies Texts<'title' | 'scopeLegend' | 'copy' | 'cancel'>;

export interface CopyFromDialogProps {
  visible: boolean;
  availableScopes: Array<{ key: string; label: string }>;
  onCopy: (sourceKey: string) => void;
  onCancel: () => void;
}

/** Modal to pick another settings scope as the source for «Copy from…». Presentation-only. */
export const CopyFromDialog: React.FC<CopyFromDialogProps> = ({ visible, availableScopes, onCopy, onCancel }) => {
  const texts = useGetTextsByLocale(COPY_FROM_DIALOG_TEXTS);
  const [selectedKey, setSelectedKey] = useState('');

  useEffect(() => {
    if (!visible) {
      return;
    }
    const first = availableScopes[0]?.key ?? '';
    setSelectedKey(prev => (availableScopes.some(s => s.key === prev) ? prev : first));
  }, [visible, availableScopes]);

  const handleCopy = useCallback(() => {
    if (!selectedKey) {
      return;
    }
    onCopy(selectedKey);
  }, [onCopy, selectedKey]);

  return (
    <Modal
      open={visible}
      title={texts.title}
      onCancel={onCancel}
      zIndex={1020}
      width={480}
      maskClosable={false}
      destroyOnClose
      getContainer={false}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          {texts.cancel}
        </Button>,
        <Button key="copy" type="primary" onClick={handleCopy} disabled={!selectedKey}>
          {texts.copy}
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <span>{texts.scopeLegend}</span>
        <Radio.Group value={selectedKey} onChange={e => setSelectedKey(e.target.value)}>
          <Space direction="vertical">
            {availableScopes.map(scope => (
              <Radio key={scope.key} value={scope.key}>
                {scope.label}
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      </Space>
    </Modal>
  );
};
