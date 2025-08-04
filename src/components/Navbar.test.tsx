import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Navbar from './Navbar';
import { supabase } from '../supabaseClient';

// Mock the supabase client
vi.mock('../supabaseClient', () => {
  return {
    supabase: {
      auth: {
        signInWithOAuth: vi.fn(),
        signOut: vi.fn(),
      },
    },
  };
});

describe('Navbar Component', () => {
  it('calls Supabase login when the login button is clicked', () => {
    // Render the Navbar in a logged-out state
    render(
      <MemoryRouter>
        <Navbar user={null} />
      </MemoryRouter>
    );

    // Find and click the login button
    const loginButton = screen.getByRole('button', { name: /login with github/i });
    fireEvent.click(loginButton);

    // Assert that the Supabase function was called correctly
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'github',
    });
  });

  it('displays user info and a logout button when a user is logged in', () => {
    const mockUser = {
      id: '123',
      username: 'test-user',
      avatarUrl: 'https://placehold.co/40x40',
    };

    // Render the Navbar in a logged-in state
    render(
      <MemoryRouter>
        <Navbar user={mockUser} />
      </MemoryRouter>
    );

    // Check for user info and logout button
    expect(screen.getByText('test-user')).toBeDefined();
    expect(screen.getByAltText('test-user')).toBeDefined();
    const logoutButton = screen.getByRole('button', { name: /sign out/i });
    expect(logoutButton).toBeDefined();

    // Click the logout button
    fireEvent.click(logoutButton);
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});