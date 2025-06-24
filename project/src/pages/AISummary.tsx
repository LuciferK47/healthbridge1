import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Brain, 
  Sparkles, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Lightbulb,
  FileText,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface AISummary {
  _id?: string;
  date: string;
  summary: string;
  insights: string[];
  recommendations: string[];
}

export default function AISummary() {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: summariesData, isLoading: summariesLoading } = useQuery<{ 
    success: boolean; 
    data: AISummary[] 
  }>({
    queryKey: ['ai-summaries'],
    queryFn: () => axios.get('/ai/summaries').then(res => res.data),
  });

  const generateSummaryMutation = useMutation({
    mutationFn: () => axios.post('/ai/summary'),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['ai-summaries'] });
      setIsGenerating(false);
      toast.success('AI health summary generated successfully!');
    },
    onError: (error: any) => {
      setIsGenerating(false);
      const message = error.response?.data?.message || 'Failed to generate AI summary';
      toast.error(message);
    },
  });

  const handleGenerateSummary = () => {
    setIsGenerating(true);
    generateSummaryMutation.mutate();
  };

  const summaries = summariesData?.data || [];
  const latestSummary = summaries[summaries.length - 1];

  if (summariesLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-purple-600" />
            AI Health Summary
          </h1>
          <p className="text-gray-600 mt-1">
            Get AI-powered insights about your health data and personalized recommendations
          </p>
        </div>
        <button
          onClick={handleGenerateSummary}
          disabled={isGenerating || generateSummaryMutation.isPending}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 transform hover:scale-105"
        >
          {isGenerating || generateSummaryMutation.isPending ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          <span>
            {isGenerating || generateSummaryMutation.isPending ? 'Generating...' : 'Generate New Summary'}
          </span>
        </button>
      </div>

      {/* Latest Summary */}
      {latestSummary ? (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-purple-600" />
              Latest Health Summary
            </h2>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {new Date(latestSummary.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>

          {/* Summary Text */}
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Health Overview</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {latestSummary.summary}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Insights */}
            {latestSummary.insights && latestSummary.insights.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                  Key Insights
                </h3>
                <div className="space-y-3">
                  {latestSummary.insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {insight.replace(/^[-•]\s*/, '')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {latestSummary.recommendations && latestSummary.recommendations.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-500" />
                  Recommendations
                </h3>
                <div className="space-y-3">
                  {latestSummary.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {recommendation.replace(/^[-•]\s*/, '')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">Important Disclaimer</p>
                <p className="text-sm text-yellow-700 mt-1">
                  This AI-generated summary is for informational purposes only and should not replace professional medical advice. 
                  Always consult with your healthcare provider for medical decisions and treatment plans.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No Summary Yet */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            No AI Summary Generated Yet
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Generate your first AI-powered health summary to get personalized insights about your health data, 
            trends, and recommendations for better wellness.
          </p>
          <button
            onClick={handleGenerateSummary}
            disabled={isGenerating || generateSummaryMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 mx-auto disabled:opacity-50 transform hover:scale-105"
          >
            {isGenerating || generateSummaryMutation.isPending ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span>
              {isGenerating || generateSummaryMutation.isPending ? 'Generating Your First Summary...' : 'Generate Your First Summary'}
            </span>
          </button>
        </div>
      )}

      {/* Previous Summaries */}
      {summaries.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Previous Summaries</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {summaries.slice(0, -1).reverse().map((summary, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Health Summary</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(summary.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {summary.summary.substring(0, 150)}...
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <span>{summary.insights?.length || 0} insights</span>
                    <span className="mx-2">•</span>
                    <span>{summary.recommendations?.length || 0} recommendations</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}