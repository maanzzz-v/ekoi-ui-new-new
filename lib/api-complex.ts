/**
 * Enhanced API service for communicating with the FastAPI backend
 * Complete integration with all refined backend endpoints and UI-optimized features
 * Implements the complete API reference with advanced UI components and conversation flow
 */

import config from './config';

const API_BASE_URL = config.api.baseUrl;

// ============================
// Health & Status Types
// ============================

export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
}

export interface DetailedHealthResponse extends HealthResponse {
  components: {
    database: {
      status: string;
      type: string;
    };
    vector_db: {
      status: string;
      llm_provider: {
        provider: string;
        dimension: number;
        model: string;
      };
      pinecone_available: boolean;
      faiss_available: boolean;
    };
  };
}

export interface LLMProviderInfo {
  status: string;
  provider_info: {
    provider: string;
    dimension: number;
    model: string;
  };
  available_providers: string[];
}

// ============================
// Resume Management Types
// ============================

export interface UploadResponse {
  message: string;
  uploaded_files: string[];
  failed_files?: string[];
  errors?: string[];
  total_files: number;
  success: boolean;
}

export interface ResumeExtractedInfo {
  name?: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience: Array<{
    description: string;
    extracted: boolean;
  }>;
  education: Array<{
    description: string;
    extracted: boolean;
  }>;
  summary?: string;
}

export interface Resume {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path: string;
  upload_timestamp: string;
  processed: boolean;
  processing_timestamp?: string;
  extracted_info?: ResumeExtractedInfo;
  has_vectors: boolean;
  vector_count: number;
}

export interface ListResumesResponse {
  resumes: Resume[];
  pagination: {
    total: number;
    skip: number;
    limit: number;
    current_page: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  summary: {
    total_resumes: number;
    showing: number;
    processed: number;
    unprocessed: number;
  };
}

// ============================
// Enhanced Search Types
// ============================

export interface SearchRequest {
  query: string;
  limit?: number;
  filters?: Record<string, any>;
}

export interface SearchMatch {
  id: string;
  file_name: string;
  score: number;
  extracted_info: ResumeExtractedInfo;
  relevant_text?: string;
}

export interface BasicSearchResponse {
  query: string;
  total_results: number;
  matches: SearchMatch[];
  processing_time: number;
  success: boolean;
}

// ============================
// Enhanced UI-Optimized Types
// ============================

export interface CandidateCard {
  id: string;
  rank: number;
  score: number;
  name: string;
  title: string;
  skills: string[];
  experience_summary: string;
  match_highlights: string[];
  file_name: string;
}

export interface QualityIndicators {
  total_matches: number;
  high_quality: number;
  average_score: number;
  consistency: number;
}

export interface SearchInsights {
  detected_domains: string[];
  technical_depth: 'low' | 'medium' | 'high';
  intent_confidence: number;
}

export interface UIComponents {
  candidate_cards: CandidateCard[];
  skill_tags: string[];
  experience_chart: {
    Junior: number;
    'Mid-level': number;
    Senior: number;
    Lead: number;
  };
  quality_indicators: QualityIndicators;
  search_insights: SearchInsights;
}

export interface ConversationFlow {
  next_suggestions: string[];
  follow_up_questions: string[];
  refinement_options: string[];
  flow_type: 'search_results' | 'follow_up_analysis' | 'refinement';
}

export interface QuickAction {
  label: string;
  action: 'contact' | 'compare' | 'refine' | 'search' | 'next';
  target?: string;
  query?: string;
}

export interface ResponseMetadata {
  response_type: 'single_match' | 'multiple_matches' | 'no_match' | 'follow_up_analysis';
  confidence_level: 'low' | 'medium' | 'high';
  search_quality: {
    average_score: number;
    score_distribution: {
      excellent: number;
      good: number;
      fair: number;
      poor: number;
    };
    top_score: number;
    consistency: number;
  };
  timestamp: string;
}

// ============================
// Enhanced Chat Search Types
// ============================

export interface EnhancedChatSearchRequest {
  message: string;
  top_k?: number;
  filters?: Record<string, any>;
}

export interface EnhancedChatSearchResponse {
  message: string;
  query: string;
  original_message: string;
  matches: SearchMatch[];
  total_results: number;
  success: boolean;
  session_id?: string;
  
