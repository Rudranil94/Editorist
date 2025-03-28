import { render, screen } from '@testing-library/react';
import { VideoPreview } from '../VideoPreview';
import { useVideoProcessing } from '../../hooks/useVideoProcessing';

// Mock the useVideoProcessing hook
jest.mock('../../hooks/useVideoProcessing');

describe('VideoPreview', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('renders video preview when job is selected', () => {
    // Mock the hook to return a selected job
    (useVideoProcessing as jest.Mock).mockReturnValue({
      selectedJob: {
        video_path: 'test-video-url',
        status: 'completed',
        result: {
          output_path: 'test-output-url',
          scenes: Array(3).fill({})
        }
      }
    });

    render(<VideoPreview />);
    const videoElement = screen.getByTestId('video-preview');
    expect(videoElement).toBeInTheDocument();
    expect(videoElement.getAttribute('src')).toBe('test-video-url');
  });

  it('does not render when no job is selected', () => {
    // Mock the hook to return no selected job
    (useVideoProcessing as jest.Mock).mockReturnValue({
      selectedJob: null
    });

    const { container } = render(<VideoPreview />);
    expect(container).toBeEmptyDOMElement();
  });
}); 