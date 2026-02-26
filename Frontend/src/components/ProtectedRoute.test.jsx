import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Mock the Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to}>Redirecting to {to}</div>,
  };
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render children when token exists', () => {
    localStorage.setItem('token', 'test-token');
    
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should redirect to /signin when no token exists', () => {
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/signin');
  });

  it('should redirect to /admin/signin when accessing admin route without token', () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/admin/signin');
  });
});