  // Enhanced UI Components
  ui_components: UIComponents;
  conversation_flow: ConversationFlow;
  quick_actions: QuickAction[];
  response_metadata: ResponseMetadata;
}

// ============================
// Query Analysis Types
// ============================

export interface QueryAnalysisRequest {
  message: string;
}

export interface IntelligenceAnalysis {
  original_query: string;
  query_type: string;
  intent_confidence: number;
  skill_domains: Array<{
    domain: string;
    score: number;
    description: string;
    matched_skills: string[];
  }>;
  experience_indicators: {
    years_mentioned?: number;
    level?: string;
  };
  role_specificity: string;
  urgency_level: string;
  search_scope: string;
  context_aware: boolean;
  semantic_keywords: string[];
  technical_depth: 'low' | 'medium' | 'high';
  suggestions: string[];
  extracted_keywords: string[];
}

export interface QueryAnalysisResponse {
  original_message: string;
  intelligence_analysis: IntelligenceAnalysis;
  query_quality: {
    score: number;
    level: string;
    completeness: number;
  };
  optimization_tips: string[];
}

// ============================
// Query Optimization Types
// ============================

export interface QueryOptimizationRequest {
  query: string;
}

export interface QueryOptimizationResponse {
  original_query: string;
  query_analysis: {
    intent_type: string;
    confidence: number;
    technical_depth: string;
    detected_skills: string[];
  };
  quality_assessment: {
    score: number;
    level: string;
    completeness: number;
  };
  optimization_suggestions: string[];
  optimization_tips: string[];
  enhanced_alternatives: Array<{
    query: string;
    improvement: string;
    expected_improvement: string;
  }>;
  success: boolean;
}

// ============================
// Enhanced Chat Session Types
// ============================

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    search_results?: string[];
    search_metadata?: any;
    ui_components?: UIComponents;
    conversation_flow?: ConversationFlow;
    quick_actions?: QuickAction[];
  } | null;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
  context: {
    last_search?: {
      query: string;
      results: string[];
      total_results: number;
    };
  };
  is_active: boolean;
}

export interface CreateSessionRequest {
  user_id?: string;
  name?: string;
}

export interface CreateSessionResponse {
  session: ChatSession;
  success: boolean;
  message: string;
}

export interface ListSessionsResponse {
  sessions: ChatSession[];
  total: number;
  success: boolean;
}

export interface SessionSearchRequest {
  message: string;
  top_k?: number;
  filters?: Record<string, any>;
}

export interface SessionSearchResponse {
  message: string;
  query: string;
  original_message: string;
  matches: SearchMatch[];
  total_results: number;
  success: boolean;
  session_id: string;
  
  // Enhanced UI Components (same as chat search)
  ui_components: UIComponents;
  conversation_flow: ConversationFlow;
  quick_actions: QuickAction[];
  response_metadata: ResponseMetadata;
}

export interface FollowUpRequest {
  question: string;
  context?: {
    last_search?: string;
    candidates?: string[];
  };
}

export interface FollowUpResponse {
  session_id: string;
  question: string;
  answer: string;
  
  // Enhanced UI Components for follow-up
  ui_components?: {
    show_analysis: boolean;
    candidate_comparison: boolean;
    detailed_view: boolean;
  };
  conversation_flow: ConversationFlow;
  quick_actions: QuickAction[];
  response_metadata: ResponseMetadata;
  success: boolean;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ============================
  // Health & Status Endpoints
  // ============================

