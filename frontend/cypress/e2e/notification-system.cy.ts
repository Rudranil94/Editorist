describe('Notification System', () => {
  beforeEach(() => {
    // Visit the home page
    cy.visit('/');
  });

  it('should display success notifications', () => {
    // Trigger a success notification
    cy.get('[data-testid="trigger-success"]').click();

    // Verify notification appears
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Operation successful')
      .and('have.class', 'bg-green-500');

    // Verify notification has timestamp
    cy.get('[data-testid="notification"]')
      .find('[data-testid="notification-time"]')
      .should('be.visible');
  });

  it('should display error notifications', () => {
    // Trigger an error notification
    cy.get('[data-testid="trigger-error"]').click();

    // Verify notification appears
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Operation failed')
      .and('have.class', 'bg-red-500');
  });

  it('should display warning notifications', () => {
    // Trigger a warning notification
    cy.get('[data-testid="trigger-warning"]').click();

    // Verify notification appears
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Warning message')
      .and('have.class', 'bg-yellow-500');
  });

  it('should allow dismissing notifications', () => {
    // Trigger a notification
    cy.get('[data-testid="trigger-success"]').click();

    // Click dismiss button
    cy.get('[data-testid="notification"]')
      .find('[data-testid="dismiss-button"]')
      .click();

    // Verify notification is removed
    cy.get('[data-testid="notification"]').should('not.exist');
  });

  it('should show notification history panel', () => {
    // Open notification history
    cy.get('[data-testid="notification-history-button"]').click();

    // Verify history panel is visible
    cy.get('[data-testid="notification-history"]')
      .should('be.visible')
      .and('contain', 'Notification History');
  });

  it('should display multiple notifications in history', () => {
    // Trigger multiple notifications
    cy.get('[data-testid="trigger-success"]').click();
    cy.get('[data-testid="trigger-error"]').click();
    cy.get('[data-testid="trigger-warning"]').click();

    // Open history panel
    cy.get('[data-testid="notification-history-button"]').click();

    // Verify all notifications are in history
    cy.get('[data-testid="notification-history"]')
      .find('[data-testid="notification-item"]')
      .should('have.length', 3);
  });

  it('should auto-dismiss notifications after timeout', () => {
    // Trigger a notification
    cy.get('[data-testid="trigger-success"]').click();

    // Wait for auto-dismiss
    cy.wait(5000);

    // Verify notification is removed
    cy.get('[data-testid="notification"]').should('not.exist');
  });

  it('should show notification count badge', () => {
    // Trigger multiple notifications
    cy.get('[data-testid="trigger-success"]').click();
    cy.get('[data-testid="trigger-error"]').click();

    // Verify notification count badge
    cy.get('[data-testid="notification-count"]')
      .should('be.visible')
      .and('contain', '2');
  });

  it('should clear notification history', () => {
    // Trigger notifications and open history
    cy.get('[data-testid="trigger-success"]').click();
    cy.get('[data-testid="trigger-error"]').click();
    cy.get('[data-testid="notification-history-button"]').click();

    // Click clear history button
    cy.get('[data-testid="clear-history"]').click();

    // Verify history is empty
    cy.get('[data-testid="notification-history"]')
      .find('[data-testid="notification-item"]')
      .should('have.length', 0);
  });
}); 