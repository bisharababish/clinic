// cypress/support/e2e.ts
// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from failing the test
    if (err.message.includes('ResizeObserver loop limit exceeded')) {
        return false;
    }
    return true;
});

// Add custom commands
declare global {
    interface Chainable {
        loginAs(role: 'admin' | 'patient' | 'doctor' | 'nurse' | 'secretary' | 'lab' | 'xray'): Chainable;
        logout(): Chainable;
    }
}
