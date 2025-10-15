/**
 * Input Component Tests
 * Tests the Input UI component functionality
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../../components/ui/Input';

describe('Input Component', () => {
  it('renders input field', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText(/enter text/i)).toBeInTheDocument();
  });

  it('accepts and displays user input', async () => {
    const user = userEvent.setup();
    render(<Input placeholder="Type here" />);
    
    const input = screen.getByPlaceholderText(/type here/i);
    await user.type(input, 'Hello World');
    
    expect(input).toHaveValue('Hello World');
  });

  it('handles onChange event', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    
    render(<Input onChange={handleChange} placeholder="Test" />);
    
    const input = screen.getByPlaceholderText(/test/i);
    await user.type(input, 'a');
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('renders with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByText(/username/i)).toBeInTheDocument();
  });

  it('shows error message when error prop is provided', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText(/this field is required/i)).toBeInTheDocument();
  });

  it('applies error styles when error exists', () => {
    render(<Input error="Error message" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('renders with left icon', () => {
    const TestIcon = () => <span data-testid="left-icon">Left</span>;
    render(<Input leftIcon={<TestIcon />} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('renders with right icon', () => {
    const TestIcon = () => <span data-testid="right-icon">Right</span>;
    render(<Input rightIcon={<TestIcon />} />);
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
  });

  it('renders with icon prop (alias for leftIcon)', () => {
    const TestIcon = () => <span data-testid="icon">Icon</span>;
    render(<Input icon={<TestIcon />} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('can be disabled', () => {
    render(<Input disabled placeholder="Disabled input" />);
    const input = screen.getByPlaceholderText(/disabled input/i);
    expect(input).toBeDisabled();
  });

  it('accepts different input types', () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    const passwordInput = screen.getByDisplayValue('');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" />);
    expect(screen.getByRole('textbox')).toHaveClass('custom-input');
  });

  it('supports required attribute', () => {
    render(<Input required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('supports maxLength attribute', () => {
    render(<Input maxLength={10} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '10');
  });

  it('supports placeholder text', () => {
    render(<Input placeholder="Enter your email" />);
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
  });

  it('displays helper text when provided', () => {
    render(<Input helperText="This is a helper text" />);
    expect(screen.getByText(/this is a helper text/i)).toBeInTheDocument();
  });

  it('applies full width class when fullWidth prop is true', () => {
    render(<Input fullWidth />);
    const container = screen.getByRole('textbox').parentElement;
    expect(container).toHaveClass('w-full');
  });
});
