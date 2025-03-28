import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useVideoProcessing } from '../hooks/useVideoProcessing';
import { showNotification } from './NotificationSystem';

export const JobStatus: React.FC = () => {
  const { selectedJob, isLoadingSelectedJob } = useVideoProcessing();

  useEffect(() => {
    if (!selectedJob) return;

    switch (selectedJob.status) {
      case 'completed':
        showNotification.success('Video processing completed successfully');
        break;
      case 'failed':
        showNotification.error(`Processing failed: ${selectedJob.error}`);
        break;
      case 'processing':
        showNotification.info('Video is being processed...');
        break;
      default:
        break;
    }
  }, [selectedJob?.status, selectedJob?.error]);

  if (isLoadingSelectedJob) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3 mt-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedJob) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'processing':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Processing Status
          </h3>
          <div className={`flex items-center ${getStatusColor(selectedJob.status)}`}>
            {getStatusIcon(selectedJob.status)}
            <span className="ml-2 text-sm font-medium capitalize">
              {selectedJob.status}
            </span>
          </div>
        </div>

        {selectedJob.status === 'processing' && (
          <div className="space-y-4">
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    {selectedJob.current_stage}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {Math.round(selectedJob.progress)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div
                  style={{ width: `${selectedJob.progress}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                ></div>
              </div>
            </div>
          </div>
        )}

        {selectedJob.status === 'completed' && selectedJob.result && (
          <div className="mt-4 space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                {selectedJob.result.message}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900">Scenes</h4>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedJob.result.scenes.length} scenes detected
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900">Output</h4>
                <p className="mt-1 text-sm text-gray-600 truncate">
                  {selectedJob.result.output_path}
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedJob.status === 'failed' && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              Error: {selectedJob.error}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}; 