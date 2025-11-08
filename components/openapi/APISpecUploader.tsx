'use client';

import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Loader2Icon } from 'lucide-react';
import axios from 'axios';

interface APISpecUploaderProps {
  onSpecUploaded?: (specId: string) => void;
}

const APISpecUploader: React.FC<APISpecUploaderProps> = ({ onSpecUploaded }) => {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUrlSubmit = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post('/api/openapi', { url });
      
      if (response.data.success) {
        setSuccess('OpenAPI spec loaded successfully!');
        if (onSpecUploaded && response.data.data?.specId) {
          onSpecUploaded(response.data.data.specId);
        }
        setUrl('');
      } else {
        setError(response.data.error || 'Failed to load OpenAPI spec');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload spec');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const text = await file.text();
      
      // Auto-detect format and convert if needed
      const { processOpenAPIContent } = await import('@/lib/utils/yamlConverter');
      const result = await processOpenAPIContent(text);
      
      if (!result.success) {
        setError(result.error || 'Failed to process file');
        setLoading(false);
        return;
      }
      
      const spec = result.data;
      const response = await axios.post('/api/openapi', { spec });
      
      if (response.data.success) {
        setSuccess('OpenAPI spec uploaded successfully!');
        if (onSpecUploaded && response.data.data?.specId) {
          onSpecUploaded(response.data.data.specId);
        }
      } else {
        setError(response.data.error || 'Failed to upload OpenAPI spec');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse or upload file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700 shadow-xl animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <Upload className="h-6 w-6 text-blue-400" />
        Upload OpenAPI Specification
      </h2>
      
      {/* URL Input */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          <LinkIcon className="inline h-4 w-4 mr-2 text-blue-400" />
          Load from URL
        </label>
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/openapi.json"
            className="flex-1 bg-gray-900/80 text-white rounded-lg px-4 py-3 outline-none border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 placeholder-gray-500"
            disabled={loading}
          />
          <button
            onClick={handleUrlSubmit}
            disabled={loading || !url.trim()}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-8 py-3 rounded-lg flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2Icon className="h-5 w-5 animate-spin" />
            ) : (
              <LinkIcon className="h-5 w-5" />
            )}
            {loading ? 'Loading...' : 'Load'}
          </button>
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          <Upload className="inline h-4 w-4 mr-2 text-purple-400" />
          Upload from File
        </label>
        <div className="relative group">
          <input
            type="file"
            accept=".json,.yaml,.yml"
            onChange={handleFileUpload}
            disabled={loading}
            className="block w-full text-sm text-gray-400
              file:mr-4 file:py-3 file:px-6
              file:rounded-lg file:border-0
              file:text-sm file:font-semibold
              file:bg-gradient-to-r file:from-purple-500 file:to-purple-600
              file:text-white
              hover:file:from-purple-600 hover:file:to-purple-700
              file:cursor-pointer cursor-pointer
              file:shadow-lg hover:file:shadow-xl
              file:transition-all file:duration-300
              file:transform hover:file:scale-105
              disabled:file:opacity-50 disabled:file:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-5 py-4 rounded-lg flex items-center gap-3 animate-fade-in backdrop-blur-sm">
          <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="font-medium">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-5 py-4 rounded-lg flex items-center gap-3 animate-fade-in backdrop-blur-sm">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="font-medium">{success}</span>
        </div>
      )}
    </div>
  );
};

export default APISpecUploader;
