import './commands';
import '@testing-library/cypress/add-commands';

// Hide XHR requests from command log
const app = window.top;
if (app) {
  app.console.log = () => {};
}

// Add custom commands here
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('uploadVideo', (filePath: string) => {
  cy.get('input[type="file"]').attachFile(filePath);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('waitForJobCompletion', (jobId: string) => {
  cy.intercept('GET', `/api/jobs/${jobId}`).as('getJobStatus');
  cy.wait('@getJobStatus').then((interception) => {
    const status = interception.response?.body.status;
    if (status === 'processing') {
      cy.wait(5000); // Wait 5 seconds before checking again
      cy.waitForJobCompletion(jobId);
    } else if (status === 'failed') {
      throw new Error('Job failed');
    }
  });
}); 