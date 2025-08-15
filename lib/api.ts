/**
 * Updated API service to connect with all working backend endpoints
 * Complete integration with Chat UI functionality
 */

import config from './config';

const API_BASE_URL = config.api.baseUrl;

// ============================
// Enhanced Session Management Types
// ============================

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    search_results?: string[];
    search_metadata?: any;
    total_results?: number;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
  context: {
    jd_uploaded?: boolean;
    jd_filename?: string;
    jd_id?: string;
    last_search?: {
      query: string;
      results: string[];
      total_results: number;
    };
  };
  is_active: boolean;
}

export interface CreateSessionRequest {
  title?: string;
  initial_message?: string;
  agent_id?: string;
}

export interface CreateSessionResponse {
  session: ChatSession;
  success: boolean;
  message: string;
}

export interface SessionsListResponse {
  sessions: ChatSession[];
  total: number;
  success: boolean;
}

export interface SessionResponse {
  session: ChatSession;
  success: boolean;
  message: string;
}

// ============================
// Enhanced Search Types
// ============================

export interface SearchRequest {
  message: string;
  top_k?: number;
  filters?: Record<string, any>;
}

export interface SearchMatch {
  id: string;
  file_name: string;
  score: number;
  extracted_info: {
    name?: string;
    email?: string;
    phone?: string;
    skills: string[];
    experience: any[];
    education?: any[];
    summary?: string;
  };
  relevant_text?: string;
}

export interface UIComponents {
  candidate_cards: Array<{
    id: string;
    rank: number;
    score: number;
    name: string;
    title: string;
    skills: string[];
    experience_summary: string;
    match_highlights: string[];
    file_name: string;
  }>;
  skill_tags: string[];
  experience_chart: {
    Junior: number;
    'Mid-level': number;
    Senior: number;
    Lead: number;
  };
  quality_indicators: {
    total_matches: number;
    high_quality: number;
    average_score: number;
    consistency: number;
  };
  search_insights: {
    detected_domains: string[];
    technical_depth: string;
    intent_confidence: number;
  };
}

export interface ConversationFlow {
  next_suggestions: string[];
  follow_up_questions: string[];
  refinement_options: string[];
  flow_type: string;
}

export interface QuickAction {
  label: string;
  action: string;
  target?: string;
  query?: string;
}

export interface SearchResponse {
  message: string;
  query: string;
  original_message: string;
  matches: SearchMatch[];
  total_results: number;
  success: boolean;
  session_id?: string;
  ui_components?: UIComponents;
  conversation_flow?: ConversationFlow;
  quick_actions?: QuickAction[];
  response_metadata?: {
    response_type: string;
    confidence_level: string;
    search_quality: any;
    timestamp: string;
  };
}

// ============================
// JD Upload Types
// ============================

export interface JDUploadResponse {
  message: string;
  job_description_id: string;
  file_name: string;
  session_id: string;
  extracted_text: string;
  success: boolean;
}

export interface JDSearchRequest {
  session_id: string;
  top_k?: number;
  filters?: Record<string, any>;
}

export interface JDSearchResponse {
  session_id: string;
  job_description_id: string;
  job_description_text: string;
  matches: SearchMatch[];
  total_results: number;
  processing_time: number;
  search_results_stored: boolean;
  success: boolean;
}

export interface JDFollowUpRequest {
  session_id: string;
  question: string;
  previous_search_results?: any[];
}

export interface JDFollowUpResponse {
  session_id: string;
  question: string;
  answer: string;
  ui_components?: {
    show_analysis: boolean;
    candidate_comparison: boolean;
    detailed_view: boolean;
  };
  conversation_flow?: {
    next_suggestions: string[];
  };
  success: boolean;
}

export interface JDSearchResultsResponse {
  session_id: string;
  search_results: {
    jd_id: string;
    jd_text: string;
    jd_filename: string;
    matches: SearchMatch[];
    total_matches: number;
    search_timestamp: string;
  };
  success: boolean;
}

