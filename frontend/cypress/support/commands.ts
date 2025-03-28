/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      uploadVideo(filePath: string): Chainable<void>;
      waitForJobCompletion(jobId: string): Chainable<void>;
    }
  }
}

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands') 