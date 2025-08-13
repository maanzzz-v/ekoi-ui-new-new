/**
 * Clean UI Components for Chat Interface
 * Simplified React components for better readability and less clutter
 */

"use client"

import React from 'react'
import { 
  User, 
  Award, 
  Briefcase, 
  FileText,
  Mail, 
  Star, 
  TrendingUp,
  Clock, 
  CheckCircle,
  Target,
  BarChart3,
  Users,
  Brain,
  Lightbulb,
  ArrowRight,
  ExternalLink,
  Download,
  MessageSquare,
  Search,
  Filter,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  CandidateCard as CandidateCardType,
  QualityIndicators as QualityIndicatorsType,
  SearchInsights as SearchInsightsType,
  ConversationFlow,
  QuickAction,
  UIComponents
} from '@/lib/api'

// ============================
// Simplified Candidate Card Component
// ============================

interface EnhancedCandidateCardProps {
  candidate: CandidateCardType;
  onContact?: (candidateId: string) => void;
  onViewDetails?: (candidateId: string) => void;
  onDownload?: (candidateId: string) => void;
}

export function EnhancedCandidateCard({ 
  candidate, 
  onContact, 
  onViewDetails, 
  onDownload 
}: EnhancedCandidateCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 0.7) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 0.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getScoreGrade = (score: number) => {
    if (score >= 0.95) return 'A+'
    if (score >= 0.85) return 'A'
    if (score >= 0.75) return 'B+'
    if (score >= 0.65) return 'B'
    if (score >= 0.55) return 'C+'
    return 'C'
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 bg-gradient-to-br from-white to-blue-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                {candidate.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-white text-xs font-bold flex items-center justify-center ${getScoreColor(candidate.score)}`}>
                #{candidate.rank}
              </div>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                {candidate.name}
              </CardTitle>
              <p className="text-sm text-gray-600 font-medium">{candidate.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={`text-xs font-semibold ${getScoreColor(candidate.score)}`}>
                  {getScoreGrade(candidate.score)} Match
                </Badge>
                <span className="text-xs text-gray-500">{(candidate.score * 100).toFixed(1)}% relevance</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="sm" variant="ghost" onClick={() => onViewDetails?.(candidate.id)}>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => onDownload?.(candidate.id)}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Skills Section */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Core Skills</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {candidate.skills.slice(0, 6).map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 6 && (
              <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600">
                +{candidate.skills.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        {/* Experience Summary */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Briefcase className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">Experience</span>
          </div>
          <p className="text-sm text-gray-600">{candidate.experience_summary}</p>
        </div>

        {/* Match Highlights */}
        {candidate.match_highlights.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Key Highlights</span>
            </div>
            <div className="space-y-1">
              {candidate.match_highlights.slice(0, 2).map((highlight, index) => (
                <p key={index} className="text-xs text-gray-600 bg-purple-50 p-2 rounded-md border-l-2 border-purple-200">
                  {highlight.length > 100 ? `${highlight.slice(0, 100)}...` : highlight}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            onClick={() => onContact?.(candidate.id)}
          >
            <Mail className="h-3 w-3 mr-1" />
            Contact
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => onViewDetails?.(candidate.id)}
          >
            <FileText className="h-3 w-3 mr-1" />
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================
// Quality Indicators Component
// ============================

interface QualityIndicatorsProps {
  indicators: QualityIndicatorsType;
}

export function QualityIndicators({ indicators }: QualityIndicatorsProps) {
  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-blue-600'
    if (score >= 0.4) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-blue-500" />
          Search Quality Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{indicators.total_matches}</div>
          <div className="text-xs text-gray-600 mt-1">Total Matches</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{indicators.high_quality}</div>
          <div className="text-xs text-gray-600 mt-1">High Quality</div>
        </div>
        
        <div className="text-center">
          <div className={`text-2xl font-bold ${getQualityColor(indicators.average_score)}`}>
            {indicators.average_score.toFixed(2)}
          </div>
          <div className="text-xs text-gray-600 mt-1">Avg Score</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {(indicators.consistency * 100).toFixed(0)}%
          </div>
          <div className="text-xs text-gray-600 mt-1">Consistency</div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================
// Search Insights Component
// ============================

interface SearchInsightsProps {
  insights: SearchInsightsType;
}

export function SearchInsights({ insights }: SearchInsightsProps) {
  const getDepthColor = (depth: string) => {
    switch (depth) {
      case 'high': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Brain className="h-5 w-5 text-purple-500" />
          AI Search Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Detected Domains */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Detected Skill Domains</div>
          <div className="flex flex-wrap gap-2">
            {insights.detected_domains.map((domain: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                {domain}
              </Badge>
            ))}
          </div>
        </div>

        {/* Technical Depth */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-700">Technical Depth</div>
            <div className="text-xs text-gray-500 mt-1">Query complexity analysis</div>
          </div>
          <Badge className={`text-xs font-medium ${getDepthColor(insights.technical_depth)}`}>
            {insights.technical_depth.toUpperCase()}
          </Badge>
        </div>

        {/* Intent Confidence */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">Intent Confidence</div>
            <div className="text-sm font-semibold text-gray-900">
              {(insights.intent_confidence * 100).toFixed(0)}%
            </div>
          </div>
          <Progress 
            value={insights.intent_confidence * 100} 
            className="h-2"
          />
          <div className="text-xs text-gray-500 mt-1">
            AI understanding of search intent
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================
// Experience Chart Component
// ============================

interface ExperienceChartProps {
  data: {
    Junior: number;
    'Mid-level': number;
    Senior: number;
    Lead: number;
  };
}

export function ExperienceChart({ data }: ExperienceChartProps) {
  const total = Object.values(data).reduce((sum, val) => sum + val, 0);
  
  const levels = [
    { key: 'Junior', label: 'Junior', color: 'bg-blue-500', textColor: 'text-blue-600' },
    { key: 'Mid-level', label: 'Mid-Level', color: 'bg-green-500', textColor: 'text-green-600' },
    { key: 'Senior', label: 'Senior', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    { key: 'Lead', label: 'Lead', color: 'bg-purple-500', textColor: 'text-purple-600' }
  ];

  return (
    <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-green-500" />
          Experience Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {levels.map((level) => {
          const count = data[level.key as keyof typeof data];
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <div key={level.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${level.color}`} />
                  <span className="text-sm font-medium text-gray-700">{level.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${level.textColor}`}>{count}</span>
                  <span className="text-xs text-gray-500">({percentage.toFixed(0)}%)</span>
                </div>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
        
        {total === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No experience data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================
// Skill Tags Cloud Component
// ============================

interface SkillTagsCloudProps {
  tags: string[];
  onTagClick?: (tag: string) => void;
}

export function SkillTagsCloud({ tags, onTagClick }: SkillTagsCloudProps) {
  // Sort tags by frequency/importance (for now, just alphabetically)
  const sortedTags = [...tags].sort();
  
  const getTagSize = (index: number) => {
    if (index < 3) return 'text-sm px-3 py-2'
    if (index < 6) return 'text-xs px-2 py-1'
    return 'text-xs px-2 py-1'
  }

  const getTagColor = (index: number) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
      'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
      'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
      'bg-pink-100 text-pink-800 border-pink-200 hover:bg-pink-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-200'
    ];
    return colors[index % colors.length];
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="h-5 w-5 text-blue-500" />
          Top Skills Found
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {sortedTags.map((tag, index) => (
            <button
              key={index}
              onClick={() => onTagClick?.(tag)}
              className={`
                ${getTagSize(index)} 
                ${getTagColor(index)}
                border rounded-full font-medium transition-all duration-200
                hover:scale-105 hover:shadow-sm cursor-pointer
              `}
            >
              {tag}
            </button>
          ))}
        </div>
        
        {tags.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No skills data available
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================
// Follow-up Questions Component
// ============================

interface FollowUpQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export function FollowUpQuestions({ questions, onQuestionClick }: FollowUpQuestionsProps) {
  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Ask Follow-up Questions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {questions.map((question, index) => (
            <button
              key={index}
              onClick={() => onQuestionClick(question)}
              className="text-left p-3 rounded-lg border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 transition-colors text-sm text-gray-700 hover:text-gray-900"
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                <span>{question}</span>
              </div>
            </button>
          ))}
        </div>
        
        {questions.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No follow-up questions available
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================
// Quick Actions Panel Component
// ============================

interface QuickActionsPanelProps {
  actions: QuickAction[];
  onAction: (action: QuickAction) => void;
}

export function QuickActionsPanel({ actions, onAction }: QuickActionsPanelProps) {
  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'contact': return <Mail className="h-4 w-4" />
      case 'compare': return <Users className="h-4 w-4" />
      case 'refine': return <Filter className="h-4 w-4" />
      case 'search': return <Search className="h-4 w-4" />
      case 'next': return <ArrowRight className="h-4 w-4" />
      default: return <Zap className="h-4 w-4" />
    }
  }

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'contact': return 'bg-blue-600 hover:bg-blue-700 text-white'
      case 'compare': return 'bg-green-600 hover:bg-green-700 text-white'
      case 'refine': return 'bg-yellow-600 hover:bg-yellow-700 text-white'
      case 'search': return 'bg-purple-600 hover:bg-purple-700 text-white'
      case 'next': return 'bg-gray-600 hover:bg-gray-700 text-white'
      default: return 'bg-orange-600 hover:bg-orange-700 text-white'
    }
  }

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5 text-orange-500" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={() => onAction(action)}
              className={`${getActionColor(action.action)} text-sm h-auto p-3 justify-start`}
            >
              <div className="flex items-center gap-2">
                {getActionIcon(action.action)}
                <span>{action.label}</span>
              </div>
            </Button>
          ))}
        </div>
        
        {actions.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No quick actions available
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================
// Complete UI Components Renderer
// ============================

interface UIComponentsRendererProps {
  components: UIComponents;
  onCandidateContact?: (candidateId: string) => void;
  onCandidateView?: (candidateId: string) => void;
  onCandidateDownload?: (candidateId: string) => void;
  onTagClick?: (tag: string) => void;
  onFollowUpQuestion?: (question: string) => void;
  onQuickAction?: (action: QuickAction) => void;
}

export function UIComponentsRenderer({
  components,
  onCandidateContact,
  onCandidateView,
  onCandidateDownload,
  onTagClick,
  onFollowUpQuestion,
  onQuickAction
}: UIComponentsRendererProps) {
  return (
    <div className="space-y-6">
      {/* Candidate Cards Grid */}
      {components.candidate_cards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            Matching Candidates ({components.candidate_cards.length})
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {components.candidate_cards.map((candidate) => (
              <EnhancedCandidateCard
                key={candidate.id}
                candidate={candidate}
                onContact={onCandidateContact}
                onViewDetails={onCandidateView}
                onDownload={onCandidateDownload}
              />
            ))}
          </div>
        </div>
      )}

      {/* Analytics and Insights Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <QualityIndicators indicators={components.quality_indicators} />
        <SearchInsights insights={components.search_insights} />
      </div>

      {/* Skills and Experience Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SkillTagsCloud tags={components.skill_tags} onTagClick={onTagClick} />
        <ExperienceChart data={components.experience_chart} />
      </div>
    </div>
  )
}

// ============================
// Conversation Flow Renderer
// ============================

interface ConversationFlowRendererProps {
  flow: ConversationFlow;
  onFollowUpQuestion?: (question: string) => void;
}

export function ConversationFlowRenderer({
  flow,
  onFollowUpQuestion
}: ConversationFlowRendererProps) {
  return (
    <div className="space-y-4">
      {flow.follow_up_questions.length > 0 && onFollowUpQuestion && (
        <FollowUpQuestions
          questions={flow.follow_up_questions}
          onQuestionClick={onFollowUpQuestion}
        />
      )}
      
      {flow.refinement_options.length > 0 && (
        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5 text-indigo-500" />
              Refine Your Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {flow.refinement_options.map((option, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                  <CheckCircle className="h-4 w-4 text-indigo-500" />
                  <span>{option}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
