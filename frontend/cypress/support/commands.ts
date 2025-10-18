// cypress/support/commands.ts
/// <reference types="cypress" />

// Custom commands for testing
Cypress.Commands.add('loginAs', (role: 'admin' | 'patient' | 'doctor' | 'nurse' | 'secretary' | 'lab' | 'xray') => {
    // Mock authentication for testing
    cy.window().then((win) => {
        win.localStorage.setItem('supabase.auth.token', JSON.stringify({
            access_token: 'mock-token',
            token_type: 'bearer',
            expires_in: 3600,
            refresh_token: 'mock-refresh-token',
            user: {
                id: 'mock-user-id',
                email: `${role}@test.com`,
                role: role,
                aud: 'authenticated',
                created_at: new Date().toISOString(),
            }
        }));
    });

    // Visit the app
    cy.visit('/');
});

Cypress.Commands.add('logout', () => {
    cy.window().then((win) => {
        win.localStorage.removeItem('supabase.auth.token');
    });
    cy.visit('/auth');
});
