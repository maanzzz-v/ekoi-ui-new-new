/**
 * Configuration file for API endpoints and settings
 */

export const config = {
  // Backend API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    timeout: 30000, // 30 seconds
    retries: 3,
  },
  
  // File upload configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB in bytes
    maxFiles: 10,
    allowedTypes: ['.pdf', '.doc', '.docx', '.txt'],
    chunkSize: 1024 * 1024, // 1MB chunks for large file uploads
  },
  
  // Search configuration
  search: {
    defaultLimit: 50,
    maxResults: 100,
    debounceMs: 300, // Debounce search input
  },
  
  // UI configuration
  ui: {
    itemsPerPage: 25,
    autoRefreshInterval: 30000, // 30 seconds
  }
};

export default config;
