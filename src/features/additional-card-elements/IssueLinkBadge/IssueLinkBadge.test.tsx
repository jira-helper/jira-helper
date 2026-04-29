import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IssueLinkBadge } from './IssueLinkBadge';

describe('IssueLinkBadge', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders issue summary as a semantic browse link', () => {
    render(<IssueLinkBadge color="#0052CC" link="EPIC-123" summary="Миграция на новый API" />);

    const link = screen.getByRole('link', { name: 'Миграция на новый API' });
    expect(link).toHaveAttribute('href', `${window.location.origin}/browse/EPIC-123`);
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('stops propagation when link is clicked', () => {
    const parentClick = vi.fn();
    const windowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);

    render(
      <div onClick={parentClick}>
        <IssueLinkBadge color="#0052CC" link="EPIC-123" summary="Миграция на новый API" />
      </div>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Миграция на новый API' }));

    expect(parentClick).not.toHaveBeenCalled();
    expect(windowOpen).toHaveBeenCalledWith(
      `${window.location.origin}/browse/EPIC-123`,
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('renders plain badge when clickability is disabled', () => {
    render(<IssueLinkBadge color="#0052CC" link="EPIC-123" summary="Миграция на новый API" clickable={false} />);

    expect(screen.queryByRole('link', { name: 'Миграция на новый API' })).not.toBeInTheDocument();
    expect(screen.getByTestId('issue-link-badge-EPIC-123')).toHaveTextContent('Миграция на новый API');
  });
});
