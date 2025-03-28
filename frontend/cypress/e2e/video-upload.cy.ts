describe('Video Upload Flow', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('POST', '/api/videos/upload', {
      statusCode: 200,
      body: {
        job_id: 'test-job-1',
        message: 'Video uploaded successfully'
      }
    }).as('uploadVideo');

    cy.intercept('GET', '/api/jobs/test-job-1', {
      statusCode: 200,
      body: {
        id: 'test-job-1',
        status: 'processing',
        progress: 0,
        current_stage: 'Uploading video',
        current_stage_details: 'Processing video file...',
        created_at: new Date().toISOString()
      }
    }).as('getJobStatus');

    // Visit the upload page
    cy.visit('/');
  });

  it('should upload a video and show processing status', () => {
    // Upload a video file
    cy.uploadVideo('cypress/fixtures/sample-video.mp4');

    // Verify upload success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Video uploaded successfully');

    // Verify job status is shown
    cy.get('[data-testid="job-status"]')
      .should('be.visible')
      .and('contain', 'Processing');

    // Verify progress bar is visible
    cy.get('[data-testid="progress-bar"]')
      .should('be.visible')
      .and('have.attr', 'style')
      .and('include', 'width: 0%');

    // Verify current stage details
    cy.get('[data-testid="current-stage"]')
      .should('be.visible')
      .and('contain', 'Uploading video');

    // Verify current stage details
    cy.get('[data-testid="stage-details"]')
      .should('be.visible')
      .and('contain', 'Processing video file...');
  });

  it('should show error notification for invalid file type', () => {
    // Try to upload an invalid file
    cy.uploadVideo('cypress/fixtures/invalid.txt');

    // Verify error notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Invalid file type')
      .and('have.class', 'bg-red-500');
  });

  it('should show error notification for file size limit', () => {
    // Try to upload a large file
    cy.uploadVideo('cypress/fixtures/large-video.mp4');

    // Verify error notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'File size exceeds 500MB limit')
      .and('have.class', 'bg-red-500');
  });

  it('should allow retrying failed uploads', () => {
    // Mock failed upload
    cy.intercept('POST', '/api/videos/upload', {
      statusCode: 500,
      body: {
        error: 'Upload failed'
      }
    }).as('uploadVideo');

    // Try to upload a video
    cy.uploadVideo('cypress/fixtures/sample-video.mp4');

    // Verify error notification with retry button
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Upload failed')
      .and('have.class', 'bg-red-500');

    // Mock successful upload for retry
    cy.intercept('POST', '/api/videos/upload', {
      statusCode: 200,
      body: {
        job_id: 'test-job-1',
        message: 'Video uploaded successfully'
      }
    }).as('uploadVideo');

    // Click retry button
    cy.get('[data-testid="notification"]')
      .find('button')
      .contains('Retry Upload')
      .click();

    // Verify success notification
    cy.get('[data-testid="notification"]')
      .should('be.visible')
      .and('contain', 'Video uploaded successfully')
      .and('have.class', 'bg-green-500');
  });
}); 