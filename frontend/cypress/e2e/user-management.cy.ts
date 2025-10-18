// cypress/e2e/user-management.cy.ts
describe('User Management (Admin)', () => {
    beforeEach(() => {
        cy.loginAs('admin');
        cy.visit('/admin/users');
    });

    it('should display user management interface', () => {
        cy.contains('User Management').should('be.visible');
        cy.get('table').should('be.visible');
    });

    it('should allow searching users', () => {
        cy.get('input[placeholder*="Search"]').type('test@example.com');
        cy.get('table tbody tr').should('have.length.at.least', 1);
    });

    it('should allow editing user roles', () => {
        cy.get('button[aria-label*="Edit"]').first().click();
        cy.get('select').should('be.visible');
        cy.get('button').contains('Save').click();
        cy.contains('User updated successfully').should('be.visible');
    });

    it('should show delete confirmation modal', () => {
        cy.get('button[aria-label*="Delete"]').first().click();
        cy.contains('Are you sure you want to delete this user?').should('be.visible');
        cy.get('button').contains('Cancel').click();
    });
});
