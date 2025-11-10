import React, { useState } from 'react';
import { Card, Select, Input, Button, ColorPicker, Space, Tooltip, Row, Col, Checkbox } from 'antd';
import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useGetTextsByLocale } from 'src/shared/texts';
import { IssueSelectorByAttributes } from 'src/shared/components/IssueSelectorByAttributes';
import { useGetFields } from 'src/shared/jira/fields/useGetFields';
import { IssueLink } from '../../types';

export const TEXTS = {
  linkName: {
    en: 'Link Name',
    ru: 'Название связи',
  },
  linkType: {
    en: 'Link Type',
    ru: 'Тип связи',
  },
  issueSelector: {
    en: 'Issue Selector',
    ru: 'Селектор задач',
  },
  customColor: {
    en: 'Custom Color',
    ru: 'Кастомный цвет',
  },
  multilineSummary: {
    en: 'Multiline Summary',
    ru: 'Многострочное описание',
  },
  multilineSummaryTooltip: {
    en: 'If enabled, long summaries will wrap to multiple lines. Otherwise, they will be truncated with ellipsis.',
    ru: 'Если включено, длинные описания будут переноситься на несколько строк. Иначе они будут обрезаны троеточием.',
  },
  removeLink: {
    en: 'Remove',
    ru: 'Удалить',
  },
  linkNamePlaceholder: {
    en: 'Enter link name (e.g., "Parent Tasks")',
    ru: 'Введите название связи (например, "Родительские задачи")',
  },
  linkNameTooltip: {
    en: 'Human-readable name for this link configuration',
    ru: 'Человекочитаемое название для этой настройки связи',
  },
  linkTypeTooltip: {
    en: 'Select the type of link to display',
    ru: 'Выберите тип связи для отображения',
  },
  issueSelectorTooltip: {
    en: 'Configure which issues to show for this link',
    ru: 'Настройте, какие задачи показывать для этой связи',
  },
  colorTooltip: {
    en: 'Custom color for the link badge',
    ru: 'Кастомный цвет для плашки связи',
  },
} as const;

interface IssueLinkItemProps {
  link: IssueLink;
  index: number;
  onUpdate: (index: number, updatedLink: IssueLink) => void;
  onRemove: (index: number) => void;
  availableLinkTypes: Array<{ id: string; name: string; direction: 'inward' | 'outward' }>;
}

export const IssueLinkItem: React.FC<IssueLinkItemProps> = ({
  link,
  index,
  onUpdate,
  onRemove,
  availableLinkTypes,
}) => {
  const texts = useGetTextsByLocale(TEXTS);
  const [useCustomColor, setUseCustomColor] = useState(!!link.color);

  const handleNameChange = (name: string) => {
    onUpdate(index, {
      ...link,
      name,
    });
  };

  const handleLinkTypeChange = (linkTypeKey: string) => {
    const [id, direction] = linkTypeKey.split('|');
    const linkType = availableLinkTypes.find(lt => lt.id === id && lt.direction === direction);
    if (linkType) {
      onUpdate(index, {
        ...link,
        linkType: {
          id,
          direction: direction as 'inward' | 'outward',
        },
      });
    }
  };

  const handleIssueSelectorChange = (issueSelector: any) => {
    onUpdate(index, {
      ...link,
      issueSelector,
    });
  };

  const handleColorChange = (color: string) => {
    onUpdate(index, {
      ...link,
      color,
    });
  };

  const handleCustomColorToggle = (checked: boolean) => {
    setUseCustomColor(checked);
    if (!checked) {
      onUpdate(index, {
        ...link,
        color: undefined,
      });
    }
  };

  const handleMultilineSummaryToggle = (checked: boolean) => {
    onUpdate(index, {
      ...link,
      multilineSummary: checked,
    });
  };

  const { fields } = useGetFields();

  return (
    <Card
      size="small"
      style={{ marginBottom: '12px' }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Input
            value={link.name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder={texts.linkNamePlaceholder}
            data-testid={`issue-link-${index}-name`}
            style={{ width: '120px' }}
            size="small"
            maxLength={20}
          />
          <Tooltip title={texts.linkNameTooltip}>
            <InfoCircleOutlined style={{ color: '#1677ff' }} />
          </Tooltip>
        </div>
      }
      extra={
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => onRemove(index)}
          data-testid={`issue-link-${index}-remove`}
        >
          {texts.removeLink}
        </Button>
      }
    >
      {/* Row 1: Link Type and Color */}
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: '16px' }}>
        {/* Link Type Selection */}
        <Col xs={24} sm={12} md={8}>
          <div>
            <label
              htmlFor={`issue-link-${index}-type`}
              style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}
            >
              {texts.linkType}
              <Tooltip title={texts.linkTypeTooltip}>
                <InfoCircleOutlined style={{ marginLeft: '4px' }} />
              </Tooltip>
            </label>
            <Select
              id={`issue-link-${index}-type`}
              style={{ width: '100%' }}
              value={`${link.linkType.id}|${link.linkType.direction}`}
              onChange={handleLinkTypeChange}
              placeholder="Select link type"
              data-testid={`issue-link-${index}-type`}
            >
              {availableLinkTypes.map(linkType => (
                <Select.Option key={linkType.id + linkType.direction} value={`${linkType.id}|${linkType.direction}`}>
                  {linkType.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </Col>

        {/* Custom Color */}
        <Col xs={24} sm={12} md={6}>
          <div>
            <label
              htmlFor={`issue-link-${index}-custom-color-checkbox`}
              style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}
            >
              {texts.customColor}
              <Tooltip title={texts.colorTooltip}>
                <InfoCircleOutlined style={{ marginLeft: '4px' }} />
              </Tooltip>
            </label>
            <Space>
              <Checkbox
                id={`issue-link-${index}-custom-color-checkbox`}
                checked={useCustomColor}
                onChange={e => handleCustomColorToggle(e.target.checked)}
                data-testid={`issue-link-${index}-custom-color-checkbox`}
              />
              {useCustomColor && (
                <ColorPicker
                  value={link.color}
                  onChange={color => handleColorChange(color.toHexString())}
                  data-testid={`issue-link-${index}-color-picker`}
                />
              )}
            </Space>
          </div>
        </Col>

        {/* Multiline Summary */}
        <Col xs={24} sm={12} md={6}>
          <div>
            <label
              htmlFor={`issue-link-${index}-multiline-summary-checkbox`}
              style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}
            >
              {texts.multilineSummary}
              <Tooltip title={texts.multilineSummaryTooltip}>
                <InfoCircleOutlined style={{ marginLeft: '4px' }} />
              </Tooltip>
            </label>
            <Checkbox
              id={`issue-link-${index}-multiline-summary-checkbox`}
              checked={link.multilineSummary || false}
              onChange={e => handleMultilineSummaryToggle(e.target.checked)}
              data-testid={`issue-link-${index}-multiline-summary-checkbox`}
            />
          </div>
        </Col>
      </Row>

      {/* Row 2: Issue Selector */}
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24}>
          <div>
            <label
              htmlFor={`issue-link-${index}-selector`}
              style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}
            >
              {texts.issueSelector}
              <Tooltip title={texts.issueSelectorTooltip}>
                <InfoCircleOutlined style={{ marginLeft: '4px' }} />
              </Tooltip>
            </label>
            <IssueSelectorByAttributes
              value={link.issueSelector || { mode: 'jql', jql: '' }}
              onChange={handleIssueSelectorChange}
              fields={fields || []}
              testIdPrefix={`issue-link-${index}-selector`}
            />
          </div>
        </Col>
      </Row>
    </Card>
  );
};
