describe('Job Management', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '/api/jobs/active', {
      statusCode: 200,
      body: [
        {
          id: 'job-1',
          status: 'processing',
          progress: 30,
          current_stage: 'Processing video',
          current_stage_details: 'Applying style transfer...',
          created_at: new Date().toISOString()
        },
        {
          id: 'job-2',
          status: 'pending',
          progress: 0,
          current_stage: 'Waiting in queue',
          created_at: new Date().toISOString()
        }
      ]
    }).as('getActiveJobs');

    cy.intercept('POST', '/api/jobs/job-1/cancel', {
      statusCode: 200,
      body: { message: 'Job cancelled successfully' }
    }).as('cancelJob');

    cy.intercept('POST', '/api/jobs/job-2/priority', {
      statusCode: 200,
      body: { message: 'Job priority updated' }
    }).as('prioritizeJob');

    // Visit the jobs page
    cy.visit('/jobs');
  });

  it('should display active jobs and their status', () => {
    // Verify job list is visible
    cy.get('[data-testid="job-list"]').should('be.visible');

    // Verify first job is shown
    cy.get('[data-testid="job-item-job-1"]')
      .should('be.visible')
      .and('contain', 'Job job-1')
      .and('contain', 'Processing');

    // Verify second job is shown
    cy.get('[data-testid="job-item-job-2"]')
      .should('be.visible')
      .and('contain', 'Job job-2')
      .and('contain', 'Pending');

    // Verify progress bar for processing job
    cy.get('[data-testid="job-item-job-1"]')
      .find('[data-testid="progress-bar"]')
      .should('have.attr', 'style')
      .and('include', 'width: 30%');
  });

  it('should allow cancelling a job', () => {
    // Click cancel button on first job
    cy.get('[data-testid="job-item-job-1"]')
      .find('[data-testid="cancel-button"]')
      .click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Job cancelled successfully')
      .and('have.class', 'bg-green-500');
  });

  it('should allow changing job priority', () => {
    // Click priority up button on second job
    cy.get('[data-testid="job-item-job-2"]')
      .find('[data-testid="priority-up-button"]')
      .click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Job priority increased')
      .and('have.class', 'bg-green-500');

    // Click priority down button
    cy.get('[data-testid="job-item-job-2"]')
      .find('[data-testid="priority-down-button"]')
      .click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Job priority decreased')
      .and('have.class', 'bg-green-500');
  });

  it('should show job details when selected', () => {
    // Click on first job
    cy.get('[data-testid="job-item-job-1"]').click();

    // Verify job details panel is visible
    cy.get('[data-testid="job-details"]')
      .should('be.visible')
      .and('contain', 'Job job-1');

    // Verify current stage details
    cy.get('[data-testid="job-details"]')
      .find('[data-testid="current-stage"]')
      .should('contain', 'Processing video');

    // Verify stage details
    cy.get('[data-testid="job-details"]')
      .find('[data-testid="stage-details"]')
      .should('contain', 'Applying style transfer...');
  });

  it('should show error notification when operations fail', () => {
    // Mock failed cancel operation
    cy.intercept('POST', '/api/jobs/job-1/cancel', {
      statusCode: 500,
      body: { error: 'Failed to cancel job' }
    }).as('cancelJob');

    // Try to cancel job
    cy.get('[data-testid="job-item-job-1"]')
      .find('[data-testid="cancel-button"]')
      .click();

    // Verify error notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Failed to cancel job')
      .and('have.class', 'bg-red-500');
  });
}); 