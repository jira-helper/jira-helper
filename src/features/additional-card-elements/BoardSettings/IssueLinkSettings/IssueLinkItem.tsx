import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Card, Select, Input, Button, ColorPicker, Space, Tooltip, Checkbox } from 'antd';
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
  trackAllTasks: {
    en: 'Track all tasks',
    ru: 'Учитывать все задачи',
  },
  trackAllTasksTooltip: {
    en: 'If enabled, links will be analyzed for all tasks. If disabled, you can configure which tasks to analyze links for.',
    ru: 'Если включено, связи будут анализироваться для всех задач. Если выключено, можно настроить, для каких задач анализировать связи.',
  },
  tasksToAnalyze: {
    en: 'Tasks to analyze links for',
    ru: 'Задачи, для которых анализируем связи',
  },
  trackAllLinkedTasks: {
    en: 'Track all linked tasks',
    ru: 'Учитывать все связанные задачи',
  },
  trackAllLinkedTasksTooltip: {
    en: 'If enabled, all linked tasks will be displayed. If disabled, you can configure which linked tasks to display.',
    ru: 'Если включено, все связанные задачи будут отображаться. Если выключено, можно настроить, какие связанные задачи отображать.',
  },
  linkedTasksToDisplay: {
    en: 'Linked tasks to display',
    ru: 'Связанные задачи для отображения',
  },
  uniqueColors: {
    en: 'Unique colors for tasks',
    ru: 'Уникальные цвета для задач',
  },
  multilineSummary: {
    en: 'Multiline Summary',
    ru: 'Многострочное название',
  },
  multilineSummaryTooltip: {
    en: 'If enabled, long summaries will wrap to multiple lines. Otherwise, they will be truncated with ellipsis.',
    ru: 'Если включено, длинные названия будут переноситься на несколько строк. Иначе они будут обрезаны троеточием.',
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
  uniqueColorsTooltip: {
    en: 'If enabled, each linked issue will have a unique color generated automatically. If disabled, you can set a fixed color for all linked issues.',
    ru: 'Если включено, каждая связанная задача будет иметь уникальный цвет, сгенерированный автоматически. Если выключено, можно установить фиксированный цвет для всех связанных задач.',
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
  // If color is undefined, use unique colors (checkbox checked)
  // If color is set, use fixed color (checkbox unchecked, show ColorPicker)
  const useUniqueColors = link.color === undefined;

  // Local state for link name - updates immediately on user input
  const [linkName, setLinkName] = useState(link.name || '');

  // Track if name field is focused to prevent external updates while user is editing
  const isNameFocused = useRef(false);

  // Store latest values in refs for cleanup on unmount
  const linkNameRef = useRef(linkName);
  const linkRef = useRef(link);
  const onUpdateRef = useRef(onUpdate);

  // Update refs when values change
  useEffect(() => {
    linkRef.current = link;
    onUpdateRef.current = onUpdate;
  }, [link, onUpdate]);

  // Sync local state when link.name prop changes, but only if field is not focused
  useEffect(() => {
    if (!isNameFocused.current && (link.name || '') !== linkName) {
      setLinkName(link.name || '');
      linkNameRef.current = link.name || '';
    }
  }, [link.name, linkName]);

  // Save changes on unmount
  useEffect(() => {
    return () => {
      // On unmount, save current local state if it differs from prop
      if (linkNameRef.current !== (linkRef.current.name || '')) {
        onUpdateRef.current(index, {
          ...linkRef.current,
          name: linkNameRef.current,
        });
      }
    };
  }, [index]);

  const handleNameChange = (name: string) => {
    // Update local state immediately
    setLinkName(name);
    // Update ref synchronously
    linkNameRef.current = name;
  };

  const handleNameBlur = () => {
    isNameFocused.current = false;
    // Update external state only if local value differs from prop
    // Use ref to get the latest value (setState is async)
    const currentName = linkNameRef.current;
    // Use link prop directly (it doesn't change during name editing)
    if (currentName !== (link.name || '')) {
      onUpdate(index, {
        ...link,
        name: currentName,
      });
    }
  };

  const handleNameFocus = () => {
    isNameFocused.current = true;
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

  const handleTrackAllTasksToggle = (checked: boolean) => {
    onUpdate(index, {
      ...link,
      trackAllTasks: checked,
      // Clear issueSelector if trackAllTasks is enabled
      issueSelector: checked ? undefined : link.issueSelector,
    });
  };

  const handleIssueSelectorChange = (issueSelector: any) => {
    onUpdate(index, {
      ...link,
      issueSelector,
      // Ensure trackAllTasks is false when selector is configured
      trackAllTasks: false,
    });
  };

  const handleTrackAllLinkedTasksToggle = (checked: boolean) => {
    onUpdate(index, {
      ...link,
      trackAllLinkedTasks: checked,
      // Clear linkedIssueSelector if trackAllLinkedTasks is enabled
      linkedIssueSelector: checked ? undefined : link.linkedIssueSelector,
    });
  };

  const handleLinkedIssueSelectorChange = (linkedIssueSelector: any) => {
    onUpdate(index, {
      ...link,
      linkedIssueSelector,
      // Ensure trackAllLinkedTasks is false when selector is configured
      trackAllLinkedTasks: false,
    });
  };

  const handleColorChange = (color: string) => {
    onUpdate(index, {
      ...link,
      color,
    });
  };

  const handleUniqueColorsToggle = (checked: boolean) => {
    if (checked) {
      // Enable unique colors - remove fixed color
      onUpdate(index, {
        ...link,
        color: undefined,
      });
    } else if (!link.color) {
      // Disable unique colors - set a default color if none exists
      onUpdate(index, {
        ...link,
        color: '#1677ff', // Default blue color
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

  // Calculate the width of the Select based on the longest option text
  const selectWidth = useMemo(() => {
    if (availableLinkTypes.length === 0) {
      return 200; // Default width
    }

    // Create a temporary canvas element to measure text width
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      return 200;
    }

    // Use a similar font to Ant Design Select
    context.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

    // Find the maximum width among all option texts
    let maxWidth = 0;
    availableLinkTypes.forEach(linkType => {
      const textWidth = context.measureText(linkType.name).width;
      if (textWidth > maxWidth) {
        maxWidth = textWidth;
      }
    });

    // Add padding for dropdown arrow and some extra space (approximately 40px)
    return Math.max(maxWidth + 40, 200);
  }, [availableLinkTypes]);

  return (
    <Card
      size="small"
      style={{ marginBottom: '12px' }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Input
            value={linkName}
            onChange={e => handleNameChange(e.target.value)}
            onFocus={handleNameFocus}
            onBlur={handleNameBlur}
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
      <div style={{ display: 'flex', gap: '16px', flexDirection: 'row', marginBottom: '16px' }}>
        {/* Link Type Selection */}
        <span>
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
              style={{ width: `${selectWidth}px` }}
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
        </span>

        {/* Unique Colors / Fixed Color */}
        <span>
          <div>
            <label
              htmlFor={`issue-link-${index}-unique-colors-checkbox`}
              style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}
            >
              {texts.uniqueColors}
              <Tooltip title={texts.uniqueColorsTooltip}>
                <InfoCircleOutlined style={{ marginLeft: '4px' }} />
              </Tooltip>
            </label>
            <Space>
              <Checkbox
                id={`issue-link-${index}-unique-colors-checkbox`}
                checked={useUniqueColors}
                onChange={e => handleUniqueColorsToggle(e.target.checked)}
                data-testid={`issue-link-${index}-unique-colors-checkbox`}
              >
                {texts.uniqueColors}
              </Checkbox>
              {!useUniqueColors && (
                <ColorPicker
                  value={link.color}
                  onChange={color => handleColorChange(color.toHexString())}
                  data-testid={`issue-link-${index}-color-picker`}
                />
              )}
            </Space>
          </div>
        </span>

        {/* Multiline Summary */}
        <span>
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
        </span>
      </div>

      {/* Row 2: Tasks to analyze links for */}
      <div
        style={{ display: 'flex', gap: '16px', flexDirection: 'row', marginBottom: '16px', alignItems: 'flex-start' }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Checkbox
              id={`issue-link-${index}-track-all-tasks`}
              checked={link.trackAllTasks !== false}
              onChange={e => handleTrackAllTasksToggle(e.target.checked)}
              data-testid={`issue-link-${index}-track-all-tasks`}
            >
              {texts.trackAllTasks}
            </Checkbox>
            <Tooltip title={texts.trackAllTasksTooltip}>
              <InfoCircleOutlined style={{ color: '#1677ff' }} />
            </Tooltip>
          </div>
          {link.trackAllTasks === false && (
            <div>
              <label
                htmlFor={`issue-link-${index}-issue-selector`}
                style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}
              >
                {texts.tasksToAnalyze}
              </label>
              <IssueSelectorByAttributes
                value={link.issueSelector || { mode: 'jql', jql: '' }}
                onChange={handleIssueSelectorChange}
                fields={fields || []}
                testIdPrefix={`issue-link-${index}-issue-selector`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Linked tasks to display */}
      <div
        style={{ display: 'flex', gap: '16px', flexDirection: 'row', marginBottom: '16px', alignItems: 'flex-start' }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Checkbox
              id={`issue-link-${index}-track-all-linked-tasks`}
              checked={link.trackAllLinkedTasks !== false}
              onChange={e => handleTrackAllLinkedTasksToggle(e.target.checked)}
              data-testid={`issue-link-${index}-track-all-linked-tasks`}
            >
              {texts.trackAllLinkedTasks}
            </Checkbox>
            <Tooltip title={texts.trackAllLinkedTasksTooltip}>
              <InfoCircleOutlined style={{ color: '#1677ff' }} />
            </Tooltip>
          </div>
          {link.trackAllLinkedTasks === false && (
            <div>
              <label
                htmlFor={`issue-link-${index}-linked-issue-selector`}
                style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}
              >
                {texts.linkedTasksToDisplay}
              </label>
              <IssueSelectorByAttributes
                value={link.linkedIssueSelector || { mode: 'jql', jql: '' }}
                onChange={handleLinkedIssueSelectorChange}
                fields={fields || []}
                testIdPrefix={`issue-link-${index}-linked-issue-selector`}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
