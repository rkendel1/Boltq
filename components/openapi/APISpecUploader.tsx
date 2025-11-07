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
    <div className="bg-[#181818] rounded-lg p-6 border border-gray-700">
      <h2 className="text-xl font-semibold mb-4 text-white">Upload OpenAPI Specification</h2>
      
      {/* URL Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <LinkIcon className="inline h-4 w-4 mr-1" />
          Load from URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/openapi.json"
            className="flex-1 bg-[#272727] text-white rounded-lg px-4 py-2 outline-none border border-gray-600 focus:border-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleUrlSubmit}
            disabled={loading || !url.trim()}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
          >
            {loading ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <LinkIcon className="h-4 w-4" />
            )}
            Load
          </button>
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Upload className="inline h-4 w-4 mr-1" />
          Upload from File
        </label>
        <input
          type="file"
          accept=".json,.yaml,.yml"
          onChange={handleFileUpload}
          disabled={loading}
          className="block w-full text-sm text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-500 file:text-white
            hover:file:bg-blue-600
            file:cursor-pointer cursor-pointer"
        />
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-2 rounded-lg">
          {success}
        </div>
      )}
    </div>
  );
};

export default APISpecUploader;
