/**
 * React Hook for Resume Shortlisting
 * Provides easy-to-use shortlisting functionality for React components
 */

import { useState, useCallback, useRef } from 'react';
import { shortlistingService, type ShortlistingOptions, type ShortlistingResult, type JobRequirement } from '../shortlisting-service';

export interface UseShortlistingOptions {
  autoAnalyze?: boolean;
  defaultMethod?: 'vector' | 'chat' | 'hybrid';
  defaultTopK?: number;
}

export interface ShortlistingState {
  isLoading: boolean;
  isAnalyzing: boolean;
  results: ShortlistingResult | null;
  analysis: any | null;
  error: string | null;
  progress: number;
  lastQuery: string | null;
  method: string | null;
}

export function useShortlisting(options: UseShortlistingOptions = {}) {
  const {
    autoAnalyze = true,
    defaultMethod = 'hybrid',
    defaultTopK = 10
  } = options;

  const [state, setState] = useState<ShortlistingState>({
    isLoading: false,
    isAnalyzing: false,
    results: null,
    analysis: null,
    error: null,
    progress: 0,
    lastQuery: null,
    method: null
  });

  // Ref to track the current request and prevent race conditions
  const currentRequestRef = useRef<string | null>(null);

  /**
   * Main shortlisting function
   */
  const shortlistCandidates = useCallback(async (
    jobDescription: string,
    customOptions: ShortlistingOptions = {}
  ) => {
    const requestId = Date.now().toString();
    currentRequestRef.current = requestId;

    // Merge options with defaults
    const mergedOptions: ShortlistingOptions = {
      method: defaultMethod,
      topK: defaultTopK,
      includeAnalysis: autoAnalyze,
      ...customOptions
    };

    setState(prev => ({
      ...prev,
      isLoading: true,
      isAnalyzing: autoAnalyze,
      error: null,
      progress: 0,
      lastQuery: jobDescription,
      method: mergedOptions.method || defaultMethod
    }));

    try {
      // Update progress during analysis
      if (autoAnalyze) {
        setState(prev => ({ ...prev, progress: 20 }));
      }

      // Perform shortlisting
      setState(prev => ({ ...prev, progress: 50, isAnalyzing: false }));
      
      const results = await shortlistingService.shortlistCandidates(
        jobDescription,
        mergedOptions
      );

      // Check if this is still the current request
      if (currentRequestRef.current !== requestId) {
        console.log('🚫 Request cancelled, newer request in progress');
        return;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isAnalyzing: false,
        results,
        analysis: results.analysis || null,
        progress: 100,
        error: null
      }));

      return results;

    } catch (error) {
      // Check if this is still the current request
      if (currentRequestRef.current !== requestId) {
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Shortlisting failed';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAnalyzing: false,
        error: errorMessage,
        progress: 0,
        results: null
      }));

      throw error;
    }
  }, [defaultMethod, defaultTopK, autoAnalyze]);

  /**
   * Analyze job requirements without performing search
   */
  const analyzeJobRequirements = useCallback(async (jobDescription: string) => {
    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      error: null
    }));

    try {
      const analysis = await shortlistingService.analyzeJobRequirements(jobDescription);
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        analysis,
        error: null
      }));

      return analysis;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      
      setState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage
      }));

      throw error;
    }
  }, []);

  /**
   * Shortlist for specific job role
   */
  const shortlistForJobRole = useCallback(async (
    jobRequirement: JobRequirement,
    customOptions: ShortlistingOptions = {}
  ) => {
    const mergedOptions: ShortlistingOptions = {
      method: 'hybrid',
      topK: defaultTopK,
      includeAnalysis: true,
      ...customOptions
    };

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: 0,
      lastQuery: jobRequirement.title,
      method: 'hybrid'
    }));

    try {
      setState(prev => ({ ...prev, progress: 30 }));
      
      const results = await shortlistingService.shortlistForJobRole(
        jobRequirement,
        mergedOptions
      );

      setState(prev => ({
        ...prev,
        isLoading: false,
        results,
        analysis: results.analysis || null,
        progress: 100,
        error: null
      }));

      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Job role shortlisting failed';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        progress: 0,
        results: null
      }));

      throw error;
    }
  }, [defaultTopK]);

  /**
   * Quick vector search
   */
  const vectorSearch = useCallback(async (query: string, topK?: number) => {
    return shortlistCandidates(query, {
      method: 'vector',
      topK: topK || defaultTopK,
      includeAnalysis: false
    });
  }, [shortlistCandidates, defaultTopK]);

  /**
   * Quick chat search
   */
  const chatSearch = useCallback(async (message: string, topK?: number) => {
    return shortlistCandidates(message, {
      method: 'chat',
      topK: topK || defaultTopK,
      includeAnalysis: true
    });
  }, [shortlistCandidates, defaultTopK]);

  /**
   * Clear results and reset state
   */
  const clearResults = useCallback(() => {
    currentRequestRef.current = null;
    setState({
      isLoading: false,
      isAnalyzing: false,
      results: null,
      analysis: null,
      error: null,
      progress: 0,
      lastQuery: null,
      method: null
    });
  }, []);

  /**
   * Cancel current operation
   */
  const cancelOperation = useCallback(() => {
    currentRequestRef.current = null;
    setState(prev => ({
      ...prev,
      isLoading: false,
      isAnalyzing: false,
      progress: 0
    }));
  }, []);

  /**
   * Re-run last search with different method
   */
  const changeMethod = useCallback(async (newMethod: 'vector' | 'chat' | 'hybrid') => {
    if (!state.lastQuery) {
      throw new Error('No previous query to re-run');
    }

    return shortlistCandidates(state.lastQuery, {
      method: newMethod,
      topK: defaultTopK,
      includeAnalysis: autoAnalyze
    });
  }, [state.lastQuery, shortlistCandidates, defaultTopK, autoAnalyze]);

  return {
    // State
    ...state,
    
    // Primary functions
    shortlistCandidates,
    analyzeJobRequirements,
    shortlistForJobRole,
    
    // Quick methods
    vectorSearch,
    chatSearch,
    
    // Utility functions
    clearResults,
    cancelOperation,
    changeMethod,
    
    // Computed properties
    hasResults: !!state.results,
    candidateCount: state.results?.candidates.length || 0,
    isWorking: state.isLoading || state.isAnalyzing,
    canRetry: !!state.error && !!state.lastQuery,
    
    // Helper functions
    getTopCandidates: (count: number = 5) => 
      state.results?.candidates.slice(0, count) || [],
    
    getCandidatesByScore: (minScore: number = 0.5) =>
      state.results?.candidates.filter(c => c.score >= minScore) || [],
    
    getCandidatesBySkills: (requiredSkills: string[]) =>
      state.results?.candidates.filter(candidate =>
        requiredSkills.some(skill =>
          candidate.skills.some(candidateSkill =>
            candidateSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      ) || []
  };
}

export default useShortlisting;
