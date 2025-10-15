/**
 * useAuth Hook Tests
 * Tests the authentication store functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useAuthStore from '../../hooks/useAuth';

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { logout } = useAuthStore.getState();
    logout();
  });

  it('initializes with no authenticated user', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('logs in a user successfully', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      rollNumber: 'CS2021001',
    };

    act(() => {
      result.current.login(mockUser);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('logs out a user successfully', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    };

    // First login
    act(() => {
      result.current.login(mockUser);
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Then logout
    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('updates user information', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      department: 'Computer Science',
    };

    // Login first
    act(() => {
      result.current.login(mockUser);
    });

    // Update user
    const updatedData = {
      name: 'Updated User',
      department: 'Electronics',
    };

    act(() => {
      result.current.updateUser(updatedData);
    });

    expect(result.current.user.name).toBe('Updated User');
    expect(result.current.user.department).toBe('Electronics');
    expect(result.current.user.email).toBe('test@example.com'); // unchanged
  });

  it('maintains user data across multiple renders', () => {
    const { result, rerender } = renderHook(() => useAuthStore());
    
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    };

    act(() => {
      result.current.login(mockUser);
    });

    rerender();

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockUser);
  });

  it('handles multiple login attempts correctly', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const mockUser1 = { id: 1, name: 'User One', email: 'one@test.com' };
    const mockUser2 = { id: 2, name: 'User Two', email: 'two@test.com' };

    act(() => {
      result.current.login(mockUser1);
    });

    expect(result.current.user).toEqual(mockUser1);

    // Login with different user (should replace)
    act(() => {
      result.current.login(mockUser2);
    });

    expect(result.current.user).toEqual(mockUser2);
    expect(result.current.user.id).toBe(2);
  });

  it('allows partial user updates', () => {
    const { result } = renderHook(() => useAuthStore());
    
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      rollNumber: 'CS2021001',
      department: 'Computer Science',
    };

    act(() => {
      result.current.login(mockUser);
    });

    // Update only one field
    act(() => {
      result.current.updateUser({ department: 'Electronics' });
    });

    expect(result.current.user.department).toBe('Electronics');
    expect(result.current.user.name).toBe('Test User'); // unchanged
    expect(result.current.user.rollNumber).toBe('CS2021001'); // unchanged
  });
});
