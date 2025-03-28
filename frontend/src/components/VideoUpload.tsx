import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useVideoProcessing } from '../hooks/useVideoProcessing';
import { showNotification } from './NotificationSystem';

export const VideoUpload: React.FC = () => {
  const { uploadVideo, isUploading, error } = useVideoProcessing();
  const [lastFile, setLastFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.size > 500 * 1024 * 1024) { // 500MB limit
          showNotification.error('File size exceeds 500MB limit');
          return;
        }
        setLastFile(file);
        uploadVideo(file);
      }
    },
    [uploadVideo]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxFiles: 1
  });

  React.useEffect(() => {
    if (error) {
      showNotification.error(
        `Error uploading video: ${error.message}`,
        0, // Don't auto-dismiss
        lastFile ? {
          label: 'Retry Upload',
          onClick: () => uploadVideo(lastFile)
        } : undefined
      );
    }
  }, [error, lastFile, uploadVideo]);

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'Drop the video here'
            : 'Drag and drop a video file here, or click to select'}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Supported formats: MP4, MOV, AVI, MKV (max 500MB)
        </p>
      </div>

      {isUploading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Uploading video...</p>
        </div>
      )}
    </div>
  );
}; 