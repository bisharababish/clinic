// cypress/e2e/auth.cy.ts
describe('Authentication Flow', () => {
    beforeEach(() => {
        cy.visit('/auth');
    });

    it('should display login form by default', () => {
        cy.contains('Login').should('be.visible');
        cy.get('input[type="email"]').should('be.visible');
        cy.get('input[type="password"]').should('be.visible');
    });

    it('should switch to register form', () => {
        cy.contains('Register').click();
        cy.contains('Create Account').should('be.visible');
        cy.get('input[placeholder*="Palestinian ID"]').should('be.visible');
    });

    it('should validate email format', () => {
        cy.get('input[type="email"]').type('invalid-email');
        cy.get('button[type="submit"]').click();
        cy.contains('Invalid email').should('be.visible');
    });

    it('should validate password requirements', () => {
        cy.get('input[type="password"]').type('123');
        cy.get('button[type="submit"]').click();
        cy.contains('Password must be at least 8 characters').should('be.visible');
    });
});
