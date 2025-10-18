// src/test/components/Auth.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Auth from '../../pages/Auth';

// Mock the auth hook
vi.mock('../../hooks/useAuth', () => ({
    useAuth: () => ({
        user: null,
        isLoading: false,
        signIn: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
    }),
}));

describe('Auth Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form by default', () => {
        render(<Auth />);

        expect(screen.getByText(/login/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('switches to register form when clicking register', () => {
        render(<Auth />);

        const registerButton = screen.getByText(/register/i);
        fireEvent.click(registerButton);

        expect(screen.getByText(/create account/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/palestinian id/i)).toBeInTheDocument();
    });

    it('validates email input', async () => {
        render(<Auth />);

        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /login/i });

        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
        });
    });
});
