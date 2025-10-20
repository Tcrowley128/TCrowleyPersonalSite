import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BetaBadge from '../BetaBadge';

describe('BetaBadge', () => {
  it('renders with default size (sm)', () => {
    render(<BetaBadge />);
    const badge = screen.getByText('beta');
    expect(badge).toBeInTheDocument();
  });

  it('renders with small size', () => {
    render(<BetaBadge size="sm" />);
    const badge = screen.getByText('beta');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-xs', 'px-2', 'py-0.5');
  });

  it('renders with medium size', () => {
    render(<BetaBadge size="md" />);
    const badge = screen.getByText('beta');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-sm', 'px-3', 'py-1');
  });

  it('renders with large size', () => {
    render(<BetaBadge size="lg" />);
    const badge = screen.getByText('beta');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('text-base', 'px-4', 'py-1.5');
  });

  it('applies custom className', () => {
    render(<BetaBadge className="custom-class" />);
    const badge = screen.getByText('beta');
    expect(badge).toHaveClass('custom-class');
  });

  it('has correct font family style', () => {
    render(<BetaBadge />);
    const badge = screen.getByText('beta');
    expect(badge).toHaveStyle({ fontFamily: "'Caveat', cursive" });
  });

  it('has correct rotation style', () => {
    render(<BetaBadge />);
    const badge = screen.getByText('beta');
    expect(badge).toHaveStyle({ transform: 'rotate(-8deg)' });
  });

  it('has gradient background', () => {
    render(<BetaBadge />);
    const badge = screen.getByText('beta');
    expect(badge).toHaveStyle({
      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    });
  });

  it('has correct text color', () => {
    render(<BetaBadge />);
    const badge = screen.getByText('beta');
    expect(badge).toHaveStyle({ color: '#78350f' });
  });

  it('has border styling', () => {
    render(<BetaBadge />);
    const badge = screen.getByText('beta');
    expect(badge).toHaveStyle({ border: '1.5px solid #d97706' });
  });
});
