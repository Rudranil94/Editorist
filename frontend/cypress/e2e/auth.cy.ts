describe('Authentication', () => {
  beforeEach(() => {
    // Visit the login page
    cy.visit('/login');
  });

  it('should allow user login', () => {
    // Mock login API
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'test-token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User'
        }
      }
    }).as('login');

    // Fill in login form
    cy.get('[data-testid="email-input"]')
      .type('test@example.com');
    cy.get('[data-testid="password-input"]')
      .type('password123');

    // Click login button
    cy.get('[data-testid="login-button"]').click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Login successful')
      .and('have.class', 'bg-green-500');

    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should validate login form', () => {
    // Try to submit empty form
    cy.get('[data-testid="login-button"]').click();

    // Verify validation messages
    cy.get('[data-testid="email-error"]')
      .should('be.visible')
      .and('contain', 'Email is required');
    cy.get('[data-testid="password-error"]')
      .should('be.visible')
      .and('contain', 'Password is required');
  });

  it('should handle invalid credentials', () => {
    // Mock failed login API
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: {
        error: 'Invalid credentials'
      }
    }).as('login');

    // Fill in login form with invalid credentials
    cy.get('[data-testid="email-input"]')
      .type('wrong@example.com');
    cy.get('[data-testid="password-input"]')
      .type('wrongpassword');

    // Click login button
    cy.get('[data-testid="login-button"]').click();

    // Verify error message
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Invalid credentials');
  });

  it('should allow user registration', () => {
    // Mock registration API
    cy.intercept('POST', '/api/auth/register', {
      statusCode: 200,
      body: {
        message: 'Registration successful'
      }
    }).as('register');

    // Click register link
    cy.get('[data-testid="register-link"]').click();

    // Fill in registration form
    cy.get('[data-testid="name-input"]')
      .type('New User');
    cy.get('[data-testid="email-input"]')
      .type('new@example.com');
    cy.get('[data-testid="password-input"]')
      .type('password123');
    cy.get('[data-testid="confirm-password-input"]')
      .type('password123');

    // Click register button
    cy.get('[data-testid="register-button"]').click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Registration successful')
      .and('have.class', 'bg-green-500');

    // Verify redirect to login page
    cy.url().should('include', '/login');
  });

  it('should validate registration form', () => {
    // Click register link
    cy.get('[data-testid="register-link"]').click();

    // Try to submit empty form
    cy.get('[data-testid="register-button"]').click();

    // Verify validation messages
    cy.get('[data-testid="name-error"]')
      .should('be.visible')
      .and('contain', 'Name is required');
    cy.get('[data-testid="email-error"]')
      .should('be.visible')
      .and('contain', 'Email is required');
    cy.get('[data-testid="password-error"]')
      .should('be.visible')
      .and('contain', 'Password is required');
    cy.get('[data-testid="confirm-password-error"]')
      .should('be.visible')
      .and('contain', 'Passwords do not match');
  });

  it('should handle password reset', () => {
    // Mock password reset API
    cy.intercept('POST', '/api/auth/reset-password', {
      statusCode: 200,
      body: {
        message: 'Password reset email sent'
      }
    }).as('resetPassword');

    // Click forgot password link
    cy.get('[data-testid="forgot-password-link"]').click();

    // Fill in email
    cy.get('[data-testid="email-input"]')
      .type('test@example.com');

    // Click reset button
    cy.get('[data-testid="reset-button"]').click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Password reset email sent')
      .and('have.class', 'bg-green-500');
  });

  it('should handle user logout', () => {
    // Login first
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'test-token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User'
        }
      }
    }).as('login');

    cy.get('[data-testid="email-input"]')
      .type('test@example.com');
    cy.get('[data-testid="password-input"]')
      .type('password123');
    cy.get('[data-testid="login-button"]').click();

    // Mock logout API
    cy.intercept('POST', '/api/auth/logout', {
      statusCode: 200,
      body: {
        message: 'Logged out successfully'
      }
    }).as('logout');

    // Click logout button
    cy.get('[data-testid="logout-button"]').click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Logged out successfully')
      .and('have.class', 'bg-green-500');

    // Verify redirect to login page
    cy.url().should('include', '/login');
  });

  it('should persist authentication state', () => {
    // Login first
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        token: 'test-token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User'
        }
      }
    }).as('login');

    cy.get('[data-testid="email-input"]')
      .type('test@example.com');
    cy.get('[data-testid="password-input"]')
      .type('password123');
    cy.get('[data-testid="login-button"]').click();

    // Reload page
    cy.reload();

    // Verify still logged in
    cy.get('[data-testid="user-menu"]')
      .should('be.visible')
      .and('contain', 'Test User');
  });
}); 