import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoUpload } from '../VideoUpload';
import { useVideoProcessing } from '../../hooks/useVideoProcessing';

// Mock the useVideoProcessing hook
jest.mock('../../hooks/useVideoProcessing');

describe('VideoUpload', () => {
  const mockUploadVideo = jest.fn();
  const mockIsUploading = false;

  beforeEach(() => {
    (useVideoProcessing as jest.Mock).mockReturnValue({
      uploadVideo: mockUploadVideo,
      isUploading: mockIsUploading,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders upload area correctly', () => {
    render(<VideoUpload />);
    
    expect(screen.getByText(/drag and drop/i)).toBeInTheDocument();
    expect(screen.getByText(/or click to select/i)).toBeInTheDocument();
    expect(screen.getByText(/supported formats/i)).toBeInTheDocument();
  });

  it('handles file selection', async () => {
    render(<VideoUpload />);
    
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const input = screen.getByLabelText(/upload video/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(mockUploadVideo).toHaveBeenCalledWith(file);
    });
  });

  it('handles drag and drop', async () => {
    render(<VideoUpload />);
    
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    const dropzone = screen.getByTestId('dropzone');
    
    fireEvent.dragOver(dropzone);
    fireEvent.drop(dropzone, { dataTransfer: { files: [file] } });
    
    await waitFor(() => {
      expect(mockUploadVideo).toHaveBeenCalledWith(file);
    });
  });

  it('shows loading state during upload', () => {
    (useVideoProcessing as jest.Mock).mockReturnValue({
      uploadVideo: mockUploadVideo,
      isUploading: true,
    });

    render(<VideoUpload />);
    
    expect(screen.getByText(/uploading/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error message for unsupported file type', async () => {
    render(<VideoUpload />);
    
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const input = screen.getByLabelText(/upload video/i);
    
    fireEvent.change(input, { target: { files: [file] } });
    
    await waitFor(() => {
      expect(screen.getByText(/unsupported file type/i)).toBeInTheDocument();
    });
  });
}); 