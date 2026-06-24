// src/cloud/features/assignee-highlighter/AssigneeHighlighterSettings.tsx
// React-компонент настроек подсветки исполнителей (Ant Design)

import React, { useState, useEffect } from 'react';
import { Switch, Radio, Checkbox, ColorPicker, Typography, Card, Space, Row, Col } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { cloudContainer } from '../../shared/di';
import { settingsServiceToken, assigneeServiceToken } from '../../shared/di/tokens';
import type { AssigneeHighlightSettings } from '../../shared/SettingsService';
import type { Assignee } from '../../shared/AssigneeService';

const { Title } = Typography;
type VisualizationType = 'stripe' | 'background' | 'border';

export const AssigneeHighlighterSettings: React.FC = () => {
  const [enabled, setEnabled] = useState(false);
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('stripe');
  const [autoColors, setAutoColors] = useState(true);
  const [highlightUnassigned, setHighlightUnassigned] = useState(true);
  const [unassignedColor, setUnassignedColor] = useState('rgba(0, 0, 0, 0.5)');
  const [availableAssignees, setAvailableAssignees] = useState<Assignee[]>([]);
  const [customColors, setCustomColors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSettings();
    loadData();
  }, []);

  const loadSettings = () => {
    const settingsService = cloudContainer.inject(settingsServiceToken);
    const settings = settingsService.getSettings();
    setEnabled(settings.assigneeHighlight?.enabled || false);
    setVisualizationType(settings.assigneeHighlight?.visualizationType || 'stripe');
    setAutoColors(settings.assigneeHighlight?.autoColors !== false);
    setHighlightUnassigned(settings.assigneeHighlight?.highlightUnassigned !== false);
    setUnassignedColor(settings.assigneeHighlight?.unassignedColor || 'rgba(0, 0, 0, 0.5)');
    setCustomColors(settings.assigneeHighlight?.customColors || {});
  };

  const loadData = () => {
    const assigneeService = cloudContainer.inject(assigneeServiceToken);
    setAvailableAssignees(assigneeService.getAllAssigneesFromCards());
  };

  const handleToggleEnabled = (checked: boolean) => {
    setEnabled(checked);
    updateSettings({ enabled: checked });
  };

  const handleVisualizationTypeChange = (type: VisualizationType) => {
    setVisualizationType(type);
    updateSettings({ visualizationType: type });
  };

  const handleAutoColorsToggle = (checked: boolean) => {
    setAutoColors(checked);
    updateSettings({ autoColors: checked });
  };

  const handleHighlightUnassignedToggle = (checked: boolean) => {
    setHighlightUnassigned(checked);
    updateSettings({ highlightUnassigned: checked });
  };

  const handleUnassignedColorChange = (color: Color) => {
    const hex = color.toHexString();
    setUnassignedColor(hex);
    updateSettings({ unassignedColor: hex });
  };

  const handleCustomColorChange = (assigneeId: string, color: Color) => {
    const hex = color.toHexString();
    const newCustomColors = { ...customColors, [assigneeId]: hex };
    setCustomColors(newCustomColors);
    updateSettings({ customColors: newCustomColors });
  };

  const updateSettings = (updates: Partial<AssigneeHighlightSettings>) => {
    const settingsService = cloudContainer.inject(settingsServiceToken);
    const currentSettings = settingsService.getSettings();
    settingsService.updateSettings({
      assigneeHighlight: {
        ...currentSettings.assigneeHighlight,
        ...updates,
      },
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Подсветка исполнителей</Title>

      <div style={{ marginBottom: '20px' }}>
        <Switch
          checked={enabled}
          onChange={handleToggleEnabled}
          checkedChildren="Включено"
          unCheckedChildren="Выключено"
        />
        <span style={{ marginLeft: '8px' }}>Включить подсветку исполнителей</span>
      </div>

      {enabled && (
        <>
          <Card title="Тип визуализации" style={{ marginBottom: '20px' }}>
            <Radio.Group value={visualizationType} onChange={e => handleVisualizationTypeChange(e.target.value)}>
              <Space>
                <Radio value="stripe">Полоска слева</Radio>
                <Radio value="background">Цвет фона</Radio>
                <Radio value="border">Рамка</Radio>
              </Space>
            </Radio.Group>
          </Card>

          <Card title="Настройки" style={{ marginBottom: '20px' }}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Checkbox checked={autoColors} onChange={e => handleAutoColorsToggle(e.target.checked)}>
                  Автоматические цвета
                </Checkbox>
              </div>

              <div>
                <Checkbox
                  checked={highlightUnassigned}
                  onChange={e => handleHighlightUnassignedToggle(e.target.checked)}
                >
                  Подсвечивать "Не назначено"
                </Checkbox>
              </div>

              {highlightUnassigned && (
                <div>
                  <label>Цвет для "Не назначено":</label>
                  <ColorPicker
                    value={unassignedColor}
                    onChange={handleUnassignedColorChange}
                    style={{ marginLeft: '10px' }}
                  />
                </div>
              )}
            </Space>
          </Card>

          {!autoColors && (
            <Card title="Кастомные цвета" style={{ marginBottom: '20px' }}>
              {availableAssignees.length === 0 ? (
                <p>Нет назначенных исполнителей на доске</p>
              ) : (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {availableAssignees.map(assignee => (
                    <Row key={assignee.id} align="middle" gutter={16}>
                      <Col span={6}>{assignee.name}</Col>
                      <Col span={4}>
                        <ColorPicker
                          value={customColors[assignee.id] || assignee.color || '#808080'}
                          onChange={color => handleCustomColorChange(assignee.id, color)}
                          size="small"
                        />
                      </Col>
                      <Col span={2}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: customColors[assignee.id] || assignee.color || '#808080',
                            border: '1px solid #d9d9d9',
                          }}
                        />
                      </Col>
                    </Row>
                  ))}
                </Space>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default AssigneeHighlighterSettings;
