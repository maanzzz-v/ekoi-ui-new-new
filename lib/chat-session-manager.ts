/**
 * Enhanced Chat Session Manager
 * Advanced management for AI-powered recruitment conversations with UI optimization
 */

import { 
  resumeApi,
  ChatSession,
  ChatMessage,
  EnhancedChatSearchRequest,
  EnhancedChatSearchResponse,
  SessionSearchRequest,
  SessionSearchResponse,
  FollowUpRequest,
  FollowUpResponse,
  QueryAnalysisRequest,
  QueryAnalysisResponse,
  QueryOptimizationRequest,
  QueryOptimizationResponse,
  UIComponents,
  ConversationFlow,
  QuickAction,
  CandidateCard
} from './api';

export interface SearchHistoryEntry {
  query: string;
  results: any[];
  timestamp: Date;
  ui_components?: UIComponents;
  conversation_flow?: ConversationFlow;
  quick_actions?: QuickAction[];
  metadata?: any;
}

export interface SessionMetrics {
  totalSearches: number;
  totalCandidatesFound: number;
  averageResponseTime: number;
  queryQualityScore: number;
  mostSearchedSkills: string[];
  sessionDuration: number;
}

/**
 * Advanced Chat Session Manager with AI-powered features
 * Manages conversation context, search history, and UI optimization
 */
export class EnhancedChatSessionManager {
  private currentSession: ChatSession | null = null;
  private searchHistory: SearchHistoryEntry[] = [];
  private queryCache: Map<string, any> = new Map();
  private performanceMetrics: SessionMetrics;
  
  constructor() {
    this.performanceMetrics = {
      totalSearches: 0,
      totalCandidatesFound: 0,
      averageResponseTime: 0,
      queryQualityScore: 0,
      mostSearchedSkills: [],
      sessionDuration: 0
    };
  }

  // ============================
  // Session Management
  // ============================

  /**
   * Create a new chat session with enhanced naming
   */
  async createSession(name?: string): Promise<ChatSession> {
    const sessionName = name || this.generateSessionName();
    
    const response = await resumeApi.createSession({
      user_id: "user123",
      name: sessionName
    });

    if (response.success) {
      this.currentSession = response.session;
      this.searchHistory = [];
      this.resetMetrics();
      return response.session;
    }

    throw new Error('Failed to create session');
  }

  /**
   * Load an existing session and restore context
   */
  async loadSession(sessionId: string): Promise<ChatSession> {
    const response = await resumeApi.getSession(sessionId);
    
    if (response.success) {
      this.currentSession = response.session;
      await this.restoreSessionContext();
      return response.session;
    }

    throw new Error('Failed to load session');
  }

  /**
   * Get current session
   */
  getCurrentSession(): ChatSession | null {
    return this.currentSession;
  }

  /**
   * Switch to a different session
   */
  async switchSession(sessionId: string): Promise<ChatSession> {
    return await this.loadSession(sessionId);
  }

  // ============================
  // Enhanced Search Operations
  // ============================

  /**
   * Perform intelligent search with real-time optimization
   */
  async intelligentSearch(
    message: string, 
    options: { 
      topK?: number;
      autoOptimize?: boolean;
      cacheResults?: boolean;
    } = {}
  ): Promise<SessionSearchResponse> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    const { topK = 10, autoOptimize = true, cacheResults = true } = options;
    const startTime = Date.now();

