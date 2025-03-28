import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { showNotification } from './NotificationSystem';

export interface UserPreferences {
  theme: 'light' | 'dark';
  defaultStyle: string;
  defaultStrength: number;
  defaultQualityThreshold: number;
  defaultImportanceThreshold: number;
  enableMotionAnalysis: boolean;
  enableContinuityAnalysis: boolean;
}

export const SettingsPanel: React.FC = () => {
  const { user, updatePreferences } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(user?.preferences || {
    theme: 'light',
    defaultStyle: 'cinematic',
    defaultStrength: 0.5,
    defaultQualityThreshold: 0.7,
    defaultImportanceThreshold: 0.6,
    enableMotionAnalysis: true,
    enableContinuityAnalysis: true,
  });

  const handlePreferenceChange = async (key: keyof UserPreferences, value: any) => {
    setIsUpdating(true);
    try {
      const updatedPreferences = { ...preferences, [key]: value };
      await updatePreferences(updatedPreferences);
      setPreferences(updatedPreferences);
      showNotification.success('Preferences updated successfully');
    } catch (error) {
      showNotification.error('Failed to update preferences');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Settings</h2>
      
      {isUpdating && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Updating preferences...
        </div>
      )}

      <div className="space-y-6">
        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Theme
          </label>
          <select
            value={preferences.theme}
            onChange={(e) => handlePreferenceChange('theme', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        {/* Default Style */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Default Style
          </label>
          <select
            value={preferences.defaultStyle}
            onChange={(e) => handlePreferenceChange('defaultStyle', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="cinematic">Cinematic</option>
            <option value="vintage">Vintage</option>
            <option value="modern">Modern</option>
            <option value="artistic">Artistic</option>
          </select>
        </div>

        {/* Default Strength */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Default Strength
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={preferences.defaultStrength}
            onChange={(e) => handlePreferenceChange('defaultStrength', parseFloat(e.target.value))}
            className="mt-1 block w-full"
          />
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {Math.round(preferences.defaultStrength * 100)}%
          </div>
        </div>

        {/* Quality Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Quality Threshold
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={preferences.defaultQualityThreshold}
            onChange={(e) => handlePreferenceChange('defaultQualityThreshold', parseFloat(e.target.value))}
            className="mt-1 block w-full"
          />
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {Math.round(preferences.defaultQualityThreshold * 100)}%
          </div>
        </div>

        {/* Importance Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Importance Threshold
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={preferences.defaultImportanceThreshold}
            onChange={(e) => handlePreferenceChange('defaultImportanceThreshold', parseFloat(e.target.value))}
            className="mt-1 block w-full"
          />
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {Math.round(preferences.defaultImportanceThreshold * 100)}%
          </div>
        </div>

        {/* Motion Analysis Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={preferences.enableMotionAnalysis}
            onChange={(e) => handlePreferenceChange('enableMotionAnalysis', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Enable Motion Analysis
          </label>
        </div>

        {/* Continuity Analysis Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={preferences.enableContinuityAnalysis}
            onChange={(e) => handlePreferenceChange('enableContinuityAnalysis', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Enable Continuity Analysis
          </label>
        </div>
      </div>
    </div>
  );
}; 