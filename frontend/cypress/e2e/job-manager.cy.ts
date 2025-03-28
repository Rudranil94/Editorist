describe('Job Manager', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '/api/jobs/queue', {
      statusCode: 200,
      body: [
        {
          id: 'job-1',
          status: 'processing',
          priority: 1,
          created_at: new Date().toISOString()
        },
        {
          id: 'job-2',
          status: 'pending',
          priority: 2,
          created_at: new Date().toISOString()
        }
      ]
    }).as('getJobQueue');

    // Visit the job manager page
    cy.visit('/jobs/manage');
  });

  it('should display job queue', () => {
    // Verify queue is visible
    cy.get('[data-testid="job-queue"]').should('be.visible');

    // Check job items
    cy.get('[data-testid="job-item"]').should('have.length', 2);
    cy.get('[data-testid="job-item"]').first()
      .should('contain', 'Job job-1')
      .and('contain', 'Processing');
  });

  it('should allow cancelling jobs', () => {
    // Mock cancel API
    cy.intercept('POST', '/api/jobs/job-1/cancel', {
      statusCode: 200,
      body: { message: 'Job cancelled successfully' }
    }).as('cancelJob');

    // Click cancel button on first job
    cy.get('[data-testid="job-item"]').first()
      .find('[data-testid="cancel-button"]')
      .click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Job cancelled successfully')
      .and('have.class', 'bg-green-500');
  });

  it('should allow changing job priority', () => {
    // Mock priority update API
    cy.intercept('POST', '/api/jobs/job-2/priority', {
      statusCode: 200,
      body: { message: 'Job priority updated' }
    }).as('updatePriority');

    // Click priority up button on second job
    cy.get('[data-testid="job-item"]').eq(1)
      .find('[data-testid="priority-up-button"]')
      .click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Job priority increased')
      .and('have.class', 'bg-green-500');
  });

  it('should show job details panel', () => {
    // Click on first job
    cy.get('[data-testid="job-item"]').first().click();

    // Verify details panel is visible
    cy.get('[data-testid="job-details"]')
      .should('be.visible')
      .and('contain', 'Job job-1');

    // Verify job status
    cy.get('[data-testid="job-details"]')
      .find('[data-testid="job-status"]')
      .should('contain', 'Processing');

    // Verify priority
    cy.get('[data-testid="job-details"]')
      .find('[data-testid="job-priority"]')
      .should('contain', 'Priority: 1');
  });

  it('should allow filtering jobs by status', () => {
    // Click status filter
    cy.get('[data-testid="status-filter"]').click();

    // Select processing status
    cy.get('[data-testid="status-option-processing"]').click();

    // Verify only processing jobs are shown
    cy.get('[data-testid="job-item"]')
      .should('have.length', 1)
      .and('contain', 'Processing');
  });

  it('should allow sorting jobs', () => {
    // Click sort button
    cy.get('[data-testid="sort-button"]').click();

    // Select priority sort
    cy.get('[data-testid="sort-option-priority"]').click();

    // Verify jobs are sorted by priority
    cy.get('[data-testid="job-item"]').first()
      .should('contain', 'Priority: 1');
  });

  it('should show job statistics', () => {
    // Verify statistics are visible
    cy.get('[data-testid="queue-stats"]').should('be.visible');

    // Check processing jobs count
    cy.get('[data-testid="processing-count"]')
      .should('contain', '1')
      .and('contain', 'Processing');

    // Check pending jobs count
    cy.get('[data-testid="pending-count"]')
      .should('contain', '1')
      .and('contain', 'Pending');
  });

  it('should allow bulk actions', () => {
    // Select multiple jobs
    cy.get('[data-testid="job-item"]').first()
      .find('[data-testid="select-checkbox"]')
      .click();
    cy.get('[data-testid="job-item"]').eq(1)
      .find('[data-testid="select-checkbox"]')
      .click();

    // Click bulk cancel button
    cy.get('[data-testid="bulk-cancel-button"]').click();

    // Verify confirmation dialog
    cy.get('[data-testid="confirmation-dialog"]')
      .should('be.visible')
      .and('contain', 'Cancel selected jobs?');

    // Confirm cancellation
    cy.get('[data-testid="confirm-button"]').click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Selected jobs cancelled')
      .and('have.class', 'bg-green-500');
  });

  it('should show loading state while fetching queue', () => {
    // Mock slow API response
    cy.intercept('GET', '/api/jobs/queue', {
      delay: 1000,
      statusCode: 200,
      body: [
        {
          id: 'job-1',
          status: 'processing',
          priority: 1,
          created_at: new Date().toISOString()
        }
      ]
    }).as('getJobQueue');

    // Reload page to trigger loading state
    cy.reload();

    // Verify loading indicator
    cy.get('[data-testid="loading-indicator"]')
      .should('be.visible')
      .and('contain', 'Loading job queue...');
  });
}); 