    try {
      // Check cache first
      const cacheKey = `${message.toLowerCase()}_${topK}`;
      if (cacheResults && this.queryCache.has(cacheKey)) {
        console.log('Returning cached results for:', message);
        return this.queryCache.get(cacheKey);
      }

      // Auto-optimize query if enabled
      let optimizedMessage = message;
      if (autoOptimize) {
        try {
          const optimization = await this.optimizeQuery(message);
          if (optimization.enhanced_alternatives.length > 0) {
            optimizedMessage = optimization.enhanced_alternatives[0].query;
            console.log('Query optimized:', { original: message, optimized: optimizedMessage });
          }
        } catch (error) {
          console.warn('Query optimization failed, using original:', error);
        }
      }

      // Perform the search
      const response = await resumeApi.searchInSession(this.currentSession.id, {
        message: optimizedMessage,
        top_k: topK
      });

      // Calculate response time
      const responseTime = Date.now() - startTime;
      
      // Update search history
      this.addToSearchHistory({
        query: message,
        results: response.matches,
        timestamp: new Date(),
        ui_components: response.ui_components,
        conversation_flow: response.conversation_flow,
        quick_actions: response.quick_actions,
        metadata: {
          responseTime,
          optimized: optimizedMessage !== message,
          originalQuery: message,
          optimizedQuery: optimizedMessage
        }
      });

      // Update metrics
      this.updateMetrics(response, responseTime);

      // Cache results
      if (cacheResults) {
        this.queryCache.set(cacheKey, response);
      }

      return response;

    } catch (error) {
      console.error('Intelligent search failed:', error);
      throw error;
    }
  }

  /**
   * Perform standalone enhanced chat search (without session)
   */
  async standaloneSearch(request: EnhancedChatSearchRequest): Promise<EnhancedChatSearchResponse> {
    const startTime = Date.now();
    
    try {
      const response = await resumeApi.enhancedChatSearch(request);
      
      // Update metrics for standalone search
      const responseTime = Date.now() - startTime;
      this.updateMetrics(response, responseTime);
      
      return response;
    } catch (error) {
      console.error('Standalone search failed:', error);
      throw error;
    }
  }

  /**
   * Ask intelligent follow-up questions
   */
  async askFollowUp(question: string): Promise<FollowUpResponse> {
    if (!this.currentSession) {
      throw new Error('No active session');
    }

    const context = this.buildFollowUpContext();
    
    const response = await resumeApi.askFollowUp(this.currentSession.id, {
      question,
      context
    });

    // Add to search history
    this.addToSearchHistory({
      query: `Follow-up: ${question}`,
      results: [],
      timestamp: new Date(),
      metadata: { type: 'follow_up', context }
    });

    return response;
  }

  // ============================
  // Query Analysis & Optimization
  // ============================

  /**
   * Analyze query quality and intent
   */
  async analyzeQuery(message: string): Promise<QueryAnalysisResponse> {
    try {
      return await resumeApi.analyzeQuery({ message });
    } catch (error) {
      console.error('Query analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get query optimization suggestions
   */
  async optimizeQuery(query: string): Promise<QueryOptimizationResponse> {
    try {
      return await resumeApi.optimizeQuery({ query });
    } catch (error) {
      console.error('Query optimization failed:', error);
      throw error;
    }
  }

  /**
   * Real-time query validation as user types
   */
  async validateQueryRealTime(query: string): Promise<{
    isValid: boolean;
    score: number;
    suggestions: string[];
    confidence: number;
  }> {
    if (query.length < 3) {
      return {
        isValid: false,
        score: 0,
        suggestions: ['Type at least 3 characters'],
        confidence: 0
      };
    }

    try {
      const analysis = await this.analyzeQuery(query);
      
      return {
        isValid: analysis.query_quality.score >= 0.6,
        score: analysis.query_quality.score,
        suggestions: analysis.optimization_tips,
        confidence: analysis.intelligence_analysis.intent_confidence
      };
    } catch (error) {
      return {
        isValid: true, // Assume valid if analysis fails
        score: 0.5,
        suggestions: [],
        confidence: 0.5
      };
    }
  }

  // ============================
  // UI Component Management
  // ============================

  /**
   * Process and enhance candidate cards for UI display
   */
  processCandidateCards(cards: CandidateCard[]): CandidateCard[] {
    return cards.map(card => ({
      ...card,
      // Enhance with additional UI properties
      formattedSkills: this.formatSkillsForDisplay(card.skills),
      matchGrade: this.calculateMatchGrade(card.score),
      experienceLevel: this.determineExperienceLevel(card.experience_summary),
      contactable: this.isContactable(card)
    }));
  }

  /**
   * Generate conversation starters based on current context
   */
  generateConversationStarters(): Array<{ title: string; query: string; description: string; icon: string }> {
    const baseStarters = [
      {
        title: "Python + AI Experts", 
        query: "Find senior Python developers with machine learning and AI experience",
        description: "ML/AI specialists with Python expertise",
        icon: "🤖"
      },
      {
        title: "Full-Stack React Leaders",
        query: "Search for senior React developers with full-stack and leadership experience", 
        description: "React experts with team leadership skills",
        icon: "⚛️"
      },
      {
        title: "Cloud Architecture Specialists",
        query: "Find cloud architects with AWS, Azure, or GCP experience",
        description: "Senior cloud infrastructure experts",
        icon: "☁️"
      },
      {
        title: "Mobile App Developers",
        query: "Search for mobile developers with React Native or Flutter experience",
        description: "Cross-platform mobile specialists",
        icon: "📱"
      }
    ];

    // Enhance based on search history
    const recentSkills = this.getRecentlySearchedSkills();
    if (recentSkills.length > 0) {
      baseStarters.unshift({
        title: `More ${recentSkills[0]} Experts`,
        query: `Find more professionals with ${recentSkills.slice(0, 3).join(', ')} experience`,
        description: `Continue searching in ${recentSkills[0]} domain`,
        icon: "🔄"
      });
    }

    return baseStarters;
  }

  // ============================
  // Performance & Analytics
  // ============================

  /**
   * Get session performance metrics
   */
  getSessionMetrics(): SessionMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get search history with analytics
   */
  getSearchHistory(): SearchHistoryEntry[] {
    return [...this.searchHistory];
  }

  /**
   * Get search insights and patterns
   */
  getSearchInsights(): {
    totalSearches: number;
    uniqueQueries: number;
    averageResultsPerSearch: number;
    topSkillsSearched: string[];
    searchEfficiency: number;
    timeRange: { start: Date; end: Date } | null;
  } {
    if (this.searchHistory.length === 0) {
      return {
        totalSearches: 0,
        uniqueQueries: 0,
        averageResultsPerSearch: 0,
        topSkillsSearched: [],
        searchEfficiency: 0,
        timeRange: null
      };
    }

    const uniqueQueries = new Set(this.searchHistory.map(h => h.query.toLowerCase())).size;
    const totalResults = this.searchHistory.reduce((sum, h) => sum + h.results.length, 0);
    const averageResults = totalResults / this.searchHistory.length;
    
    // Extract skills from search queries
    const allSkills = this.searchHistory.flatMap(h => 
      this.extractSkillsFromQuery(h.query)
    );
    const skillCounts = allSkills.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topSkills = Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([skill]) => skill);

    const timestamps = this.searchHistory.map(h => h.timestamp);
    const timeRange = timestamps.length > 0 ? {
      start: new Date(Math.min(...timestamps.map(t => t.getTime()))),
      end: new Date(Math.max(...timestamps.map(t => t.getTime())))
    } : null;

    return {
      totalSearches: this.searchHistory.length,
      uniqueQueries,
      averageResultsPerSearch: averageResults,
      topSkillsSearched: topSkills,
      searchEfficiency: averageResults / Math.max(uniqueQueries, 1),
      timeRange
    };
  }

  // ============================
  // Private Helper Methods
  // ============================

  private generateSessionName(): string {
    const timestamp = new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `Recruitment Search - ${timestamp}`;
  }

  private async restoreSessionContext(): Promise<void> {
    if (!this.currentSession) return;

    // Restore search history from session messages
    this.searchHistory = [];
    
    // Analyze session messages to rebuild context
    for (const message of this.currentSession.messages) {
      if (message.type === 'user') {
        // This was a search query
        this.addToSearchHistory({
          query: message.content,
          results: [],
          timestamp: new Date(message.timestamp),
          metadata: { restored: true }
        });
      }
    }
  }

  private addToSearchHistory(entry: SearchHistoryEntry): void {
    this.searchHistory.push(entry);
    
    // Keep only last 50 searches to avoid memory issues
    if (this.searchHistory.length > 50) {
      this.searchHistory = this.searchHistory.slice(-50);
    }
  }

  private updateMetrics(response: any, responseTime: number): void {
    this.performanceMetrics.totalSearches++;
    this.performanceMetrics.totalCandidatesFound += response.total_results || 0;
    
    // Update average response time
    const currentTotal = this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalSearches - 1);
    this.performanceMetrics.averageResponseTime = (currentTotal + responseTime) / this.performanceMetrics.totalSearches;
    
    // Update quality score if available
    if (response.response_metadata?.confidence_level) {
      const confidenceMap: Record<string, number> = { low: 0.3, medium: 0.6, high: 0.9 };
      const score = confidenceMap[response.response_metadata.confidence_level] || 0.5;
      this.performanceMetrics.queryQualityScore = (this.performanceMetrics.queryQualityScore + score) / 2;
    }
  }

  private resetMetrics(): void {
    this.performanceMetrics = {
      totalSearches: 0,
      totalCandidatesFound: 0,
      averageResponseTime: 0,
      queryQualityScore: 0,
      mostSearchedSkills: [],
      sessionDuration: 0
    };
  }

  private buildFollowUpContext(): any {
    const recentSearches = this.searchHistory.slice(-3);
    return {
      last_search: recentSearches[recentSearches.length - 1]?.query,
      candidates: recentSearches.flatMap(s => s.results.map((r: any) => r.extracted_info?.name || r.file_name))
    };
  }

  private formatSkillsForDisplay(skills: string[]): string[] {
    // Prioritize and format skills for better UI display
    const prioritySkills = ['Python', 'JavaScript', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes'];
    const priority = skills.filter(skill => 
      prioritySkills.some(p => skill.toLowerCase().includes(p.toLowerCase()))
    );
    const others = skills.filter(skill => 
      !prioritySkills.some(p => skill.toLowerCase().includes(p.toLowerCase()))
    );
    
    return [...priority, ...others].slice(0, 8); // Limit to 8 for UI
  }

  private calculateMatchGrade(score: number): 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C' {
    if (score >= 0.95) return 'A+';
    if (score >= 0.85) return 'A';
    if (score >= 0.75) return 'B+';
    if (score >= 0.65) return 'B';
    if (score >= 0.55) return 'C+';
    return 'C';
  }

  private determineExperienceLevel(experienceSummary: string): 'Junior' | 'Mid' | 'Senior' | 'Lead' {
    const summary = experienceSummary.toLowerCase();
    if (summary.includes('lead') || summary.includes('principal') || summary.includes('architect')) return 'Lead';
    if (summary.includes('senior') || summary.includes('sr.')) return 'Senior';
    if (summary.includes('junior') || summary.includes('jr.')) return 'Junior';
    return 'Mid';
  }

  private isContactable(card: CandidateCard): boolean {
    // Determine if candidate has contact information
    return card.name !== undefined && !card.name.includes('resume') && !card.name.includes('cv');
  }

  private getRecentlySearchedSkills(): string[] {
    const recentQueries = this.searchHistory.slice(-5).map(h => h.query);
    const skills = recentQueries.flatMap(query => this.extractSkillsFromQuery(query));
    
    // Count frequency and return top skills
    const skillCounts = skills.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(skillCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([skill]) => skill);
  }

  private extractSkillsFromQuery(query: string): string[] {
    const commonSkills = [
      'Python', 'JavaScript', 'React', 'Node.js', 'Java', 'C++', 'C#', 
      'PHP', 'Ruby', 'Go', 'Rust', 'TypeScript', 'Swift', 'Kotlin',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
      'Django', 'Flask', 'Express', 'Spring', 'Rails',
      'Machine Learning', 'AI', 'Deep Learning', 'Data Science',
      'DevOps', 'CI/CD', 'Microservices', 'API', 'REST', 'GraphQL'
    ];
    
    return commonSkills.filter(skill => 
      query.toLowerCase().includes(skill.toLowerCase())
    );
  }
}

