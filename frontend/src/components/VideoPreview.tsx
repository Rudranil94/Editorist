import React, { useState, useEffect } from 'react';
import { useVideoProcessing } from '../hooks/useVideoProcessing';
import { showNotification } from './NotificationSystem';

export const VideoPreview: React.FC = () => {
  const { selectedJob } = useVideoProcessing();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setCurrentTime(e.currentTarget.currentTime);
  };

  const handleLoadedMetadata = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setDuration(e.currentTarget.duration);
    setIsLoading(false);
    showNotification.success('Video loaded successfully');
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    setIsLoading(false);
    showNotification.error('Failed to load video');
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (selectedJob?.status === 'completed' && selectedJob.result) {
      showNotification.success('Processed video is ready');
    }
  }, [selectedJob?.status, selectedJob?.result]);

  if (!selectedJob) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Video Preview
        </h3>

        <div className="space-y-6">
          {/* Original Video */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Original Video
            </h4>
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <video
                src={selectedJob.video_path}
                className="w-full h-full object-contain"
                controls
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onError={handleError}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Processed Video */}
          {selectedJob.status === 'completed' && selectedJob.result && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Processed Video
              </h4>
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <video
                  src={selectedJob.result.output_path}
                  className="w-full h-full object-contain"
                  controls
                  onLoadedMetadata={handleLoadedMetadata}
                  onError={handleError}
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <a
                  href={selectedJob.result.output_path}
                  download
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => showNotification.info('Starting video download...')}
                >
                  Download Processed Video
                </a>
                <span className="text-sm text-gray-500">
                  {selectedJob.result.scenes.length} scenes
                </span>
              </div>
            </div>
          )}

          {/* Scene Preview */}
          {selectedJob.status === 'completed' && selectedJob.result && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Scene Preview
              </h4>
              <div className="grid grid-cols-3 gap-4">
                {selectedJob.result.scenes.map((_, index) => (
                  <div
                    key={index}
                    className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm text-gray-500">
                        Scene {index + 1}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 