import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { CardColorsSettingsContainer } from './CardColorsSettingsContainer';

describe('CardColorsSettingsContainer', () => {
  const mockProps = {
    getBoardProperty: vi.fn(),
    updateBoardProperty: vi.fn(),
    forceTooltipOpen: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен отображаться с выключенным чекбоксом', async () => {
    mockProps.getBoardProperty.mockResolvedValue({ value: false });

    const { container } = render(<CardColorsSettingsContainer {...mockProps} />);

    await waitFor(() => {
      const checkbox = container.querySelector('input[type="checkbox"]');
      expect(checkbox).not.toBeChecked();
    });
  });

  it('должен отображаться с включенным чекбоксом', async () => {
    mockProps.getBoardProperty.mockResolvedValue({ value: true });

    render(<CardColorsSettingsContainer {...mockProps} />);

    await waitFor(() => {
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeChecked();
    });
  });

  it('должен вызывать updateBoardProperty при клике по чекбоксу', async () => {
    mockProps.getBoardProperty.mockResolvedValue({ value: false });

    render(<CardColorsSettingsContainer {...mockProps} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(mockProps.updateBoardProperty).toHaveBeenCalledWith('card-colors', {
      value: true,
    });
  });
});
