describe('Settings', () => {
  beforeEach(() => {
    // Mock settings data
    cy.intercept('GET', '/api/user/settings', {
      statusCode: 200,
      body: {
        email_notifications: true,
        processing_preferences: {
          default_quality: 'high',
          default_format: 'mp4',
          auto_start: true
        },
        storage_preferences: {
          max_storage: 100,
          auto_delete: false
        }
      }
    }).as('getSettings');

    // Login and visit settings page
    cy.login('test@example.com', 'password123');
    cy.visit('/settings');
  });

  it('should display current settings', () => {
    // Verify settings sections are visible
    cy.get('[data-testid="settings-section"]').should('have.length', 3);

    // Check email notifications
    cy.get('[data-testid="email-notifications"]')
      .should('be.checked');

    // Check processing preferences
    cy.get('[data-testid="default-quality"]')
      .should('have.value', 'high');
    cy.get('[data-testid="default-format"]')
      .should('have.value', 'mp4');
    cy.get('[data-testid="auto-start"]')
      .should('be.checked');

    // Check storage preferences
    cy.get('[data-testid="max-storage"]')
      .should('have.value', '100');
    cy.get('[data-testid="auto-delete"]')
      .should('not.be.checked');
  });

  it('should allow updating email notifications', () => {
    // Mock update API
    cy.intercept('PUT', '/api/user/settings/notifications', {
      statusCode: 200,
      body: {
        message: 'Settings updated successfully'
      }
    }).as('updateNotifications');

    // Toggle email notifications
    cy.get('[data-testid="email-notifications"]')
      .click();

    // Click save button
    cy.get('[data-testid="save-notifications"]').click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Settings updated successfully')
      .and('have.class', 'bg-green-500');
  });

  it('should allow updating processing preferences', () => {
    // Mock update API
    cy.intercept('PUT', '/api/user/settings/processing', {
      statusCode: 200,
      body: {
        message: 'Settings updated successfully'
      }
    }).as('updateProcessing');

    // Update quality setting
    cy.get('[data-testid="default-quality"]')
      .select('medium');

    // Update format setting
    cy.get('[data-testid="default-format"]')
      .select('mov');

    // Toggle auto-start
    cy.get('[data-testid="auto-start"]')
      .click();

    // Click save button
    cy.get('[data-testid="save-processing"]').click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Settings updated successfully')
      .and('have.class', 'bg-green-500');
  });

  it('should allow updating storage preferences', () => {
    // Mock update API
    cy.intercept('PUT', '/api/user/settings/storage', {
      statusCode: 200,
      body: {
        message: 'Settings updated successfully'
      }
    }).as('updateStorage');

    // Update max storage
    cy.get('[data-testid="max-storage"]')
      .clear()
      .type('200');

    // Toggle auto-delete
    cy.get('[data-testid="auto-delete"]')
      .click();

    // Click save button
    cy.get('[data-testid="save-storage"]').click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Settings updated successfully')
      .and('have.class', 'bg-green-500');
  });

  it('should validate storage settings', () => {
    // Try to set invalid storage value
    cy.get('[data-testid="max-storage"]')
      .clear()
      .type('-1');

    // Click save button
    cy.get('[data-testid="save-storage"]').click();

    // Verify validation message
    cy.get('[data-testid="storage-error"]')
      .should('be.visible')
      .and('contain', 'Storage limit must be positive');
  });

  it('should show storage usage', () => {
    // Mock storage usage API
    cy.intercept('GET', '/api/user/storage-usage', {
      statusCode: 200,
      body: {
        used: 75,
        total: 100,
        files: [
          {
            id: 'file-1',
            name: 'video1.mp4',
            size: 25,
            created_at: '2024-03-15T10:00:00Z'
          }
        ]
      }
    }).as('getStorageUsage');

    // Verify storage usage display
    cy.get('[data-testid="storage-usage"]')
      .should('be.visible')
      .and('contain', '75 GB used of 100 GB');

    // Verify storage bar
    cy.get('[data-testid="storage-bar"]')
      .should('have.attr', 'style')
      .and('include', 'width: 75%');

    // Verify file list
    cy.get('[data-testid="file-item"]')
      .should('have.length', 1)
      .and('contain', 'video1.mp4')
      .and('contain', '25 GB');
  });

  it('should handle settings update failure', () => {
    // Mock failed update API
    cy.intercept('PUT', '/api/user/settings/notifications', {
      statusCode: 500,
      body: {
        error: 'Failed to update settings'
      }
    }).as('updateNotifications');

    // Toggle email notifications
    cy.get('[data-testid="email-notifications"]')
      .click();

    // Click save button
    cy.get('[data-testid="save-notifications"]').click();

    // Verify error message
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Failed to update settings');
  });

  it('should show loading state while saving settings', () => {
    // Mock slow API response
    cy.intercept('PUT', '/api/user/settings/notifications', {
      delay: 1000,
      statusCode: 200,
      body: {
        message: 'Settings updated successfully'
      }
    }).as('updateNotifications');

    // Toggle email notifications
    cy.get('[data-testid="email-notifications"]')
      .click();

    // Click save button
    cy.get('[data-testid="save-notifications"]').click();

    // Verify loading state
    cy.get('[data-testid="save-notifications"]')
      .should('be.disabled')
      .and('contain', 'Saving...');
  });
}); 