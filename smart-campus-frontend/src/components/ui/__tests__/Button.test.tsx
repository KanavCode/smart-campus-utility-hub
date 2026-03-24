import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button } from '../button';

describe('Button Component', () => {
  it('renders button with text', () => {
    const { getByText } = render(<Button>Click me</Button>);
    expect(getByText('Click me')).toBeDefined();
  });

  it('applies variant classes correctly', () => {
    const { container } = render(<Button variant="outline">Outline Button</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('outline');
  });

  it('applies size classes correctly', () => {
    const { container } = render(<Button size="lg">Large Button</Button>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('h-11');
    expect(button?.className).toContain('px-8');
  });

  it('handles disabled state', () => {
    const { container } = render(<Button disabled>Disabled</Button>);
    const button = container.querySelector('button');
    expect(button?.disabled).toBe(true);
  });
});
