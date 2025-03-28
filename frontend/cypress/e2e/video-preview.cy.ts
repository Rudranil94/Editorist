describe('Video Preview', () => {
  beforeEach(() => {
    // Mock API responses
    cy.intercept('GET', '/api/jobs/job-1', {
      statusCode: 200,
      body: {
        id: 'job-1',
        status: 'completed',
        output_url: 'https://example.com/output.mp4',
        created_at: new Date().toISOString()
      }
    }).as('getJobDetails');

    // Visit the video preview page
    cy.visit('/preview/job-1');
  });

  it('should display the video preview', () => {
    // Verify video player is visible
    cy.get('[data-testid="video-player"]')
      .should('be.visible')
      .and('have.attr', 'src', 'https://example.com/output.mp4');

    // Verify video controls are present
    cy.get('[data-testid="video-player"]')
      .find('video')
      .should('have.attr', 'controls');
  });

  it('should allow video playback controls', () => {
    // Get video element
    cy.get('[data-testid="video-player"] video').as('video');

    // Test play/pause
    cy.get('@video')
      .then($video => {
        $video[0].play();
        expect($video[0].paused).to.be.false;
      });

    cy.get('@video')
      .then($video => {
        $video[0].pause();
        expect($video[0].paused).to.be.true;
      });

    // Test volume control
    cy.get('@video')
      .then($video => {
        $video[0].volume = 0.5;
        expect($video[0].volume).to.equal(0.5);
      });
  });

  it('should show download button', () => {
    cy.get('[data-testid="download-button"]')
      .should('be.visible')
      .and('have.attr', 'href', 'https://example.com/output.mp4')
      .and('have.attr', 'download');
  });

  it('should show error message when video fails to load', () => {
    // Mock failed video load
    cy.intercept('GET', 'https://example.com/output.mp4', {
      statusCode: 404,
      body: 'Not found'
    }).as('getVideo');

    // Reload page to trigger error
    cy.reload();

    // Verify error message
    cy.get('[data-testid="video-error"]')
      .should('be.visible')
      .and('contain', 'Failed to load video');
  });

  it('should show loading state while video is buffering', () => {
    // Mock slow video response
    cy.intercept('GET', 'https://example.com/output.mp4', {
      delay: 1000,
      statusCode: 200,
      body: 'video data'
    }).as('getVideo');

    // Reload page to trigger loading state
    cy.reload();

    // Verify loading indicator
    cy.get('[data-testid="video-loading"]')
      .should('be.visible')
      .and('contain', 'Loading video...');
  });
}); 