// ============================
// Follow-up Types
// ============================

export interface FollowUpRequest {
  question: string;
  previous_search_results?: any[];
}

export interface FollowUpResponse {
  session_id: string;
  question: string;
  answer: string;
  ui_components?: any;
  conversation_flow?: any;
  success: boolean;
}

// ============================
// Session Management Types
// ============================

// ============================
// File Upload Types
// ============================

export interface UploadResponse {
  message: string;
  uploaded_files: string[];
  failed_files?: string[];
  errors?: string[];
  total_files: number;
  success: boolean;
}

// ============================
// Resume Management Types
// ============================

export interface Resume {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  upload_timestamp: string;
  processed: boolean;
}

export interface ListResumesResponse {
  resumes: Resume[];
  total: number;
  success: boolean;
}

class SimplifiedApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Check if backend is available and reachable
   */
  private async checkBackendHealth(): Promise<boolean> {
    try {
      // Create a simple timeout controller for better browser compatibility
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.baseUrl}/api/v1/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Backend health check failed:', error);
      return false;
    }
  }

  // ============================
  // Core Search Endpoint
  // ============================

  /**
   * Simple semantic similarity search for resumes
   * POST /api/v1/chat/search
   */
  async chatSearch(request: SearchRequest): Promise<SearchResponse> {
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
        throw new Error(errorData.error || errorData.detail || `Search failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in chat search:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to perform search');
    }
  }

  // ============================
  // Session Management
  // ============================

  /**
   * Create new conversation session
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
          title: request.title || `Chat ${new Date().toLocaleString()}`,
          initial_message: request.initial_message,
          user_id: request.agent_id || "anonymous"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `Session creation failed: ${response.status}`);
      }

      const data = await response.json();
      return data as CreateSessionResponse;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create chat session');
    }
  }

  /**
   * List all sessions with pagination
   * GET /api/v1/chat/sessions
   */
  async getChatSessions(limit: number = 50, skip: number = 0, activeOnly: boolean = true): Promise<SessionsListResponse> {
    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        skip: skip.toString(),
        active_only: activeOnly.toString()
      });

      const response = await fetch(`${this.baseUrl}/api/v1/chat/sessions?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `Failed to get sessions: ${response.status}`);
      }

      const data = await response.json();
      return {
        sessions: Array.isArray(data.sessions) ? data.sessions : data,
        total: data.total || (Array.isArray(data.sessions) ? data.sessions.length : data.length),
        success: true
      };
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      // Return empty array for graceful degradation
      return { sessions: [], total: 0, success: false };
    }
  }

  /**
   * Get specific session details
   * GET /api/v1/chat/sessions/{session_id}
   */
  async getChatSession(sessionId: string): Promise<SessionResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `Failed to get session: ${response.status}`);
      }

      const data = await response.json();
      return {
        session: data.session || data,
        success: true,
        message: data.message || 'Session retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting chat session:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get chat session');
    }
  }

  /**
   * Search within a session (maintains conversation history)
   * POST /api/v1/chat/sessions/{session_id}/search
   */
  async searchInSession(sessionId: string, request: SearchRequest): Promise<SearchResponse> {
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
        throw new Error(errorData.error || errorData.detail || `Session search failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching in session:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search in session');
    }
  }

  /**
   * Delete a session
   * DELETE /api/v1/chat/sessions/{session_id}
   */
  async deleteChatSession(sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `Session deletion failed: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, message: data.message || 'Session deleted successfully' };
    } catch (error) {
      console.error('Error deleting chat session:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete chat session');
    }
  }

  // ============================
  // Follow-up Questions
  // ============================

  /**
   * Ask questions about previous search results
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
          previous_search_results: request.previous_search_results || []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `Follow-up failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error asking follow-up question:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to ask follow-up question');
    }
  }

  // ============================
  // Simulate Chat Message for UI
  // ============================

  /**
   * Send a chat message and get AI response
   */
  async sendChatMessage(sessionId: string, message: { content: string; type: 'user' }): Promise<{ success: boolean; data: ChatMessage }> {
    try {
      // For now, use the search endpoint to simulate chat
      const searchResponse = await this.searchInSession(sessionId, { message: message.content });
      
      // Create assistant response
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: searchResponse.message || `Found ${searchResponse.total_results} candidates matching your query.`,
        timestamp: new Date().toISOString()
      };

      return { success: true, data: assistantMessage };
    } catch (error) {
      console.error('Error sending chat message:', error);
      
      // Return error message as assistant response
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        type: 'assistant',
        content: "Sorry, I couldn't process your request. Please try again.",
        timestamp: new Date().toISOString()
      };

      return { success: false, data: errorMessage };
    }
  }

  // ============================
  // File Upload
  // ============================

  /**
   * Upload multiple resume files to the backend
   * POST /api/v1/resumes/upload
   */
  async uploadResumes(files: File[]): Promise<UploadResponse> {
    // Validate files before upload
    const validationErrors = this.validateUploadFiles(files);
    if (validationErrors.length > 0) {
      throw new Error(`File validation failed: ${validationErrors.join(', ')}`);
    }

    const formData = new FormData();
    
    // Append each file to form data
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/resumes/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.detail || `Upload failed with status: ${response.status}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error(error instanceof Error ? `Resume upload failed: ${error.message}` : 'Failed to upload resume files');
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
        throw new Error(errorData.error || errorData.detail || `Failed to list resumes: ${response.status}`);
      }

      const data = await response.json();
      return {
        resumes: Array.isArray(data.resumes) ? data.resumes : [],
        total: data.total || 0,
        success: true
      };
    } catch (error) {
      console.error('Error listing resumes:', error);
      return { resumes: [], total: 0, success: false };
    }
  }

  /**
   * Delete a resume
   * DELETE /api/v1/resumes/{resume_id}
   */
  async deleteResume(resumeId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `Delete failed: ${response.status}`);
      }

      return { success: true, message: 'Resume deleted successfully' };
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete resume');
    }
  }

  // ============================
  // JD Upload and Search Methods
  // ============================

  /**
   * Upload a job description file and associate it with a chat session
   * POST /api/v1/jd/upload
   */
  /*async uploadJobDescription(sessionId: string, file: File): Promise<JDUploadResponse> {
    try {
      // First check if backend is available
      const isBackendAvailable = await this.checkBackendHealth();
      if (!isBackendAvailable) {
        // Return mock response when backend is not available
        console.warn('Backend not available, using mock response for JD upload');
        return {
          message: `Job description "${file.name}" uploaded successfully (mock)`,
          job_description_id: `jd_${Date.now()}`,
          file_name: file.name,
          session_id: sessionId,
          extracted_text: "Mock extracted text for demonstration purposes",
          success: true
        };
      }

      const formData = new FormData();
      formData.append('session_id', sessionId);
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/api/v1/jd/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `JD upload failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading job description:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to upload job description');
    }
  }*/
  /**
   * Upload a job description file and associate it with a chat session
   * POST /api/v1/jd/upload
   */
  async uploadJobDescription(sessionId: string, file: File): Promise<JDUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/api/v1/jd/upload?session_id=${encodeURIComponent(sessionId)}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading job description:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to upload job description');
    }
  }

  /**
   * Search for resumes matching the uploaded job description
   * POST /api/v1/jd/search
   */
  /*async searchWithJobDescription(request: JDSearchRequest): Promise<JDSearchResponse> {
    try {
      // Check if backend is available
      console.log("hello")
      const isBackendAvailable = await this.checkBackendHealth();
      console.log("sahdgfq", isBackendAvailable)
      /*if (!isBackendAvailable) {
        // Return mock response when backend is not available
        console.warn('Backend not available, using mock response for JD search');
        return {
          session_id: request.session_id,
          job_description_id: `jd_${Date.now()}`,
          job_description_text: "Mock job description for demonstration",
          matches: [
            {
              id: `candidate_${Date.now()}_1`,
              file_name: "candidate1.pdf",
              score: 0.92,
              extracted_info: {
                name: "John Smith",
                skills: ["React", "Node.js", "TypeScript", "Python"],
                experience: ["5 years full-stack development", "Senior Software Engineer"]
              },
              relevant_text: "Experienced full-stack developer with React and Node.js expertise"
            },
            {
              id: `candidate_${Date.now()}_2`,
              file_name: "candidate2.pdf",
              score: 0.87,
              extracted_info: {
                name: "Jane Doe",
                skills: ["Vue.js", "Django", "PostgreSQL", "AWS"],
                experience: ["4 years backend development", "Software Engineer"]
              },
              relevant_text: "Backend specialist with Django and cloud infrastructure experience"
            }
          ],
          total_results: 2,
          processing_time: 0.5,
          search_results_stored: true,
          success: true
        };
      }
      console.log("request: ", request)
      const response = await fetch(`${this.baseUrl}/api/v1/jd/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      console.log("response: ", response.body)
      if (!response.ok) {
        console.log("error1")
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `JD search failed: ${response.status}`);
      }
      console.log("response 2: ", await response.json())
      return await response.json();
    } catch (error) {
      console.log("error2")
      console.error('Error searching with job description:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search with job description');
    }
  }*/
