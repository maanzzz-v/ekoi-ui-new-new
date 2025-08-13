/**
 * React hooks for resume upload functionality
 */

import { useState, useCallback } from 'react';
import { resumeApi, type UploadResponse } from '../api';

export interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  result: UploadResponse | null;
}

export interface UseResumeUploadReturn {
  uploadState: UploadState;
  uploadResumes: (files: File[]) => Promise<UploadResponse>;
  resetUpload: () => void;
  clearError: () => void;
}

/**
 * Hook for handling resume uploads with state management
 */
export function useResumeUpload(): UseResumeUploadReturn {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    result: null,
  });

  const uploadResumes = useCallback(async (files: File[]): Promise<UploadResponse> => {
    setUploadState({
      isUploading: true,
      progress: 0,
      error: null,
      result: null,
    });

    try {
      // Simulate progress updates (since we can't get real progress from fetch)
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + Math.random() * 20, 90),
        }));
      }, 200);

      const result = await resumeApi.upload(files);

      clearInterval(progressInterval);

      setUploadState({
        isUploading: false,
        progress: 100,
        error: null,
        result,
      });

      return result;
    } catch (error) {
      setUploadState({
        isUploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Upload failed',
        result: null,
      });
      
      throw error;
    }
  }, []);

  const resetUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
      result: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setUploadState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    uploadState,
    uploadResumes,
    resetUpload,
    clearError,
  };
}

/**
 * Upload status component props
 */
export interface UploadStatusProps {
  uploadState: UploadState;
  onRetry?: () => void;
  onClear?: () => void;
}

/**
 * Utility function to get upload status message
 */
export function getUploadStatusMessage(result: UploadResponse): string {
  if (!result) return '';
  
  const { success_count = 0, total_files = 0, error_count = 0 } = result;
  
  if (error_count === 0) {
    return `✅ Successfully uploaded ${success_count} resume${success_count !== 1 ? 's' : ''}`;
  } else if (success_count > 0) {
    return `⚠️ Uploaded ${success_count}/${total_files} resumes. ${error_count} failed.`;
  } else {
    return `❌ Upload failed. ${error_count} file${error_count !== 1 ? 's' : ''} could not be processed.`;
  }
}

/**
 * Get upload progress text
 */
export function getUploadProgressText(uploadState: UploadState): string {
  if (!uploadState.isUploading) return '';
  
  if (uploadState.progress < 30) {
    return 'Preparing files for upload...';
  } else if (uploadState.progress < 60) {
    return 'Uploading to server...';
  } else if (uploadState.progress < 90) {
    return 'Processing and extracting data...';
  } else {
    return 'Creating vector embeddings...';
  }
}
