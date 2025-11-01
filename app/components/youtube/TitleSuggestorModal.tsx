'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Lightbulb, AlertCircle, Copy, Check, TrendingUp } from 'lucide-react';

interface TitleSuggestion {
  title: string;
  reasoning: string;
  estimatedEngagement: 'high' | 'medium' | 'low';
}

interface TitleSuggesterModalProps {
  isOpen: boolean;
  onClose: () => void;
  trendingTitles: string[];
  region?: string;
  category?: string;
}

export default function TitleSuggesterModal({
  isOpen,
  onClose,
  trendingTitles,
  region = 'Global',
  category = 'General',
}: TitleSuggesterModalProps) {
  const [videoIdea, setVideoIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<TitleSuggestion[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setVideoIdea('');
      setError('');
      setLoading(false);
      setSuggestions([]);
      setCopiedIndex(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoIdea.trim()) {
      setError('Please describe your video idea');
      return;
    }
    if (!trendingTitles || trendingTitles.length === 0) {
      setError('No trending titles available. Please provide trending titles first.');
      return;
    }

    setLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const response = await fetch('/api/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trendingTitles, videoIdea: videoIdea.trim(), region, category }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate suggestions');
      }

      setSuggestions(data.suggestions || []);
    } catch (err: any) {
      console.error('Error generating titles:', err);
      setError(err.message || 'Failed to generate title suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (title: string, index: number) => {
    try {
      await navigator.clipboard.writeText(title);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] px-4 overflow-y-auto"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 glass-very-light" />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl max-h-[80vh] flex flex-col bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden text-gray-900 mb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Compact */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-purple-100 rounded-lg">
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <h2 className="text-md font-semibold text-gray-900">AI Title Suggester</h2>
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-purple-600">{region}</span> ·{' '}
                <span className="font-semibold text-purple-600">{category}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 transition"
            disabled={loading}
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="px-4 py-3 border-b border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Describe your video idea
          </label>
          <textarea
            value={videoIdea}
            onChange={(e) => {
              setVideoIdea(e.target.value);
              setError('');
            }}
            placeholder="E.g., A tutorial on how to make sourdough bread for beginners..."
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-100 text-sm text-gray-900 placeholder:text-gray-400 resize-none transition min-h-[80px]"
            disabled={loading}
            autoFocus
          />
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Analyzing {trendingTitles.length} trending titles</span>
            </div>
            <button
              type="submit"
              disabled={loading || !videoIdea.trim()}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition flex items-center gap-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate
                </>
              )}
            </button>
          </div>
        </form>

        {/* Content */}
        <div className="px-4 py-3 flex-1 overflow-y-auto">
          {error ? (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <Lightbulb className="w-3.5 h-3.5 text-purple-500" />
                <span>Suggested Titles</span>
              </div>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:shadow-sm transition group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 flex-1 leading-snug">
                      {suggestion.title}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${getEngagementColor(
                          suggestion.estimatedEngagement
                        )}`}
                      >
                        {suggestion.estimatedEngagement}
                      </span>
                      <button
                        onClick={() => copyToClipboard(suggestion.title, index)}
                        className="p-1 rounded-lg hover:bg-gray-100 transition opacity-0 group-hover:opacity-100"
                        title="Copy title"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{suggestion.reasoning}</p>
                </div>
              ))}
            </div>
          ) : !loading ? (
            <div className="text-center py-8">
              <div className="inline-flex p-3 bg-purple-100 rounded-full mb-3">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-md font-medium text-gray-900 mb-1">Ready to generate titles</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Enter your video idea above and click "Generate" to get AI-powered suggestions based on trending content in {region}.
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500 mx-auto mb-3" />
              <h3 className="text-md font-medium text-gray-900 mb-1">Analyzing trends...</h3>
              <p className="text-sm text-gray-500">AI is crafting perfect titles for your video</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
