import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { TemplateImportExportControlsLabels } from './TemplateImportExportControls';
import { TemplateImportExportControls } from './TemplateImportExportControls';

const labels: TemplateImportExportControlsLabels = {
  importFile: 'Import JSON file',
  exportTemplates: 'Export templates',
  importing: 'Importing...',
  importError: 'Import error',
};

function renderControls(overrides: Partial<React.ComponentProps<typeof TemplateImportExportControls>> = {}) {
  const props: React.ComponentProps<typeof TemplateImportExportControls> = {
    isImporting: false,
    importError: null,
    labels,
    onImportFileSelected: vi.fn(),
    onExport: vi.fn(),
    ...overrides,
  };

  render(<TemplateImportExportControls {...props} />);
  return props;
}

describe('TemplateImportExportControls', () => {
  it('passes selected file to onImportFileSelected without reading it', async () => {
    const user = userEvent.setup();
    const onImportFileSelected = vi.fn();
    const file = new File(['{"templates":[]}'], 'templates.json', { type: 'application/json' });
    renderControls({ onImportFileSelected });
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');

    expect(input).toBeTruthy();
    await user.upload(input!, file);

    expect(onImportFileSelected).toHaveBeenCalledTimes(1);
    expect(onImportFileSelected).toHaveBeenCalledWith(file);
  });

  it('calls onExport from export button', async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();
    renderControls({ onExport });

    await user.click(screen.getByRole('button', { name: 'Export templates' }));

    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('disables import and export while importing', () => {
    renderControls({ isImporting: true });

    expect(screen.getByRole('button', { name: 'Importing...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Export templates' })).toBeDisabled();
  });

  it('disables import and export when parent disables controls', () => {
    renderControls({ isDisabled: true });

    expect(screen.getByRole('button', { name: 'Import JSON file' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Export templates' })).toBeDisabled();
  });

  it('renders import error from props', () => {
    renderControls({ importError: 'Invalid JSON' });

    expect(screen.getByRole('alert')).toHaveTextContent('Import error: Invalid JSON');
  });
});
