import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminRoute from './AdminRoute';

// Mock the Navigate component
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }) => <div data-testid="navigate" data-to={to}>Redirecting to {to}</div>,
  };
});

describe('AdminRoute', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should redirect to /admin/signin when no token exists', () => {
    render(
      <MemoryRouter>
        <AdminRoute>
          <div data-testid="admin-content">Admin Content</div>
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/admin/signin');
  });

  it('should render children when token and Admin accessLevel exist', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('profile', JSON.stringify({ accessLevel: 'Admin' }));
    
    render(
      <MemoryRouter>
        <AdminRoute>
          <div data-testid="admin-content">Admin Content</div>
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
  });

  it('should redirect to / when user is not Admin', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('profile', JSON.stringify({ accessLevel: 'User' }));
    
    render(
      <MemoryRouter>
        <AdminRoute>
          <div data-testid="admin-content">Admin Content</div>
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');
  });

  it('should handle invalid profile JSON', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('profile', 'invalid-json');
    
    render(
      <MemoryRouter>
        <AdminRoute>
          <div data-testid="admin-content">Admin Content</div>
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');
  });

  it('should handle missing profile', () => {
    localStorage.setItem('token', 'test-token');
    
    render(
      <MemoryRouter>
        <AdminRoute>
          <div data-testid="admin-content">Admin Content</div>
        </AdminRoute>
      </MemoryRouter>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/');
  });
});
