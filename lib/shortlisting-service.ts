/**
 * Resume Shortlisting Service
 * Comprehensive service for candidate shortlisting using multiple AI-powered methods
 */

import { resumeApi, type SearchRequest, type ChatSearchRequest, type AnalyzeQueryRequest } from './api';

export interface ShortlistingOptions {
  method?: 'vector' | 'chat' | 'hybrid';
  topK?: number;
  filters?: Record<string, any>;
  includeAnalysis?: boolean;
}

export interface ShortlistingResult {
  candidates: Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    skills: string[];
    experience: Array<{description: string; extracted: boolean}>;
    education: Array<{description: string; extracted: boolean}>;
    summary?: string;
    score: number;
    relevantText?: string;
    fileName: string;
    matchingSkills?: string[];
    experienceLevel?: 'junior' | 'mid' | 'senior' | 'lead';
  }>;
  totalResults: number;
  processingTime: number;
  query: string;
  method: string;
  analysis?: {
    intent: any;
    keywords: string[];
    suggestions: string[];
    enhancedQuery: string;
  };
  summary?: string;
}

export interface JobRequirement {
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills?: string[];
  experienceLevel: string;
  location?: string;
  salary?: string;
}

class ResumeShortlistingService {
  
  /**
   * Main shortlisting function - intelligently chooses the best method
   */
  async shortlistCandidates(
    jobDescription: string, 
    options: ShortlistingOptions = {}
  ): Promise<ShortlistingResult> {
    const {
      method = 'hybrid',
      topK = 10,
      filters = {},
      includeAnalysis = true
    } = options;

    console.log(`🎯 Starting candidate shortlisting with method: ${method}`);
    console.log(`📝 Job Description: ${jobDescription.substring(0, 100)}...`);

    try {
      switch (method) {
        case 'vector':
          return await this.vectorBasedShortlisting(jobDescription, topK, filters, includeAnalysis);
        
        case 'chat':
          return await this.chatBasedShortlisting(jobDescription, topK, filters, includeAnalysis);
        
        case 'hybrid':
        default:
          return await this.hybridShortlisting(jobDescription, topK, filters, includeAnalysis);
      }
    } catch (error) {
      console.error('❌ Shortlisting failed:', error);
      throw new Error(`Shortlisting failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Vector-based shortlisting - precise technical matching
   */
  async vectorBasedShortlisting(
    query: string,
    topK: number = 10,
    filters: Record<string, any> = {},
    includeAnalysis: boolean = true
  ): Promise<ShortlistingResult> {
    console.log('🔍 Performing vector-based shortlisting...');
    
    const startTime = Date.now();
    
    // Get query analysis if requested
    let analysis;
    if (includeAnalysis) {
      try {
        analysis = await resumeApi.analyzeQuery({ message: query });
      } catch (err) {
        console.warn('Analysis failed, continuing without:', err);
      }
    }

    // Perform vector search
    const searchResponse = await resumeApi.search({
      query: analysis?.enhanced_query || query,
      top_k: topK,
      filters
    });

    const processingTime = Date.now() - startTime;

    return {
      candidates: this.formatCandidates(searchResponse.matches),
      totalResults: searchResponse.total_results,
      processingTime: processingTime / 1000,
      query,
      method: 'vector',
      analysis: analysis ? {
        intent: analysis.intent,
        keywords: analysis.keywords,
        suggestions: analysis.suggestions,
        enhancedQuery: analysis.enhanced_query
      } : undefined
    };
  }

  /**
   * Chat-based shortlisting - AI-powered natural language understanding
   */
  async chatBasedShortlisting(
    message: string,
    topK: number = 10,
    filters: Record<string, any> = {},
    includeAnalysis: boolean = true
  ): Promise<ShortlistingResult> {
    console.log('🤖 Performing AI-powered chat shortlisting...');
    
    const startTime = Date.now();
    
    // Get query analysis if requested
    let analysis;
    if (includeAnalysis) {
      try {
        analysis = await resumeApi.analyzeQuery({ message });
      } catch (err) {
        console.warn('Analysis failed, continuing without:', err);
      }
    }

    // Perform chat search
    const chatResponse = await resumeApi.chatSearch({
      message,
      top_k: topK,
      filters
    });

    const processingTime = Date.now() - startTime;

    return {
      candidates: this.formatCandidates(chatResponse.matches),
      totalResults: chatResponse.total_results,
      processingTime: processingTime / 1000,
      query: message,
      method: 'chat',
      analysis: analysis ? {
        intent: analysis.intent,
        keywords: analysis.keywords,
        suggestions: analysis.suggestions,
        enhancedQuery: analysis.enhanced_query
      } : undefined,
      summary: chatResponse.response
    };
  }

  /**
   * Hybrid shortlisting - combines multiple methods for best results
   */
  async hybridShortlisting(
    jobDescription: string,
    topK: number = 10,
    filters: Record<string, any> = {},
    includeAnalysis: boolean = true
  ): Promise<ShortlistingResult> {
    console.log('🔀 Performing hybrid shortlisting (vector + chat)...');
    
    const startTime = Date.now();

    try {
      // First, analyze the query to understand requirements
      const analysis = includeAnalysis ? 
        await resumeApi.analyzeQuery({ message: jobDescription }) : 
        null;

      // Perform both vector and chat searches
      const [vectorResults, chatResults] = await Promise.all([
        resumeApi.search({
          query: analysis?.enhanced_query || jobDescription,
          top_k: Math.ceil(topK * 0.7), // 70% from vector search
          filters
        }),
        resumeApi.chatSearch({
          message: jobDescription,
          top_k: Math.ceil(topK * 0.5), // 50% from chat search
          filters
        })
      ]);

      // Combine and deduplicate results
      const combinedCandidates = this.combineAndRankResults(
        vectorResults.matches,
        chatResults.matches,
        topK
      );

      const processingTime = Date.now() - startTime;

      return {
        candidates: combinedCandidates,
        totalResults: Math.max(vectorResults.total_results, chatResults.total_results),
        processingTime: processingTime / 1000,
        query: jobDescription,
        method: 'hybrid',
        analysis: analysis ? {
          intent: analysis.intent,
          keywords: analysis.keywords,
          suggestions: analysis.suggestions,
          enhancedQuery: analysis.enhanced_query
        } : undefined,
        summary: chatResults.response
      };

    } catch (error) {
      // Fallback to vector search if hybrid fails
      console.warn('🔄 Hybrid search failed, falling back to vector search:', error);
      return await this.vectorBasedShortlisting(jobDescription, topK, filters, includeAnalysis);
    }
  }

  /**
   * Analyze job requirements to understand what to look for
   */
  async analyzeJobRequirements(jobDescription: string) {
    console.log('📊 Analyzing job requirements...');
    
    try {
      const analysis = await resumeApi.analyzeQuery({ message: jobDescription });
      
      return {
        originalQuery: analysis.original_query,
        intent: analysis.intent,
        extractedSkills: analysis.keywords,
        suggestions: analysis.suggestions,
        enhancedQuery: analysis.enhanced_query,
        recommendedSearchTerms: this.generateSearchTerms(analysis)
      };
    } catch (error) {
      console.error('❌ Job analysis failed:', error);
      throw error;
    }
  }

  /**
   * Shortlist for specific job role with predefined criteria
   */
  async shortlistForJobRole(
    jobRequirement: JobRequirement,
    options: ShortlistingOptions = {}
  ): Promise<ShortlistingResult> {
    console.log(`🎯 Shortlisting for role: ${jobRequirement.title}`);

    // Create comprehensive job description
    const jobDescription = this.createJobDescription(jobRequirement);
    
    // Set filters based on job requirements
    const filters = {
      ...options.filters,
      experience_level: jobRequirement.experienceLevel,
      required_skills: jobRequirement.requiredSkills
    };

    return await this.shortlistCandidates(jobDescription, {
      ...options,
      filters,
      method: 'hybrid' // Use hybrid for job role shortlisting
    });
  }

  /**
   * Batch shortlisting for multiple job descriptions
   */
  async batchShortlisting(
    jobDescriptions: string[],
    options: ShortlistingOptions = {}
  ): Promise<ShortlistingResult[]> {
    console.log(`📦 Starting batch shortlisting for ${jobDescriptions.length} jobs...`);

    const results = await Promise.all(
      jobDescriptions.map((jobDesc, index) => 
        this.shortlistCandidates(jobDesc, {
          ...options,
          topK: options.topK || 5 // Smaller result set for batch processing
        }).catch(error => {
          console.error(`❌ Batch job ${index + 1} failed:`, error);
          return null;
        })
      )
    );

    return results.filter(result => result !== null) as ShortlistingResult[];
  }

  /**
   * Compare candidates against multiple job requirements
   */
  async compareCandidatesAcrossJobs(
    jobDescriptions: string[],
    candidateIds: string[]
  ) {
    console.log('🔄 Comparing candidates across multiple job descriptions...');
    
    // This would require custom endpoint or multiple searches
    // For now, we'll simulate this functionality
    const comparisons = [];
    
    for (const jobDesc of jobDescriptions) {
      for (const candidateId of candidateIds) {
        // Simulate candidate scoring for each job
        const score = Math.random(); // In real implementation, this would be calculated
        comparisons.push({
          jobDescription: jobDesc.substring(0, 50) + '...',
          candidateId,
          matchScore: score,
          recommendation: score > 0.7 ? 'highly_recommended' : 
                        score > 0.5 ? 'recommended' : 'not_recommended'
        });
      }
    }
    
    return comparisons;
  }

  // Private helper methods

  private formatCandidates(matches: any[]): ShortlistingResult['candidates'] {
    return matches.map(match => ({
      id: match.id,
      name: match.extracted_info?.name || 'Unknown',
      email: match.extracted_info?.email,
      phone: match.extracted_info?.phone,
      skills: match.extracted_info?.skills || [],
      experience: match.extracted_info?.experience || [],
      education: match.extracted_info?.education || [],
      summary: match.extracted_info?.summary,
      score: match.score,
      relevantText: match.relevant_text,
      fileName: match.file_name,
      matchingSkills: this.extractMatchingSkills(match),
      experienceLevel: this.determineExperienceLevel(match.extracted_info)
    }));
  }

  private combineAndRankResults(vectorMatches: any[], chatMatches: any[], topK: number) {
    // Combine results with weighted scoring
    const allMatches = new Map();
    
    // Add vector matches with weight
    vectorMatches.forEach(match => {
      allMatches.set(match.id, {
        ...match,
        combinedScore: match.score * 0.6 // Vector weight: 60%
      });
    });
    
    // Add chat matches with weight, combine if already exists
    chatMatches.forEach(match => {
      if (allMatches.has(match.id)) {
        const existing = allMatches.get(match.id);
        existing.combinedScore += match.score * 0.4; // Chat weight: 40%
      } else {
        allMatches.set(match.id, {
          ...match,
          combinedScore: match.score * 0.4
        });
      }
    });
    
    // Sort by combined score and take top K
    const sortedMatches = Array.from(allMatches.values())
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, topK);
    
    return this.formatCandidates(sortedMatches);
  }

  private extractMatchingSkills(match: any): string[] {
    // Extract skills that likely match the job requirements
    const skills = match.extracted_info?.skills || [];
    // In a real implementation, this would compare against job requirements
    return skills.slice(0, 5); // Return top 5 skills
  }

  private determineExperienceLevel(extractedInfo: any): 'junior' | 'mid' | 'senior' | 'lead' {
    const experience = extractedInfo?.experience || [];
    const summary = extractedInfo?.summary || '';
    
    // Simple heuristic - in production, this would be more sophisticated
    if (summary.toLowerCase().includes('senior') || experience.length > 3) {
      return 'senior';
    } else if (summary.toLowerCase().includes('lead') || summary.toLowerCase().includes('manager')) {
      return 'lead';
    } else if (experience.length > 1) {
      return 'mid';
    } else {
      return 'junior';
    }
  }

  private generateSearchTerms(analysis: any): string[] {
    const terms = [
      ...analysis.keywords,
      ...analysis.intent.skills_mentioned,
      ...analysis.intent.technologies
    ];
    
    return [...new Set(terms)]; // Remove duplicates
  }

  private createJobDescription(job: JobRequirement): string {
    return `
      Position: ${job.title}
      
      Description: ${job.description}
      
      Required Skills: ${job.requiredSkills.join(', ')}
      ${job.preferredSkills ? `Preferred Skills: ${job.preferredSkills.join(', ')}` : ''}
      
      Experience Level: ${job.experienceLevel}
      ${job.location ? `Location: ${job.location}` : ''}
      ${job.salary ? `Salary: ${job.salary}` : ''}
    `.trim();
  }
}

// Export singleton instance
export const shortlistingService = new ResumeShortlistingService();

// Export utility functions for different contexts
export const createShortlistingService = () => new ResumeShortlistingService();

export default shortlistingService;