  /**
   * Basic health check
   * GET /api/v1/health/
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/health/`, {
        method: 'GET',
        timeout: 5000,
      } as RequestInit);
      
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }

  /**
   * Get basic health status
   * GET /api/v1/health/
   */
  async getHealthStatus(): Promise<HealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/health/`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting health status:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to check health');
    }
  }

  /**
   * Get detailed health information
   * GET /api/v1/health/detailed
   */
  async getDetailedHealth(): Promise<DetailedHealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/health/detailed`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Detailed health check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting detailed health:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get detailed health');
    }
  }

  /**
   * Get LLM provider information
   * GET /api/v1/health/llm-provider
   */
  async getLLMProvider(): Promise<LLMProviderInfo> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/health/llm-provider`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`LLM provider check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting LLM provider info:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get LLM provider info');
    }
  }

  // ============================
  // Resume Management Endpoints
  // ============================

  /**
   * Upload multiple resume files to the backend
   * POST /api/v1/resumes/upload
   * 
   * Supports: PDF, DOCX, TXT files
   * Max size: 10MB per file
   * Processing: Extracts text, metadata, creates vector embeddings
   */
  async uploadResumes(files: File[]): Promise<UploadResponse> {
    // Validate files before upload
    const validationErrors = this.validateUploadFiles(files);
    if (validationErrors.length > 0) {
      throw new Error(`File validation failed: ${validationErrors.join(', ')}`);
    }

    const formData = new FormData();
    
    // Append each file to form data
    files.forEach((file, index) => {
      formData.append('files', file);
      console.log(`Adding file ${index + 1}/${files.length}: ${file.name} (${this.formatFileSize(file.size)})`);
    });

    try {
      console.log(`Uploading ${files.length} resume files to backend...`);
      
      const response = await fetch(`${this.baseUrl}/api/v1/resumes/upload`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary for multipart
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.detail || `Upload failed with status: ${response.status}`;
        console.error('Upload failed:', errorMessage);
        throw new Error(errorMessage);
      }

      const result: UploadResponse = await response.json();
      
      // Log upload results
      console.log(`Upload completed: ${result.uploaded_files.length}/${result.total_files} files processed successfully`);
      
      return result;

    } catch (error) {
      console.error('Error uploading files:', error);
      
      if (error instanceof Error) {
        // Re-throw with more context
        throw new Error(`Resume upload failed: ${error.message}`);
      }
      
      throw new Error('Failed to upload resume files to backend');
    }
  }

  /**
   * Get all resumes with pagination
   * GET /api/v1/resumes/
   */
  async listResumes(skip: number = 0, limit: number = 50): Promise<ListResumesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/resumes/?skip=${skip}&limit=${Math.min(limit, 100)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing resumes:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to list resumes');
    }
  }

  /**
   * Get detailed information about a specific resume
   * GET /api/v1/resumes/{resume_id}
   */
  async getResume(resumeId: string): Promise<Resume> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/resumes/${resumeId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting resume:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get resume');
    }
  }

  /**
   * Download original resume file
   * GET /api/v1/resumes/{resume_id}/download
   */
  async downloadResume(resumeId: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/resumes/${resumeId}/download`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading resume:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to download resume');
    }
  }

  /**
   * Delete a resume and its associated vectors
   * DELETE /api/v1/resumes/{resume_id}
   */
  async deleteResume(resumeId: string): Promise<{ message: string; resume_id: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete resume');
    }
  }

  // ============================
  // Enhanced Search Endpoints
  // ============================

  /**
   * Basic resume search using vector similarity
   * POST /api/v1/resumes/search
   */
  async searchResumes(request: SearchRequest): Promise<BasicSearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/resumes/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: request.query,
          limit: request.limit || 10,
          filters: request.filters || {}
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching resumes:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search resumes');
    }
  }

  // ============================
  // Enhanced Chat-Based Search Endpoints
  // ============================

  /**
   * Enhanced natural language search using RAG with UI optimization
   * POST /api/v1/chat/search
   */
  async enhancedChatSearch(request: EnhancedChatSearchRequest): Promise<EnhancedChatSearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: request.message,
          top_k: request.top_k || 10,
          filters: request.filters || {}
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in enhanced chat search:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to perform enhanced chat search');
    }
  }

  /**
   * Analyze search query intent with intelligence
   * POST /api/v1/chat/analyze?message={query}
   */
  async analyzeQuery(request: QueryAnalysisRequest): Promise<QueryAnalysisResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat/analyze?message=${encodeURIComponent(request.message)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error analyzing query:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to analyze query');
    }
  }

  /**
   * Get query optimization suggestions
   * POST /api/v1/chat/optimize-query?query={query}
   */
  async optimizeQuery(request: QueryOptimizationRequest): Promise<QueryOptimizationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat/optimize-query?query=${encodeURIComponent(request.query)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error optimizing query:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to optimize query');
    }
  }

  // ============================
  // Chat Session Management
  // ============================

  /**
   * Create a new chat session
   * POST /api/v1/chat/sessions
   */
  async createChatSession(request: CreateSessionRequest = {}): Promise<CreateSessionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: request.user_id || 'anonymous',
          name: request.name
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create chat session');
    }
  }

  /**
   * List all chat sessions
   * GET /api/v1/chat/sessions
   */
  async listChatSessions(limit: number = 50, skip: number = 0, activeOnly: boolean = true): Promise<ListSessionsResponse> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        skip: skip.toString(),
        active_only: activeOnly.toString()
      });

      const response = await fetch(`${this.baseUrl}/api/v1/chat/sessions?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing chat sessions:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to list chat sessions');
    }
  }

  /**
   * Get a specific chat session
   * GET /api/v1/chat/sessions/{session_id}
   */
  async getChatSession(sessionId: string): Promise<{ session: ChatSession; success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting chat session:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get chat session');
    }
  }

  /**
   * Search within a chat session
   * POST /api/v1/chat/sessions/{session_id}/search
   */
  async searchInSession(sessionId: string, request: SessionSearchRequest): Promise<SessionSearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat/sessions/${sessionId}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: request.message,
          top_k: request.top_k || 10,
          filters: request.filters || {}
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching in session:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search in session');
    }
  }

  /**
   * Ask follow-up questions in a session with enhanced analysis
   * POST /api/v1/chat/sessions/{session_id}/followup
   */
  async askFollowUp(sessionId: string, request: FollowUpRequest): Promise<FollowUpResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat/sessions/${sessionId}/followup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: request.question,
          context: request.context || {}
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error asking follow-up question:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to ask follow-up question');
    }
  }

  /**
   * Delete (deactivate) a chat session
   * DELETE /api/v1/chat/sessions/{session_id}
   */
  async deleteChatSession(sessionId: string): Promise<{ session_id: string; message: string; success: boolean }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete chat session');
    }
  }

  // ============================
  // Utility Methods
  // ============================

  /**
   * Validate files before upload
   */
  private validateUploadFiles(files: File[]): string[] {
    const errors: string[] = [];
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    
    if (files.length === 0) {
      errors.push('No files selected for upload');
      return errors;
    }

    files.forEach((file, index) => {
      // Check file type
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.includes(fileExtension)) {
        errors.push(`File ${index + 1} (${file.name}): Unsupported file type. Allowed: PDF, DOC, DOCX, TXT`);
      }

      // Check file size
      if (file.size > maxSizeBytes) {
        errors.push(`File ${index + 1} (${file.name}): File too large (${this.formatFileSize(file.size)}). Maximum: 10MB`);
      }

      // Check if file is empty
      if (file.size === 0) {
        errors.push(`File ${index + 1} (${file.name}): File is empty`);
      }
    });

    return errors;
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