// Export singleton instance
export const chatSessionManager = new EnhancedChatSessionManager();

// Export utility functions
export const chatUtils = {
  // Session management shortcuts
  createSession: (name?: string) => chatSessionManager.createSession(name),
  loadSession: (id: string) => chatSessionManager.loadSession(id),
  getCurrentSession: () => chatSessionManager.getCurrentSession(),
  
  // Search shortcuts
  search: (message: string, options?: any) => chatSessionManager.intelligentSearch(message, options),
  standaloneSearch: (request: EnhancedChatSearchRequest) => chatSessionManager.standaloneSearch(request),
  followUp: (question: string) => chatSessionManager.askFollowUp(question),
  
  // Query analysis
  analyzeQuery: (message: string) => chatSessionManager.analyzeQuery(message),
  optimizeQuery: (query: string) => chatSessionManager.optimizeQuery(query),
  validateQuery: (query: string) => chatSessionManager.validateQueryRealTime(query),
  
  // UI helpers
  getConversationStarters: () => chatSessionManager.generateConversationStarters(),
  getSearchHistory: () => chatSessionManager.getSearchHistory(),
  getMetrics: () => chatSessionManager.getSessionMetrics(),
  getInsights: () => chatSessionManager.getSearchInsights(),
};

export default chatSessionManager;
