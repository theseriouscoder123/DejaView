'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, Link2, AtSign } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (url: string) => Promise<void>;
}

export default function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setInput('');
      setError('');
      setLoading(false);
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
    if (!input.trim()) {
      setError('Please enter something');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSearch(input.trim());
      onClose();
    } catch {
      setError('Could not find that video or channel');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0  glass-very-light" />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl rounded-2xl bg-white border border-gray-200 shadow-2xl overflow-hidden text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 px-6 py-5 border-b border-gray-200"
        >
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError('');
            }}
            placeholder="Search YouTube videos or channels..."
            className="flex-1 bg-transparent outline-none text-base text-gray-900 placeholder:text-gray-400"
            disabled={loading}
            autoFocus
          />
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin text-red-500" />
          ) : input ? (
            <button
              type="button"
              onClick={() => setInput('')}
              className="p-1.5 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          ) : (
            <span className="text-xs text-gray-400 border border-gray-200 rounded-md px-2 py-0.5">
              esc
            </span>
          )}
        </form>

        {/* Content Section */}
        <div className="px-6 py-5">
          {error ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-3 tracking-wider">
                  Material UI
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Link2 className="w-4 h-4 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Video URLs</p>
                      <p className="text-xs text-gray-500 truncate">
                        youtube.com/watch?v=...
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <AtSign className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Channel handles</p>
                      <p className="text-xs text-gray-500 truncate">@username or ID</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
