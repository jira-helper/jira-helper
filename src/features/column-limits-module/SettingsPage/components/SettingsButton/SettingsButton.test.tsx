import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsButton } from './SettingsButton';

describe('SettingsButton', () => {
  const defaultLabel = 'Column group WIP limits';

  it('should render with correct text', () => {
    render(<SettingsButton onClick={() => {}} label={defaultLabel} />);
    expect(screen.getByRole('button', { name: defaultLabel })).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<SettingsButton onClick={onClick} label={defaultLabel} />);

    fireEvent.click(screen.getByRole('button', { name: defaultLabel }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<SettingsButton onClick={() => {}} disabled label={defaultLabel} />);
    expect(screen.getByRole('button', { name: defaultLabel })).toBeDisabled();
  });

  it('should have correct id', () => {
    render(<SettingsButton onClick={() => {}} label={defaultLabel} />);
    expect(screen.getByRole('button', { name: defaultLabel })).toHaveAttribute('id', 'jh-add-group-btn');
  });
});
