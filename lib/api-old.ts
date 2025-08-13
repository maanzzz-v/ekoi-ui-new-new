/**
 * API service for communicating with the FastAPI backend
 * Complete integration with all backend endpoints
 */

import config from './config';

const API_BASE_URL = config.api.baseUrl;

// Health Check Types
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
        model: string;
      };
      pinecone_available: boolean;
      faiss_available: boolean;
    };
  };
}

export interface LLMProviderResponse {
  provider: string;
  model: string;
  status: string;
}

// Upload Types
export interface UploadResponse {
  message: string;
  uploaded_files: string[];
  total_files: number;
  success: boolean;
}

// Resume Types
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

export interface ResumeDetailed extends Resume {
  extracted_text: string;
  parsed_info: ResumeExtractedInfo;
  vector_ids: string[];
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

// Search Types
export interface SearchRequest {
  query: string;
  top_k?: number;
  filters?: Record<string, any>;
}

export interface SearchMatch {
  id: string;
  file_name: string;
  score: number;
  extracted_info: ResumeExtractedInfo;
  relevant_text?: string;
}

export interface SearchResponse {
  query: string;
  total_results: number;
  matches: SearchMatch[];
  processing_time: number;
  success: boolean;
}

// Chat Types
export interface ChatSearchRequest {
  message: string;
  top_k?: number;
  filters?: Record<string, any>;
}

export interface ChatSearchResponse {
  message: string;
  response: string;
  matches: SearchMatch[];
  total_results: number;
  processing_time: number;
  suggestions?: string[];
}

export interface AnalyzeQueryRequest {
  message: string;
}

export interface AnalyzeQueryResponse {
  original_query: string;
  intent: {
    type: string;
    role: string;
    skills_mentioned: string[];
    experience_level: string;
    technologies: string[];
  };
  keywords: string[];
  suggestions: string[];
  enhanced_query: string;
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
  async getLLMProvider(): Promise<LLMProviderResponse> {
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
  async getResume(resumeId: string): Promise<ResumeDetailed> {
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
  // Search Endpoints
  // ============================

  /**
   * Search resumes using vector similarity
   * POST /api/v1/resumes/search
   */
  async searchResumes(request: SearchRequest): Promise<SearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/resumes/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: request.query,
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
      console.error('Error searching resumes:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search resumes');
    }
  }

  // ============================
  // Chat-Based Search Endpoints
  // ============================

  /**
   * Natural language search using RAG
   * POST /api/v1/chat/search
   */
  async chatSearch(request: ChatSearchRequest): Promise<ChatSearchResponse> {
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
      console.error('Error in chat search:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to perform chat search');
    }
  }

  /**
   * Analyze search query intent
   * POST /api/v1/chat/analyze
   */
  async analyzeQuery(request: AnalyzeQueryRequest): Promise<AnalyzeQueryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/chat/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: request.message
        }),
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

  /**
   * Search for resumes based on query and requirements
   */
  async searchResumes(request: SearchRequest): Promise<SearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/resumes/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching resumes:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to search resumes');
    }
  }

  /**
   * Get all resumes with pagination
   */
  async listResumes(skip: number = 0, limit: number = 50): Promise<ListResumesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/resumes/?skip=${skip}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing resumes:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to list resumes');
    }
  }

  /**
   * Get a specific resume by ID
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
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting resume:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to get resume');
    }
  }

  /**
   * Delete a resume by ID
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
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting resume:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to delete resume');
    }
  }

  /**
   * Check if the backend is healthy/reachable
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      } as RequestInit);
      
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const apiService = new ApiService();

// Export utility functions for different contexts
export const resumeApi = {
  upload: (files: File[]) => apiService.uploadResumes(files),
  search: (request: SearchRequest) => apiService.searchResumes(request),
  list: (skip?: number, limit?: number) => apiService.listResumes(skip, limit),
  get: (id: string) => apiService.getResume(id),
  delete: (id: string) => apiService.deleteResume(id),
  healthCheck: () => apiService.healthCheck(),
};
