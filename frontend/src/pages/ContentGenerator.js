import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  Sparkles, 
  FileText, 
  Play, 
  Share2, 
  Search,
  Loader2,
  Copy,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { contentAPI, dataAPI } from '../services/api';

const ContentGenerator = () => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [suggestions, setSuggestions] = useState(null);
  const [ragResponse, setRagResponse] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: companyData } = useQuery('companyData', dataAPI.getCompanyData, {
    retry: false,
    onError: () => {
      // Company data not available, continue without it
    }
  });

  const generateSuggestionsMutation = useMutation(
    contentAPI.generateSuggestions,
    {
      onSuccess: (data) => {
        setSuggestions(data.data);
        toast.success('Content suggestions generated successfully!');
      },
      onError: (error) => {
        toast.error('Failed to generate suggestions');
      }
    }
  );

  const generateRAGMutation = useMutation(
    contentAPI.generateRAGContent,
    {
      onSuccess: (data) => {
        setRagResponse(data.data);
        toast.success('RAG response generated successfully!');
      },
      onError: (error) => {
        toast.error('Failed to generate RAG response');
      }
    }
  );

  const onSubmitSuggestions = (data) => {
    const payload = {
      companyData: companyData?.data || {
        description: data.description,
        goals: data.goals ? data.goals.split('\n').filter(g => g.trim()) : [],
        targets: data.targets ? data.targets.split('\n').filter(t => t.trim()) : []
      },
      contentType: data.contentType,
      goals: data.additionalGoals
    };

    generateSuggestionsMutation.mutate(payload);
  };

  const onSubmitRAG = (data) => {
    const payload = {
      query: data.query,
      companyData: companyData?.data || {}
    };

    generateRAGMutation.mutate(payload);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatPostForCopy = (suggestion) => {
    const content = suggestion.content || suggestion.post_content || suggestion.description || '';
    const hashtags = (suggestion.formattedHashtags || suggestion.hashtags || []).join(' ');
    const engagement = suggestion.engagementStrategy || '';
    
    let formatted = `${suggestion.title || suggestion.post_title || 'Post'}\n\n`;
    formatted += `${content}\n\n`;
    
    if (hashtags) {
      formatted += `${hashtags}\n\n`;
    }
    
    if (engagement) {
      formatted += `Engagement: ${engagement}`;
    }
    
    return formatted.trim();
  };

  const submitFeedback = (suggestionId, rating) => {
    // In a real app, you would call the feedback API here
    toast.success(`Feedback submitted: ${rating} stars`);
  };

  const contentTypes = [
    { value: 'articles', label: 'Articles', icon: FileText },
    { value: 'demos', label: 'Demo Ideas', icon: Play },
    { value: 'socialMedia', label: 'Social Media Posts', icon: Share2 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Content Generator</h1>
        <p className="text-gray-600 mt-2">
          Generate AI-powered content suggestions using Nebius and Qdrant RAG
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'suggestions'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Sparkles className="inline h-4 w-4 mr-2" />
            Content Suggestions
          </button>
          <button
            onClick={() => setActiveTab('rag')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rag'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Search className="inline h-4 w-4 mr-2" />
            RAG Query
          </button>
        </nav>
      </div>

      {/* Content Suggestions Tab */}
      {activeTab === 'suggestions' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate Suggestions</h2>
            <form onSubmit={handleSubmit(onSubmitSuggestions)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                <select
                  {...register('contentType', { required: 'Content type is required' })}
                  className="input-field"
                >
                  <option value="">Select content type</option>
                  {contentTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    );
                  })}
                </select>
                {errors.contentType && (
                  <p className="text-red-600 text-sm mt-1">{errors.contentType.message}</p>
                )}
              </div>

              {!companyData?.data && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Description
                    </label>
                    <textarea
                      {...register('description', { required: 'Description is required' })}
                      rows={3}
                      className="textarea-field"
                      placeholder="Describe your company, products, and services..."
                    />
                    {errors.description && (
                      <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Goals (one per line)
                    </label>
                    <textarea
                      {...register('goals')}
                      rows={3}
                      className="textarea-field"
                      placeholder="Enter your company goals..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Targets (one per line)
                    </label>
                    <textarea
                      {...register('targets')}
                      rows={3}
                      className="textarea-field"
                      placeholder="Enter your target audiences..."
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Goals/Context
                </label>
                <textarea
                  {...register('additionalGoals')}
                  rows={2}
                  className="textarea-field"
                  placeholder="Any specific goals or context for this content..."
                />
              </div>

              <button
                type="submit"
                disabled={generateSuggestionsMutation.isLoading}
                className="btn-primary w-full flex items-center justify-center"
              >
                {generateSuggestionsMutation.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Suggestions
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Generated Suggestions</h2>
            {generateSuggestionsMutation.isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
                  <p className="text-gray-600">Generating suggestions...</p>
                </div>
              </div>
            ) : suggestions ? (
              <div className="space-y-6">
                {/* Summary */}
                {Array.isArray(suggestions) && suggestions.length > 2 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      Generated {suggestions.length} posts. Showing the first 2 below.
                    </p>
                  </div>
                )}
                
                {Array.isArray(suggestions) ? (
                  suggestions.slice(0, 2).map((suggestion, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white">
                      {/* Header with title and platform */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {suggestion.title || suggestion.post_title || `Post ${index + 1}`}
                          </h3>
                          {suggestion.platform && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {suggestion.platformIcon || '📱'} {suggestion.platform}
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(formatPostForCopy(suggestion))}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Copy post content"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => submitFeedback(`suggestion_${index}`, 5)}
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Like this post"
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => submitFeedback(`suggestion_${index}`, 1)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Dislike this post"
                          >
                            <ThumbsDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Post content */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Content:</h4>
                        <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                          <p className="text-gray-800 leading-relaxed">
                            {suggestion.content || suggestion.post_content || suggestion.description}
                          </p>
                        </div>
                      </div>

                      {/* Hashtags */}
                      {suggestion.hashtags && suggestion.hashtags.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Hashtags:</h4>
                          <div className="flex flex-wrap gap-2">
                            {(suggestion.formattedHashtags || suggestion.hashtags).map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Engagement strategy */}
                      {suggestion.engagementStrategy && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Engagement Strategy:</h4>
                          <div className="bg-yellow-50 rounded-lg p-3 border-l-4 border-yellow-500">
                            <p className="text-gray-700 text-sm">
                              {suggestion.engagementStrategy}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Copy full post button */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => copyToClipboard(formatPostForCopy(suggestion))}
                          className="btn-secondary flex items-center text-sm"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Full Post
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-600">
                    <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(suggestions, null, 2)}</pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No suggestions generated yet</p>
                <p className="text-sm">Fill out the form and click generate to get started</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RAG Query Tab */}
      {activeTab === 'rag' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">RAG Query</h2>
            <form onSubmit={handleSubmit(onSubmitRAG)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Query
                </label>
                <textarea
                  {...register('query', { required: 'Query is required' })}
                  rows={4}
                  className="textarea-field"
                  placeholder="Ask a question or describe what you're looking for..."
                />
                {errors.query && (
                  <p className="text-red-600 text-sm mt-1">{errors.query.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={generateRAGMutation.isLoading}
                className="btn-primary w-full flex items-center justify-center"
              >
                {generateRAGMutation.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Response...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Generate RAG Response
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">RAG Response</h2>
            {generateRAGMutation.isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
                  <p className="text-gray-600">Generating response...</p>
                </div>
              </div>
            ) : ragResponse ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Query:</h4>
                  <p className="text-gray-700">{ragResponse.query}</p>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Response:</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{ragResponse.response}</p>
                </div>

                {ragResponse.context && ragResponse.context.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Context Sources:</h4>
                    <div className="space-y-2">
                      {ragResponse.context.map((ctx, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          <span className="font-medium">Type:</span> {ctx.type} | 
                          <span className="font-medium ml-2">Score:</span> {ctx.score?.toFixed(3)} | 
                          <span className="font-medium ml-2">Text:</span> {ctx.text.substring(0, 100)}...
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(ragResponse.response)}
                    className="btn-secondary flex items-center"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Response
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No RAG response generated yet</p>
                <p className="text-sm">Enter a query and click generate to get started</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentGenerator; 