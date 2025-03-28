describe('Processing Options', () => {
  beforeEach(() => {
    // Visit the processing options page
    cy.visit('/process');
  });

  it('should display all processing options', () => {
    // Verify style options are visible
    cy.get('[data-testid="style-options"]')
      .should('be.visible')
      .and('contain', 'Style Options');

    // Verify each style option is present
    cy.get('[data-testid="style-option"]').should('have.length.at.least', 3);
    cy.get('[data-testid="style-option"]').first()
      .should('contain', 'Style 1')
      .and('contain', 'Description for Style 1');

    // Verify quality settings
    cy.get('[data-testid="quality-settings"]')
      .should('be.visible')
      .and('contain', 'Quality Settings');

    // Verify resolution options
    cy.get('[data-testid="resolution-select"]')
      .should('be.visible')
      .and('have.value', '1080p');

    // Verify format options
    cy.get('[data-testid="format-select"]')
      .should('be.visible')
      .and('have.value', 'mp4');
  });

  it('should allow selecting different styles', () => {
    // Click on a different style option
    cy.get('[data-testid="style-option"]').eq(1).click();

    // Verify selection is updated
    cy.get('[data-testid="style-option"]').eq(1)
      .should('have.class', 'selected');

    // Verify preview is updated
    cy.get('[data-testid="style-preview"]')
      .should('have.attr', 'src')
      .and('include', 'style-2');
  });

  it('should allow adjusting quality settings', () => {
    // Change resolution
    cy.get('[data-testid="resolution-select"]')
      .select('720p')
      .should('have.value', '720p');

    // Change format
    cy.get('[data-testid="format-select"]')
      .select('mov')
      .should('have.value', 'mov');

    // Verify estimated file size is updated
    cy.get('[data-testid="file-size-estimate"]')
      .should('contain', 'Estimated size:');
  });

  it('should show processing time estimate', () => {
    // Select a style
    cy.get('[data-testid="style-option"]').first().click();

    // Verify processing time estimate is shown
    cy.get('[data-testid="processing-time"]')
      .should('be.visible')
      .and('contain', 'Estimated processing time:');
  });

  it('should validate and submit options', () => {
    // Select a style
    cy.get('[data-testid="style-option"]').first().click();

    // Click submit button
    cy.get('[data-testid="submit-options"]').click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Processing options saved')
      .and('have.class', 'bg-green-500');
  });

  it('should show error when no style is selected', () => {
    // Click submit without selecting a style
    cy.get('[data-testid="submit-options"]').click();

    // Verify error message
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Please select a style');
  });

  it('should show loading state while saving options', () => {
    // Mock slow API response
    cy.intercept('POST', '/api/process/options', {
      delay: 1000,
      statusCode: 200,
      body: { message: 'Options saved' }
    }).as('saveOptions');

    // Select a style and submit
    cy.get('[data-testid="style-option"]').first().click();
    cy.get('[data-testid="submit-options"]').click();

    // Verify loading state
    cy.get('[data-testid="submit-options"]')
      .should('be.disabled')
      .and('contain', 'Saving...');
  });
}); 