// Export a singleton instance
export const apiService = new ApiService();

// Export utility functions for different contexts
export const resumeApi = {
  // Health & Status
  healthCheck: () => apiService.healthCheck(),
  getHealthStatus: () => apiService.getHealthStatus(),
  getDetailedHealth: () => apiService.getDetailedHealth(),
  getLLMProvider: () => apiService.getLLMProvider(),
  
  // Resume Management
  upload: (files: File[]) => apiService.uploadResumes(files),
  list: (skip?: number, limit?: number) => apiService.listResumes(skip, limit),
  get: (id: string) => apiService.getResume(id),
  download: (id: string) => apiService.downloadResume(id),
  delete: (id: string) => apiService.deleteResume(id),
  
  // Enhanced Search
  search: (request: SearchRequest) => apiService.searchResumes(request),
  enhancedChatSearch: (request: EnhancedChatSearchRequest) => apiService.enhancedChatSearch(request),
  analyzeQuery: (request: QueryAnalysisRequest) => apiService.analyzeQuery(request),
  optimizeQuery: (request: QueryOptimizationRequest) => apiService.optimizeQuery(request),
  
  // Enhanced Chat Sessions
  createSession: (request?: CreateSessionRequest) => apiService.createChatSession(request),
  listSessions: (limit?: number, skip?: number, activeOnly?: boolean) => apiService.listChatSessions(limit, skip, activeOnly),
  getSession: (sessionId: string) => apiService.getChatSession(sessionId),
  searchInSession: (sessionId: string, request: SessionSearchRequest) => apiService.searchInSession(sessionId, request),
  askFollowUp: (sessionId: string, request: FollowUpRequest) => apiService.askFollowUp(sessionId, request),
  deleteSession: (sessionId: string) => apiService.deleteChatSession(sessionId),
};

// Legacy compatibility exports
export { resumeApi as default };
