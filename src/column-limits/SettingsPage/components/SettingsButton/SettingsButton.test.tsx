import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsButton } from './SettingsButton';

describe('SettingsButton', () => {
  it('should render with correct text', () => {
    render(<SettingsButton onClick={() => {}} />);
    expect(screen.getByText('Group limits')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<SettingsButton onClick={onClick} />);

    fireEvent.click(screen.getByText('Group limits'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<SettingsButton onClick={() => {}} disabled />);
    expect(screen.getByText('Group limits')).toBeDisabled();
  });

  it('should have correct id', () => {
    render(<SettingsButton onClick={() => {}} />);
    expect(screen.getByText('Group limits')).toHaveAttribute('id', 'jh-add-group-btn');
  });
});
