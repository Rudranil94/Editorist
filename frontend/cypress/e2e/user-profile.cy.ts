describe('User Profile', () => {
  beforeEach(() => {
    // Mock user data
    cy.intercept('GET', '/api/user/profile', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        last_login: '2024-03-15T10:00:00Z'
      }
    }).as('getUserProfile');

    // Login and visit profile page
    cy.login('test@example.com', 'password123');
    cy.visit('/profile');
  });

  it('should display user profile information', () => {
    // Verify profile information is visible
    cy.get('[data-testid="profile-info"]').should('be.visible');

    // Check name
    cy.get('[data-testid="user-name"]')
      .should('contain', 'Test User');

    // Check email
    cy.get('[data-testid="user-email"]')
      .should('contain', 'test@example.com');

    // Check account creation date
    cy.get('[data-testid="account-created"]')
      .should('contain', 'January 1, 2024');

    // Check last login
    cy.get('[data-testid="last-login"]')
      .should('contain', 'March 15, 2024');
  });

  it('should allow updating profile information', () => {
    // Mock update API
    cy.intercept('PUT', '/api/user/profile', {
      statusCode: 200,
      body: {
        message: 'Profile updated successfully'
      }
    }).as('updateProfile');

    // Click edit button
    cy.get('[data-testid="edit-profile-button"]').click();

    // Update name
    cy.get('[data-testid="name-input"]')
      .clear()
      .type('Updated Name');

    // Click save button
    cy.get('[data-testid="save-profile-button"]').click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Profile updated successfully')
      .and('have.class', 'bg-green-500');

    // Verify updated name is displayed
    cy.get('[data-testid="user-name"]')
      .should('contain', 'Updated Name');
  });

  it('should validate profile update form', () => {
    // Click edit button
    cy.get('[data-testid="edit-profile-button"]').click();

    // Try to submit empty name
    cy.get('[data-testid="name-input"]').clear();
    cy.get('[data-testid="save-profile-button"]').click();

    // Verify validation message
    cy.get('[data-testid="name-error"]')
      .should('be.visible')
      .and('contain', 'Name is required');
  });

  it('should allow changing password', () => {
    // Mock password update API
    cy.intercept('PUT', '/api/user/password', {
      statusCode: 200,
      body: {
        message: 'Password updated successfully'
      }
    }).as('updatePassword');

    // Click change password button
    cy.get('[data-testid="change-password-button"]').click();

    // Fill in password form
    cy.get('[data-testid="current-password-input"]')
      .type('currentpassword');
    cy.get('[data-testid="new-password-input"]')
      .type('newpassword123');
    cy.get('[data-testid="confirm-password-input"]')
      .type('newpassword123');

    // Click update button
    cy.get('[data-testid="update-password-button"]').click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Password updated successfully')
      .and('have.class', 'bg-green-500');
  });

  it('should validate password change form', () => {
    // Click change password button
    cy.get('[data-testid="change-password-button"]').click();

    // Try to submit empty form
    cy.get('[data-testid="update-password-button"]').click();

    // Verify validation messages
    cy.get('[data-testid="current-password-error"]')
      .should('be.visible')
      .and('contain', 'Current password is required');
    cy.get('[data-testid="new-password-error"]')
      .should('be.visible')
      .and('contain', 'New password is required');
    cy.get('[data-testid="confirm-password-error"]')
      .should('be.visible')
      .and('contain', 'Passwords do not match');
  });

  it('should handle password update failure', () => {
    // Mock failed password update API
    cy.intercept('PUT', '/api/user/password', {
      statusCode: 400,
      body: {
        error: 'Current password is incorrect'
      }
    }).as('updatePassword');

    // Click change password button
    cy.get('[data-testid="change-password-button"]').click();

    // Fill in password form with wrong current password
    cy.get('[data-testid="current-password-input"]')
      .type('wrongpassword');
    cy.get('[data-testid="new-password-input"]')
      .type('newpassword123');
    cy.get('[data-testid="confirm-password-input"]')
      .type('newpassword123');

    // Click update button
    cy.get('[data-testid="update-password-button"]').click();

    // Verify error message
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Current password is incorrect');
  });

  it('should allow deleting account', () => {
    // Mock delete account API
    cy.intercept('DELETE', '/api/user/account', {
      statusCode: 200,
      body: {
        message: 'Account deleted successfully'
      }
    }).as('deleteAccount');

    // Click delete account button
    cy.get('[data-testid="delete-account-button"]').click();

    // Verify confirmation dialog
    cy.get('[data-testid="confirmation-dialog"]')
      .should('be.visible')
      .and('contain', 'Delete Account');

    // Fill in confirmation
    cy.get('[data-testid="delete-confirmation-input"]')
      .type('DELETE');

    // Click confirm button
    cy.get('[data-testid="confirm-delete-button"]').click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Account deleted successfully')
      .and('have.class', 'bg-green-500');

    // Verify redirect to login page
    cy.url().should('include', '/login');
  });

  it('should show loading state while updating profile', () => {
    // Mock slow API response
    cy.intercept('PUT', '/api/user/profile', {
      delay: 1000,
      statusCode: 200,
      body: {
        message: 'Profile updated successfully'
      }
    }).as('updateProfile');

    // Click edit button
    cy.get('[data-testid="edit-profile-button"]').click();

    // Update name
    cy.get('[data-testid="name-input"]')
      .clear()
      .type('Updated Name');

    // Click save button
    cy.get('[data-testid="save-profile-button"]').click();

    // Verify loading state
    cy.get('[data-testid="save-profile-button"]')
      .should('be.disabled')
      .and('contain', 'Saving...');
  });
}); 