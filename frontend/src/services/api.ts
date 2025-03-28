import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1/videos';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface VideoProcessingParams {
  style: string;
  strength: number;
  transitions: string;
  detect_scenes: boolean;
  analyze_content: boolean;
  optimize_scenes: boolean;
  min_quality_threshold: number;
  min_importance_threshold: number;
  analyze_motion: boolean;
  analyze_continuity: boolean;
  min_object_continuity: number;
}

export interface JobStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_path: string;
  progress: number;
  current_stage: string;
  current_stage_details?: string;
  error?: string;
  result?: {
    output_path: string;
    scenes: any[];
  };
  created_at: string;
  updated_at: string;
}

export const videoApi = {
  // Upload a video file
  uploadVideo: async (file: File): Promise<{ job_id: string }> => {
    const formData = new FormData();
    formData.append('video', file);
    const response = await fetch('/api/videos/upload', {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error('Failed to upload video');
    }
    return response.json();
  },

  // Process a video with parameters
  processVideo: async (videoPath: string, params: VideoProcessingParams): Promise<{ job_id: string }> => {
    const response = await fetch('/api/videos/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ video_path: videoPath, ...params }),
    });
    if (!response.ok) {
      throw new Error('Failed to process video');
    }
    return response.json();
  },

  // Get job status
  getJobStatus: async (jobId: string): Promise<JobStatus> => {
    const response = await fetch(`/api/jobs/${jobId}`);
    if (!response.ok) {
      throw new Error('Failed to get job status');
    }
    return response.json();
  },

  // Get active jobs
  getActiveJobs: async (): Promise<JobStatus[]> => {
    const response = await fetch('/api/jobs/active');
    if (!response.ok) {
      throw new Error('Failed to get active jobs');
    }
    return response.json();
  },

  // Analyze a video
  analyzeVideo: async (videoPath: string, params: any): Promise<{ job_id: string }> => {
    const response = await fetch('/api/videos/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ video_path: videoPath, ...params }),
    });
    if (!response.ok) {
      throw new Error('Failed to analyze video');
    }
    return response.json();
  },

  cancelJob: async (jobId: string): Promise<void> => {
    const response = await fetch(`/api/jobs/${jobId}/cancel`, {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Failed to cancel job');
    }
  },

  prioritizeJob: async (jobId: string, direction: 'up' | 'down'): Promise<void> => {
    const response = await fetch(`/api/jobs/${jobId}/priority`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ direction }),
    });
    if (!response.ok) {
      throw new Error('Failed to change job priority');
    }
  },
}; 