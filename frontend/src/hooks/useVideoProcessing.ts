import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videoApi, VideoProcessingParams } from '../services/api';
import type { JobStatus } from '../services/api';

export const useVideoProcessing = () => {
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Query for active jobs
  const { data: activeJobs = [], isLoading: isLoadingJobs } = useQuery<JobStatus[]>({
    queryKey: ['activeJobs'],
    queryFn: videoApi.getActiveJobs,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Query for selected job status
  const { data: selectedJob, isLoading: isLoadingSelectedJob } = useQuery<JobStatus | null>({
    queryKey: ['jobStatus', selectedJobId],
    queryFn: () => selectedJobId ? videoApi.getJobStatus(selectedJobId) : null,
    enabled: !!selectedJobId,
  });

  // Set up polling for selected job
  useEffect(() => {
    if (!selectedJobId || !selectedJob || selectedJob.status === 'completed' || selectedJob.status === 'failed') {
      return;
    }

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['jobStatus', selectedJobId] });
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedJobId, selectedJob, queryClient]);

  // Mutation for uploading video
  const uploadMutation = useMutation({
    mutationFn: videoApi.uploadVideo,
    onSuccess: (data) => {
      setSelectedJobId(data.job_id);
      queryClient.invalidateQueries({ queryKey: ['activeJobs'] });
    },
  });

  // Mutation for processing video
  const processMutation = useMutation({
    mutationFn: ({ videoPath, params }: { videoPath: string; params: VideoProcessingParams }) =>
      videoApi.processVideo(videoPath, params),
    onSuccess: (data) => {
      setSelectedJobId(data.job_id);
      queryClient.invalidateQueries({ queryKey: ['activeJobs'] });
    },
  });

  // Mutation for analyzing video
  const analyzeMutation = useMutation({
    mutationFn: ({ videoPath, params }: { videoPath: string; params: any }) =>
      videoApi.analyzeVideo(videoPath, params),
    onSuccess: (data) => {
      setSelectedJobId(data.job_id);
      queryClient.invalidateQueries({ queryKey: ['activeJobs'] });
    },
  });

  // Mutation for cancelling job
  const cancelMutation = useMutation({
    mutationFn: videoApi.cancelJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeJobs'] });
      if (selectedJobId) {
        queryClient.invalidateQueries({ queryKey: ['jobStatus', selectedJobId] });
      }
    },
  });

  // Mutation for prioritizing job
  const prioritizeMutation = useMutation({
    mutationFn: ({ jobId, direction }: { jobId: string; direction: 'up' | 'down' }) =>
      videoApi.prioritizeJob(jobId, direction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeJobs'] });
    },
  });

  // Clean up completed jobs
  useEffect(() => {
    const completedJobs = activeJobs.filter(
      (job) => job.status === 'completed' || job.status === 'failed'
    );
    if (completedJobs.length > 0) {
      queryClient.invalidateQueries({ queryKey: ['activeJobs'] });
    }
  }, [activeJobs, queryClient]);

  return {
    activeJobs,
    selectedJob,
    selectedJobId,
    isLoadingJobs,
    isLoadingSelectedJob,
    uploadVideo: uploadMutation.mutate,
    processVideo: processMutation.mutate,
    analyzeVideo: analyzeMutation.mutate,
    cancelJob: cancelMutation.mutate,
    prioritizeJob: prioritizeMutation.mutate,
    setSelectedJobId,
    isUploading: uploadMutation.isPending,
    isProcessing: processMutation.isPending,
    isAnalyzing: analyzeMutation.isPending,
    error: uploadMutation.error || processMutation.error || analyzeMutation.error || cancelMutation.error || prioritizeMutation.error,
  };
}; 