/* async searchWithJobDescription(request: JDSearchRequest): Promise<JDSearchResponse> {
  try {
    // Check if backend is available
    console.log("Starting JD search request");
    const isBackendAvailable = await this.checkBackendHealth();
    console.log("Backend availability:", isBackendAvailable);

    console.log("Sending request:", request);
    const response = await fetch(`${this.baseUrl}/api/v1/jd/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log("Response status:", response.status, response.statusText);

    // Read the response body once and store it
    const responseData = await response.json();
    console.log("Response data:", responseData);

    if (!response.ok) {
      console.log("Request failed with status:", response.status);
      const errorMessage = responseData.error || responseData.detail || `JD search failed: ${response.status}`;
      throw new Error(errorMessage);
    }

    return responseData;
  } catch (error) {
    console.error('Error searching with job description:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to search with job description');
  }
}*/
  async searchWithJobDescription(request: JDSearchRequest): Promise<JDSearchResponse> {
    try {
      console.log("Starting JD search request with:", request);
      
      const response = await fetch(`${this.baseUrl}/api/v1/jd/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("JD search failed:", response.status, errorData);
        throw new Error(errorData.error || errorData.detail || `JD search failed: ${response.status}`);
      }

      const responseData = await response.json();
      console.log("Raw JD search response:", responseData);

      // FIXED: Ensure the response structure matches what's expected
      // The backend should return matches array directly
      if (!Array.isArray(responseData.matches)) {
        console.warn("Matches is not an array, converting to empty array");
        responseData.matches = [];
      }

      // Ensure total_results matches the actual matches length
      responseData.total_results = responseData.matches.length;

      console.log("Returning JD search response with matches count:", responseData.matches.length);
      return responseData;

    } catch (error) {
      console.error('Error searching with job description:', error);
      throw error;
    }
  }

  /**
   * Ask follow-up questions about the stored JD search results
   * POST /api/v1/jd/followup
   */
  async askJDFollowUp(request: JDFollowUpRequest): Promise<JDFollowUpResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/jd/followup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: request.session_id,
          question: request.question,
          previous_search_results: request.previous_search_results || []
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `JD follow-up failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error asking JD follow-up question:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to ask JD follow-up question');
    }
  }

  /**
   * Get stored search results for a session
   * GET /api/v1/jd/session/{session_id}/results
   */
  async getJDSearchResults(sessionId: string): Promise<JDSearchResultsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/jd/session/${sessionId}/results`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `Failed to get JD results: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting JD search results:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get JD search results');
    }
  }

  /**
   * Download shortlisted candidates as ZIP file
   * GET /api/v1/jd/session/{session_id}/download
   */
  async downloadJDResults(sessionId: string, topN: number = 10, format: string = 'zip'): Promise<Blob> {
    try {
      const queryParams = new URLSearchParams({
        top_n: topN.toString(),
        format: format
      });

      const response = await fetch(`${this.baseUrl}/api/v1/jd/session/${sessionId}/download?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/zip, application/octet-stream',
        },
      });

      if (!response.ok) {
        const errorData = await response.text().catch(() => 'Download failed');
        throw new Error(`Download failed: ${response.status} - ${errorData}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Error downloading JD results:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to download JD results');
    }
  }

  /**
   * Delete the job description associated with a session
   * DELETE /api/v1/jd/session/{session_id}
   */
  async deleteJobDescription(sessionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/jd/session/${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `JD deletion failed: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, message: data.message || 'Job description deleted successfully' };
    } catch (error) {
      console.error('Error deleting job description:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete job description');
    }
  }

  // ============================
  // Health Check
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
        errors.push(`File ${index + 1} (${file.name}): File too large. Maximum: 10MB`);
      }

      // Check if file is empty
      if (file.size === 0) {
        errors.push(`File ${index + 1} (${file.name}): File is empty`);
      }
    });

    return errors;
  }
}

// Export a singleton instance
export const simplifiedApiService = new SimplifiedApiService();

// Export clean utility functions
export const resumeApi = {
  // Core search
  chatSearch: (request: SearchRequest) => simplifiedApiService.chatSearch(request),
  
  // Session management - Updated to match new API endpoints
  createChatSession: (request?: CreateSessionRequest) => simplifiedApiService.createChatSession(request),
  getChatSessions: (limit?: number, skip?: number, activeOnly?: boolean) => simplifiedApiService.getChatSessions(limit, skip, activeOnly),
  getChatSession: (sessionId: string) => simplifiedApiService.getChatSession(sessionId),
  searchInSession: (sessionId: string, request: SearchRequest) => simplifiedApiService.searchInSession(sessionId, request),
  deleteChatSession: (sessionId: string) => simplifiedApiService.deleteChatSession(sessionId),
  
  // Follow-up questions
  askFollowUp: (sessionId: string, request: FollowUpRequest) => simplifiedApiService.askFollowUp(sessionId, request),
  
  // Chat messaging (legacy support)
  sendChatMessage: (sessionId: string, message: { content: string; type: 'user' }) => simplifiedApiService.sendChatMessage(sessionId, message),
  
  // JD Upload and Search - Updated endpoints
  uploadJobDescription: (sessionId: string, file: File) => simplifiedApiService.uploadJobDescription(sessionId, file),
  searchWithJobDescription: (request: JDSearchRequest) => simplifiedApiService.searchWithJobDescription(request),
  askJDFollowUp: (request: JDFollowUpRequest) => simplifiedApiService.askJDFollowUp(request),
  getJDSearchResults: (sessionId: string) => simplifiedApiService.getJDSearchResults(sessionId),
  downloadJDResults: (sessionId: string, topN?: number, format?: string) => simplifiedApiService.downloadJDResults(sessionId, topN, format),
  deleteJobDescription: (sessionId: string) => simplifiedApiService.deleteJobDescription(sessionId),
  
  // File management
  uploadResumes: (files: File[]) => simplifiedApiService.uploadResumes(files),
  listResumes: (skip?: number, limit?: number) => simplifiedApiService.listResumes(skip, limit),
  deleteResume: (resumeId: string) => simplifiedApiService.deleteResume(resumeId),
  
  // Health check
  healthCheck: () => simplifiedApiService.healthCheck(),
};

// Default export
export default resumeApi;
