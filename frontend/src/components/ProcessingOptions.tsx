import React, { useState } from 'react';
import { useVideoProcessing } from '../hooks/useVideoProcessing';
import { VideoProcessingParams } from '../services/api';
import { showNotification } from './NotificationSystem';

const defaultParams: VideoProcessingParams = {
  style: 'cinematic',
  strength: 0.5,
  transitions: 'fade',
  detect_scenes: true,
  analyze_content: true,
  optimize_scenes: true,
  min_quality_threshold: 0.6,
  min_importance_threshold: 0.4,
  analyze_motion: true,
  analyze_continuity: true,
  min_object_continuity: 0.5,
};

export const ProcessingOptions: React.FC = () => {
  const { processVideo, isProcessing, error } = useVideoProcessing();
  const [params, setParams] = useState<VideoProcessingParams>(defaultParams);

  React.useEffect(() => {
    if (error) {
      showNotification.error(
        `Error processing video: ${error.message}`,
        0, // Don't auto-dismiss
        {
          label: 'Retry Processing',
          onClick: () => processVideo({ videoPath: '', params })
        }
      );
    }
  }, [error, params, processVideo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await processVideo({ videoPath: '', params });
      showNotification.success('Video processing started successfully');
    } catch (error) {
      showNotification.error(
        'Failed to start video processing',
        0, // Don't auto-dismiss
        {
          label: 'Retry',
          onClick: () => processVideo({ videoPath: '', params })
        }
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Processing Options
          </h3>

          <div className="space-y-4">
            {/* Style Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Style
              </label>
              <select
                name="style"
                value={params.style}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="cinematic">Cinematic</option>
                <option value="vibrant">Vibrant</option>
                <option value="muted">Muted</option>
              </select>
            </div>

            {/* Strength Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Style Strength: {Math.round(params.strength * 100)}%
              </label>
              <input
                type="range"
                name="strength"
                min="0"
                max="1"
                step="0.1"
                value={params.strength}
                onChange={handleChange}
                className="mt-1 block w-full"
              />
            </div>

            {/* Transitions */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Transitions
              </label>
              <select
                name="transitions"
                value={params.transitions}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="fade">Fade</option>
                <option value="slide">Slide</option>
                <option value="dissolve">Dissolve</option>
              </select>
            </div>

            {/* Analysis Options */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Analysis Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="detect_scenes"
                    checked={params.detect_scenes}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Detect Scenes
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="analyze_content"
                    checked={params.analyze_content}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Analyze Content
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="optimize_scenes"
                    checked={params.optimize_scenes}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Optimize Scenes
                  </span>
                </label>
              </div>
            </div>

            {/* Thresholds */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Quality Threshold: {Math.round(params.min_quality_threshold * 100)}%
                </label>
                <input
                  type="range"
                  name="min_quality_threshold"
                  min="0"
                  max="1"
                  step="0.1"
                  value={params.min_quality_threshold}
                  onChange={handleChange}
                  className="mt-1 block w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Importance Threshold: {Math.round(params.min_importance_threshold * 100)}%
                </label>
                <input
                  type="range"
                  name="min_importance_threshold"
                  min="0"
                  max="1"
                  step="0.1"
                  value={params.min_importance_threshold}
                  onChange={handleChange}
                  className="mt-1 block w-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isProcessing}
            className={`px-4 py-2 rounded-md text-white font-medium
              ${isProcessing
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {isProcessing ? 'Processing...' : 'Process Video'}
          </button>
        </div>
      </form>
    </div>
  );
}; 