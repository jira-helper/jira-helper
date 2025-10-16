import React from 'react';
import { Card, Button, Space, Input, Select } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import { useGetSettings } from '../hooks/useGetSettings';
import { setIssueLinks, clearIssueLinks } from './actions';
import { IssueLink } from '../types';

const TEXTS = {
  issueLinksTitle: {
    en: 'Issue Links',
    ru: 'Связи задач',
  },
  addLinkButton: {
    en: 'Add Link',
    ru: 'Добавить связь',
  },
  clearLinksButton: {
    en: 'Clear all links',
    ru: 'Очистить все связи',
  },
  linkTypeLabel: {
    en: 'Link Type',
    ru: 'Тип связи',
  },
  directionLabel: {
    en: 'Direction',
    ru: 'Направление',
  },
  jqlLabel: {
    en: 'JQL Filter',
    ru: 'JQL фильтр',
  },
  jqlPlaceholder: {
    en: 'Enter JQL query (optional)',
    ru: 'Введите JQL запрос (опционально)',
  },
};

export const IssueLinksSettings: React.FC = () => {
  const texts = useGetTextsByLocale(TEXTS);
  const { settings } = useGetSettings();

  // TODO: Get link types from API
  const linkTypes = [
    { id: '10000', name: 'is Child of' },
    { id: '10001', name: 'is blocked by' },
    { id: '10002', name: 'relates to' },
  ];

  const handleAddLink = () => {
    const newLink: IssueLink = {
      linkType: {
        id: linkTypes[0].id,
        direction: 'inward',
      },
      jql: '',
    };

    setIssueLinks([...settings.issueLinks, newLink]);
  };

  const handleUpdateLink = (index: number, updatedLink: IssueLink) => {
    const updatedLinks = [...settings.issueLinks];
    updatedLinks[index] = updatedLink;
    setIssueLinks(updatedLinks);
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = settings.issueLinks.filter((_, i) => i !== index);
    setIssueLinks(updatedLinks);
  };

  const handleClearLinks = () => {
    clearIssueLinks();
  };

  return (
    <Card title={texts.issueLinksTitle} type="inner">
      <Space direction="vertical" style={{ width: '100%' }}>
        {settings.issueLinks.map((link, index) => (
          <Card key={index} size="small" style={{ marginBottom: '8px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <label>{texts.linkTypeLabel}</label>
                <Select
                  value={link.linkType.id}
                  onChange={value => {
                    const linkType = linkTypes.find(lt => lt.id === value);
                    if (linkType) {
                      handleUpdateLink(index, {
                        ...link,
                        linkType: { ...link.linkType, id: value },
                      });
                    }
                  }}
                  style={{ width: '100%' }}
                >
                  {linkTypes.map(lt => (
                    <Select.Option key={lt.id} value={lt.id}>
                      {lt.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>

              <div>
                <label>{texts.directionLabel}</label>
                <Select
                  value={link.linkType.direction}
                  onChange={value => {
                    handleUpdateLink(index, {
                      ...link,
                      linkType: { ...link.linkType, direction: value },
                    });
                  }}
                  style={{ width: '100%' }}
                >
                  <Select.Option value="inward">Inward</Select.Option>
                  <Select.Option value="outward">Outward</Select.Option>
                </Select>
              </div>

              <div>
                <label>{texts.jqlLabel}</label>
                <Input
                  value={link.jql}
                  onChange={e => {
                    handleUpdateLink(index, {
                      ...link,
                      jql: e.target.value,
                    });
                  }}
                  placeholder={texts.jqlPlaceholder}
                />
              </div>

              <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveLink(index)}>
                Remove
              </Button>
            </Space>
          </Card>
        ))}

        <Space>
          <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddLink}>
            {texts.addLinkButton}
          </Button>

          {settings.issueLinks.length > 0 && (
            <Button danger onClick={handleClearLinks}>
              {texts.clearLinksButton}
            </Button>
          )}
        </Space>
      </Space>
    </Card>
  );
};
