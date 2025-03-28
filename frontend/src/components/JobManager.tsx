import React, { useEffect } from 'react';
import { useVideoProcessing } from '../hooks/useVideoProcessing';
import { showNotification } from './NotificationSystem';
import { PauseIcon, PlayIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';

export const JobManager: React.FC = () => {
  const { 
    activeJobs, 
    setSelectedJobId, 
    selectedJobId,
    cancelJob,
    prioritizeJob,
    isLoadingJobs 
  } = useVideoProcessing();

  useEffect(() => {
    // Show notification when a job is selected
    if (selectedJobId) {
      const selectedJob = activeJobs.find(job => job.id === selectedJobId);
      if (selectedJob) {
        showNotification.info(`Selected job ${selectedJob.id}`);
      }
    }
  }, [selectedJobId, activeJobs]);

  const handleJobSelect = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await cancelJob(jobId);
      showNotification.success('Job cancelled successfully');
    } catch (error) {
      showNotification.error('Failed to cancel job');
    }
  };

  const handlePrioritizeJob = async (jobId: string, direction: 'up' | 'down') => {
    try {
      await prioritizeJob(jobId, direction);
      showNotification.success(`Job priority ${direction === 'up' ? 'increased' : 'decreased'}`);
    } catch (error) {
      showNotification.error('Failed to change job priority');
    }
  };

  if (isLoadingJobs) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Active Jobs
          </h3>
          <div className="text-sm text-gray-500">
            {activeJobs.length} job{activeJobs.length !== 1 ? 's' : ''}
          </div>
        </div>

        {activeJobs.length === 0 ? (
          <p className="text-sm text-gray-500">No active jobs</p>
        ) : (
          <div className="space-y-4">
            {activeJobs.map((job, index) => (
              <div
                key={job.id}
                className={`border rounded-lg p-4 hover:border-blue-500 cursor-pointer ${
                  job.id === selectedJobId ? 'border-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1" onClick={() => handleJobSelect(job.id)}>
                    <h4 className="text-sm font-medium text-gray-900">
                      Job {job.id}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Status: {job.status}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {job.status === 'processing' && (
                      <>
                        <button
                          onClick={() => handlePrioritizeJob(job.id, 'up')}
                          className="p-1 text-gray-500 hover:text-blue-600"
                          disabled={index === 0}
                        >
                          <ArrowUpIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handlePrioritizeJob(job.id, 'down')}
                          className="p-1 text-gray-500 hover:text-blue-600"
                          disabled={index === activeJobs.length - 1}
                        >
                          <ArrowDownIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleCancelJob(job.id)}
                          className="p-1 text-gray-500 hover:text-red-600"
                        >
                          <PauseIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <div className="text-sm text-gray-500">
                      {new Date(job.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {job.status === 'processing' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-gray-500">
                        {job.current_stage} - {job.progress}%
                      </p>
                      <p className="text-xs text-gray-500">
                        Priority: {index + 1}
                      </p>
                    </div>
                    {job.current_stage_details && (
                      <p className="text-xs text-gray-500 mt-1">
                        {job.current_stage_details}
                      </p>
                    )}
                  </div>
                )}

                {job.status === 'failed' && job.error && (
                  <div className="mt-2">
                    <p className="text-sm text-red-500">
                      Error: {job.error}
                    </p>
                    <button
                      onClick={() => handleJobSelect(job.id)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Details
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 