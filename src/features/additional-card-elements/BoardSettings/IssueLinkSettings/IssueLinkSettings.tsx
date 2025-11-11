import React from 'react';
import { Card, Button, Space, Divider, Alert, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import { useGetIssueLinkTypes } from 'src/shared/jira/stores/useGetIssueLinkTypes';
import { useAdditionalCardElementsBoardPropertyStore } from '../../stores/additionalCardElementsBoardProperty';
import { IssueLinkItem } from './IssueLinkItem';
import { IssueLink } from '../../types';

export const TEXTS = {
  issueLinksTitle: {
    en: 'Issue Link Configurations',
    ru: 'Настройки связей задач',
  },
  issueLinksDescription: {
    en: 'Configure how related issues are displayed on cards. You can specify link types, directions, JQL filters, and custom colors.',
    ru: 'Настройте, как связанные задачи отображаются на карточках. Вы можете указать типы связей, направления, JQL фильтры и кастомные цвета.',
  },
  addLink: {
    en: 'Add Link Configuration',
    ru: 'Добавить настройку связи',
  },
  clearAll: {
    en: 'Clear All Configurations',
    ru: 'Очистить все настройки',
  },
  noLinksConfigured: {
    en: 'No link configurations yet. Click "Add Link Configuration" to get started.',
    ru: 'Пока нет настроек связей. Нажмите "Добавить настройку связи" чтобы начать.',
  },
  loadingLinkTypes: {
    en: 'Loading available link types...',
    ru: 'Загрузка доступных типов связей...',
  },
  errorLoadingLinkTypes: {
    en: 'Failed to load link types. Please refresh the page.',
    ru: 'Не удалось загрузить типы связей. Пожалуйста, обновите страницу.',
  },
} as const;

export const IssueLinkSettings: React.FC = () => {
  const texts = useGetTextsByLocale(TEXTS);
  const { data, actions } = useAdditionalCardElementsBoardPropertyStore();
  const { linkTypes, isLoading, error } = useGetIssueLinkTypes();

  // Transform Jira link types to our format
  const availableLinkTypes = linkTypes
    .map(linkType => [
      { id: linkType.id, name: linkType.outward, direction: 'outward' as const },
      { id: linkType.id, name: linkType.inward, direction: 'inward' as const },
    ])
    .flat();

  const handleAddLink = () => {
    const linkNumber = data.issueLinks.length + 1;
    const newLink: IssueLink = {
      name: `Link ${linkNumber}`,
      linkType: { id: availableLinkTypes[0]?.id || '', direction: availableLinkTypes[0]?.direction || 'inward' },
      trackAllTasks: true, // Default: analyze links for all tasks
      trackAllLinkedTasks: true, // Default: show all linked tasks
    };
    actions.addIssueLink(newLink);
  };

  const handleUpdateLink = (index: number, updatedLink: IssueLink) => {
    actions.updateIssueLink(index, updatedLink);
  };

  const handleRemoveLink = (index: number) => {
    actions.removeIssueLink(index);
  };

  const handleClearAll = () => {
    actions.clearIssueLinks();
  };

  if (isLoading) {
    return (
      <Card title={texts.issueLinksTitle} style={{ marginBottom: '16px' }} type="inner">
        <Spin tip={texts.loadingLinkTypes} />
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={texts.issueLinksTitle} style={{ marginBottom: '16px' }} type="inner">
        <Alert message={texts.errorLoadingLinkTypes} type="error" />
      </Card>
    );
  }

  return (
    <Card title={texts.issueLinksTitle} style={{ marginBottom: '16px' }} type="inner">
      <p style={{ marginBottom: '16px' }}>{texts.issueLinksDescription}</p>

      <Space direction="vertical" style={{ width: '100%' }}>
        {data.issueLinks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>{texts.noLinksConfigured}</div>
        ) : (
          data.issueLinks.map((link, index) => {
            const uniqueKey = `${link.linkType.id}-${link.linkType.direction}-${link.issueSelector?.jql || ''}-${link.name || 'unnamed'}`;
            return (
              <IssueLinkItem
                key={uniqueKey}
                link={link}
                index={index}
                onUpdate={handleUpdateLink}
                onRemove={handleRemoveLink}
                availableLinkTypes={availableLinkTypes}
              />
            );
          })
        )}

        <Divider />

        <Space>
          <Button type="dashed" onClick={handleAddLink} icon={<PlusOutlined />} data-testid="add-issue-link-button">
            {texts.addLink}
          </Button>

          {data.issueLinks.length > 0 && (
            <Button type="default" onClick={handleClearAll} danger data-testid="clear-all-issue-links-button">
              {texts.clearAll}
            </Button>
          )}
        </Space>
      </Space>
    </Card>
  );
};
