describe('Email Verification', () => {
  beforeEach(() => {
    // Visit the email verification page
    cy.visit('/verify-email');
  });

  it('should display verification message', () => {
    // Verify message is visible
    cy.get('[data-testid="verification-message"]')
      .should('be.visible')
      .and('contain', 'Please verify your email address');

    // Verify instructions are shown
    cy.get('[data-testid="verification-instructions"]')
      .should('be.visible')
      .and('contain', 'Check your inbox for a verification link');
  });

  it('should handle successful verification', () => {
    // Mock verification API
    cy.intercept('GET', '/api/auth/verify-email?token=valid-token', {
      statusCode: 200,
      body: {
        message: 'Email verified successfully'
      }
    }).as('verifyEmail');

    // Visit verification URL
    cy.visit('/verify-email?token=valid-token');

    // Verify success message
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain', 'Email verified successfully');

    // Verify redirect to login
    cy.url().should('include', '/login');
  });

  it('should handle invalid verification token', () => {
    // Mock failed verification API
    cy.intercept('GET', '/api/auth/verify-email?token=invalid-token', {
      statusCode: 400,
      body: {
        error: 'Invalid verification token'
      }
    }).as('verifyEmail');

    // Visit verification URL with invalid token
    cy.visit('/verify-email?token=invalid-token');

    // Verify error message
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Invalid verification token');

    // Verify resend button is visible
    cy.get('[data-testid="resend-button"]')
      .should('be.visible')
      .and('contain', 'Resend verification email');
  });

  it('should allow resending verification email', () => {
    // Mock resend API
    cy.intercept('POST', '/api/auth/resend-verification', {
      statusCode: 200,
      body: {
        message: 'Verification email sent'
      }
    }).as('resendVerification');

    // Click resend button
    cy.get('[data-testid="resend-button"]').click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Verification email sent')
      .and('have.class', 'bg-green-500');
  });

  it('should handle resend rate limiting', () => {
    // Mock rate limited API
    cy.intercept('POST', '/api/auth/resend-verification', {
      statusCode: 429,
      body: {
        error: 'Please wait before requesting another verification email'
      }
    }).as('resendVerification');

    // Click resend button
    cy.get('[data-testid="resend-button"]').click();

    // Verify error message
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Please wait before requesting another verification email');

    // Verify resend button is disabled
    cy.get('[data-testid="resend-button"]')
      .should('be.disabled')
      .and('contain', 'Please wait');
  });

  it('should show countdown timer for resend', () => {
    // Click resend button
    cy.get('[data-testid="resend-button"]').click();

    // Verify countdown starts
    cy.get('[data-testid="countdown-timer"]')
      .should('be.visible')
      .and('contain', '60');

    // Wait for countdown
    cy.wait(1000);

    // Verify countdown updates
    cy.get('[data-testid="countdown-timer"]')
      .should('contain', '59');
  });

  it('should handle expired verification link', () => {
    // Mock expired token API
    cy.intercept('GET', '/api/auth/verify-email?token=expired-token', {
      statusCode: 400,
      body: {
        error: 'Verification link has expired'
      }
    }).as('verifyEmail');

    // Visit verification URL with expired token
    cy.visit('/verify-email?token=expired-token');

    // Verify error message
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Verification link has expired');

    // Verify resend button is visible
    cy.get('[data-testid="resend-button"]')
      .should('be.visible')
      .and('contain', 'Resend verification email');
  });

  it('should show loading state during verification', () => {
    // Mock slow verification API
    cy.intercept('GET', '/api/auth/verify-email?token=valid-token', {
      delay: 1000,
      statusCode: 200,
      body: {
        message: 'Email verified successfully'
      }
    }).as('verifyEmail');

    // Visit verification URL
    cy.visit('/verify-email?token=valid-token');

    // Verify loading indicator
    cy.get('[data-testid="loading-indicator"]')
      .should('be.visible')
      .and('contain', 'Verifying email...');
  });
}); 