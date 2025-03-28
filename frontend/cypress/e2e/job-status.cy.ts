describe('Job Status', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '/api/jobs/status', {
      statusCode: 200,
      body: {
        active_jobs: 2,
        completed_jobs: 5,
        failed_jobs: 1,
        total_jobs: 8
      }
    }).as('getJobStatus');

    // Visit the job status page
    cy.visit('/status');
  });

  it('should display job statistics', () => {
    // Verify statistics are visible
    cy.get('[data-testid="job-stats"]').should('be.visible');

    // Check active jobs count
    cy.get('[data-testid="active-jobs"]')
      .should('contain', '2')
      .and('contain', 'Active Jobs');

    // Check completed jobs count
    cy.get('[data-testid="completed-jobs"]')
      .should('contain', '5')
      .and('contain', 'Completed Jobs');

    // Check failed jobs count
    cy.get('[data-testid="failed-jobs"]')
      .should('contain', '1')
      .and('contain', 'Failed Jobs');

    // Check total jobs count
    cy.get('[data-testid="total-jobs"]')
      .should('contain', '8')
      .and('contain', 'Total Jobs');
  });

  it('should show job progress updates', () => {
    // Mock progress update
    cy.intercept('GET', '/api/jobs/job-1/progress', {
      statusCode: 200,
      body: {
        progress: 45,
        current_stage: 'Processing video',
        current_stage_details: 'Applying style transfer...'
      }
    }).as('getJobProgress');

    // Visit specific job page
    cy.visit('/status/job-1');

    // Verify progress bar
    cy.get('[data-testid="progress-bar"]')
      .should('have.attr', 'style')
      .and('include', 'width: 45%');

    // Verify current stage
    cy.get('[data-testid="current-stage"]')
      .should('contain', 'Processing video');

    // Verify stage details
    cy.get('[data-testid="stage-details"]')
      .should('contain', 'Applying style transfer...');
  });

  it('should display job timeline', () => {
    // Mock timeline data
    cy.intercept('GET', '/api/jobs/job-1/timeline', {
      statusCode: 200,
      body: [
        {
          stage: 'Upload',
          status: 'completed',
          timestamp: new Date().toISOString()
        },
        {
          stage: 'Processing',
          status: 'in_progress',
          timestamp: new Date().toISOString()
        }
      ]
    }).as('getJobTimeline');

    // Visit specific job page
    cy.visit('/status/job-1');

    // Verify timeline is visible
    cy.get('[data-testid="job-timeline"]')
      .should('be.visible')
      .and('contain', 'Job Timeline');

    // Check timeline items
    cy.get('[data-testid="timeline-item"]').should('have.length', 2);
    cy.get('[data-testid="timeline-item"]').first()
      .should('contain', 'Upload')
      .and('have.class', 'completed');
  });

  it('should show job completion status', () => {
    // Mock completed job data
    cy.intercept('GET', '/api/jobs/job-2', {
      statusCode: 200,
      body: {
        id: 'job-2',
        status: 'completed',
        completed_at: new Date().toISOString(),
        output_url: 'https://example.com/output.mp4'
      }
    }).as('getCompletedJob');

    // Visit completed job page
    cy.visit('/status/job-2');

    // Verify completion status
    cy.get('[data-testid="job-status"]')
      .should('contain', 'Completed')
      .and('have.class', 'bg-green-500');

    // Verify completion time
    cy.get('[data-testid="completion-time"]')
      .should('be.visible');

    // Verify download button
    cy.get('[data-testid="download-button"]')
      .should('be.visible')
      .and('have.attr', 'href', 'https://example.com/output.mp4');
  });

  it('should show job failure status', () => {
    // Mock failed job data
    cy.intercept('GET', '/api/jobs/job-3', {
      statusCode: 200,
      body: {
        id: 'job-3',
        status: 'failed',
        error_message: 'Processing failed due to invalid input',
        failed_at: new Date().toISOString()
      }
    }).as('getFailedJob');

    // Visit failed job page
    cy.visit('/status/job-3');

    // Verify failure status
    cy.get('[data-testid="job-status"]')
      .should('contain', 'Failed')
      .and('have.class', 'bg-red-500');

    // Verify error message
    cy.get('[data-testid="error-message"]')
      .should('contain', 'Processing failed due to invalid input');

    // Verify retry button
    cy.get('[data-testid="retry-button"]')
      .should('be.visible')
      .and('contain', 'Retry Job');
  });

  it('should allow retrying failed jobs', () => {
    // Mock retry API
    cy.intercept('POST', '/api/jobs/job-3/retry', {
      statusCode: 200,
      body: { message: 'Job queued for retry' }
    }).as('retryJob');

    // Visit failed job page
    cy.visit('/status/job-3');

    // Click retry button
    cy.get('[data-testid="retry-button"]').click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Job queued for retry')
      .and('have.class', 'bg-green-500');
  });

  it('should show loading state while fetching status', () => {
    // Mock slow API response
    cy.intercept('GET', '/api/jobs/status', {
      delay: 1000,
      statusCode: 200,
      body: {
        active_jobs: 2,
        completed_jobs: 5,
        failed_jobs: 1,
        total_jobs: 8
      }
    }).as('getJobStatus');

    // Reload page to trigger loading state
    cy.reload();

    // Verify loading indicator
    cy.get('[data-testid="loading-indicator"]')
      .should('be.visible')
      .and('contain', 'Loading job status...');
  });
}); 