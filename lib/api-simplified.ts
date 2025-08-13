/**
 * Simplified API service using the refined endpoint structure
 * Clean integration with simplified backend endpoints for optimal UI experience
 */

import config from './config';

const API_BASE_URL = config.api.baseUrl;

// ============================
// Simplified Types
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
    skills: string[];
    experience: any[];
  };
  relevant_text?: string;
}

export interface SearchResponse {
  message: string;
  query: string;
  original_message: string;
  matches: SearchMatch[];
  total_results: number;
  success: boolean;
}

// ============================
// Session Management Types
// ============================

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: ChatMessage[];
}

export interface CreateSessionRequest {
  title?: string;
  initial_message?: string;
  agent_id?: string;
}

export interface CreateSessionResponse {
  success: boolean;
  data: ChatSession;
}

export interface SessionsListResponse {
  success: boolean;
  data: ChatSession[];
}

export interface SessionResponse {
  success: boolean;
  data: ChatSession;
}

// ============================
// Follow-up Types
// ============================

export interface FollowUpRequest {
  question: string;
}

export interface FollowUpResponse {
  session_id: string;
  question: string;
  answer: string;
  success: boolean;
}

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

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
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
          agent_id: request.agent_id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.detail || `Session creation failed: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create chat session');
    }
  }

  /**
   * List all sessions with pagination
   * GET /api/v1/chat/sessions
   */
  async getChatSessions(): Promise<SessionsListResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat/sessions`, {
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
      return { success: true, data: Array.isArray(data) ? data : data.sessions || [] };
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      // Return empty array for graceful degradation
      return { success: false, data: [] };
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
      return { success: true, data: data.session || data };
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

      return { success: true, message: 'Session deleted successfully' };
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
          question: request.question
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
  
  // Session management
  createChatSession: (request?: CreateSessionRequest) => simplifiedApiService.createChatSession(request),
  getChatSessions: () => simplifiedApiService.getChatSessions(),
  getChatSession: (sessionId: string) => simplifiedApiService.getChatSession(sessionId),
  searchInSession: (sessionId: string, request: SearchRequest) => simplifiedApiService.searchInSession(sessionId, request),
  deleteChatSession: (sessionId: string) => simplifiedApiService.deleteChatSession(sessionId),
  
  // Follow-up questions
  askFollowUp: (sessionId: string, request: FollowUpRequest) => simplifiedApiService.askFollowUp(sessionId, request),
  
  // Chat messaging
  sendChatMessage: (sessionId: string, message: { content: string; type: 'user' }) => simplifiedApiService.sendChatMessage(sessionId, message),
  
  // File management
  uploadResumes: (files: File[]) => simplifiedApiService.uploadResumes(files),
  listResumes: (skip?: number, limit?: number) => simplifiedApiService.listResumes(skip, limit),
  deleteResume: (resumeId: string) => simplifiedApiService.deleteResume(resumeId),
  
  // Health check
  healthCheck: () => simplifiedApiService.healthCheck(),
};

// Default export
export default resumeApi;
