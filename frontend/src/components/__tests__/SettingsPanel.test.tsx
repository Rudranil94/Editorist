/// <reference types="vitest" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, beforeEach, expect, Mock } from 'vitest';
import '@testing-library/jest-dom/extend-expect';
import { SettingsPanel } from '../SettingsPanel';
import { mockAuthContext, MockAuthProvider } from '../../test/mocks/AuthContext';
import { showNotification } from '../NotificationSystem';
import type { UserPreferences } from '../SettingsPanel';

// Mock the NotificationSystem
vi.mock('../NotificationSystem', () => ({
  showNotification: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Create a mock function with the correct type
const mockUpdatePreferences = vi.fn() as Mock<[UserPreferences], Promise<void>>;
mockAuthContext.updatePreferences = mockUpdatePreferences;

describe('SettingsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders settings panel correctly', () => {
    render(
      <MockAuthProvider>
        <SettingsPanel />
      </MockAuthProvider>
    );

    expect(screen.getByText(/settings/i)).toBeInTheDocument();
    expect(screen.getByText(/theme/i)).toBeInTheDocument();
    expect(screen.getByText(/default style/i)).toBeInTheDocument();
    expect(screen.getByText(/default strength/i)).toBeInTheDocument();
    expect(screen.getByText(/quality threshold/i)).toBeInTheDocument();
    expect(screen.getByText(/importance threshold/i)).toBeInTheDocument();
    expect(screen.getByText(/motion analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/continuity analysis/i)).toBeInTheDocument();
  });

  it('displays current user preferences', () => {
    render(
      <MockAuthProvider>
        <SettingsPanel />
      </MockAuthProvider>
    );

    expect(screen.getByRole('combobox', { name: /theme/i })).toHaveValue('light');
    expect(screen.getByRole('combobox', { name: /default style/i })).toHaveValue('cinematic');
    expect(screen.getByRole('slider', { name: /default strength/i })).toHaveValue('0.5');
    expect(screen.getByRole('slider', { name: /quality threshold/i })).toHaveValue('0.7');
    expect(screen.getByRole('slider', { name: /importance threshold/i })).toHaveValue('0.6');
    expect(screen.getByRole('checkbox', { name: /motion analysis/i })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: /continuity analysis/i })).toBeChecked();
  });

  it('handles theme change', async () => {
    mockUpdatePreferences.mockResolvedValue(undefined);
    render(
      <MockAuthProvider>
        <SettingsPanel />
      </MockAuthProvider>
    );

    const themeSelect = screen.getByRole('combobox', { name: /theme/i });
    fireEvent.change(themeSelect, { target: { value: 'dark' } });

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        ...mockAuthContext.user?.preferences,
        theme: 'dark',
      });
      expect(showNotification.success).toHaveBeenCalledWith('Preferences updated successfully');
    });
  });

  it('handles style change', async () => {
    mockUpdatePreferences.mockResolvedValue(undefined);
    render(
      <MockAuthProvider>
        <SettingsPanel />
      </MockAuthProvider>
    );

    const styleSelect = screen.getByRole('combobox', { name: /default style/i });
    fireEvent.change(styleSelect, { target: { value: 'vintage' } });

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        ...mockAuthContext.user?.preferences,
        defaultStyle: 'vintage',
      });
      expect(showNotification.success).toHaveBeenCalledWith('Preferences updated successfully');
    });
  });

  it('handles strength change', async () => {
    mockUpdatePreferences.mockResolvedValue(undefined);
    render(
      <MockAuthProvider>
        <SettingsPanel />
      </MockAuthProvider>
    );

    const strengthSlider = screen.getByRole('slider', { name: /default strength/i });
    fireEvent.change(strengthSlider, { target: { value: '0.8' } });

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        ...mockAuthContext.user?.preferences,
        defaultStrength: 0.8,
      });
      expect(showNotification.success).toHaveBeenCalledWith('Preferences updated successfully');
    });
  });

  it('handles quality threshold change', async () => {
    mockUpdatePreferences.mockResolvedValue(undefined);
    render(
      <MockAuthProvider>
        <SettingsPanel />
      </MockAuthProvider>
    );

    const qualitySlider = screen.getByRole('slider', { name: /quality threshold/i });
    fireEvent.change(qualitySlider, { target: { value: '0.9' } });

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        ...mockAuthContext.user?.preferences,
        defaultQualityThreshold: 0.9,
      });
      expect(showNotification.success).toHaveBeenCalledWith('Preferences updated successfully');
    });
  });

  it('handles importance threshold change', async () => {
    mockUpdatePreferences.mockResolvedValue(undefined);
    render(
      <MockAuthProvider>
        <SettingsPanel />
      </MockAuthProvider>
    );

    const importanceSlider = screen.getByRole('slider', { name: /importance threshold/i });
    fireEvent.change(importanceSlider, { target: { value: '0.8' } });

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        ...mockAuthContext.user?.preferences,
        defaultImportanceThreshold: 0.8,
      });
      expect(showNotification.success).toHaveBeenCalledWith('Preferences updated successfully');
    });
  });

  it('handles motion analysis toggle', async () => {
    mockUpdatePreferences.mockResolvedValue(undefined);
    render(
      <MockAuthProvider>
        <SettingsPanel />
      </MockAuthProvider>
    );

    const motionCheckbox = screen.getByRole('checkbox', { name: /motion analysis/i });
    fireEvent.click(motionCheckbox);

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        ...mockAuthContext.user?.preferences,
        enableMotionAnalysis: false,
      });
      expect(showNotification.success).toHaveBeenCalledWith('Preferences updated successfully');
    });
  });

  it('handles continuity analysis toggle', async () => {
    mockUpdatePreferences.mockResolvedValue(undefined);
    render(
      <MockAuthProvider>
        <SettingsPanel />
      </MockAuthProvider>
    );

    const continuityCheckbox = screen.getByRole('checkbox', { name: /continuity analysis/i });
    fireEvent.click(continuityCheckbox);

    await waitFor(() => {
      expect(mockUpdatePreferences).toHaveBeenCalledWith({
        ...mockAuthContext.user?.preferences,
        enableContinuityAnalysis: false,
      });
      expect(showNotification.success).toHaveBeenCalledWith('Preferences updated successfully');
    });
  });

  it('handles preference update failure', async () => {
    mockUpdatePreferences.mockRejectedValue(new Error('Update failed'));
    render(
      <MockAuthProvider>
        <SettingsPanel />
      </MockAuthProvider>
    );

    const themeSelect = screen.getByRole('combobox', { name: /theme/i });
    fireEvent.change(themeSelect, { target: { value: 'dark' } });

    await waitFor(() => {
      expect(showNotification.error).toHaveBeenCalledWith('Failed to update preferences');
    });
  });

  it('shows loading state during preference update', async () => {
    mockUpdatePreferences.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(
      <MockAuthProvider>
        <SettingsPanel />
      </MockAuthProvider>
    );

    const themeSelect = screen.getByRole('combobox', { name: /theme/i });
    fireEvent.change(themeSelect, { target: { value: 'dark' } });

    expect(screen.getByText(/updating/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/updating/i)).not.toBeInTheDocument();
    });
  });
}); 