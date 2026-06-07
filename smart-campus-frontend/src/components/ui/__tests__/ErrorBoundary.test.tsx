import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

const BrokenComponent = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test rendering error');
  }
  return <div>Component loaded successfully</div>;
};

describe('ErrorBoundary Component', () => {
  // Suppress console.error calls from React during expected error boundary testing
  let originalConsoleError: typeof console.error;
  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = vi.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Component loaded successfully')).toBeDefined();
  });

  it('renders fallback UI when children throw a rendering error', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeDefined();
    expect(screen.getByText('An unexpected error occurred while loading this view.')).toBeDefined();
    expect(screen.getByText('Error: Test rendering error')).toBeDefined();
  });

  it('allows resetting error state with Try Again button', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeDefined();

    // Rerender with working props first (still shows fallback because hasError is true)
    rerender(
      <ErrorBoundary>
        <BrokenComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    // Now click Try Again to reset the error state and trigger a successful re-render
    const tryAgainBtn = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainBtn);

    expect(screen.queryByText('Something went wrong')).toBeNull();
    expect(screen.getByText('Component loaded successfully')).toBeDefined();
  });
});
