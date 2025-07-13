import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const useColorization = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const colorizeImage = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload and colorize image
      const response = await axios.post(`${API_BASE_URL}/api/colorize`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds timeout
      });

      const { file_id, output_url } = response.data;

      // Poll for completion
      const result = await pollForCompletion(file_id);
      
      return {
        id: file_id,
        url: `${API_BASE_URL}${output_url}`,
        originalUrl: `${API_BASE_URL}${response.data.input_url}`,
        timestamp: new Date().toISOString(),
      };

    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Colorization failed';
      setError(errorMessage);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pollForCompletion = useCallback(async (fileId, maxAttempts = 30) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/progress/${fileId}`);
        const { status, progress } = response.data;

        if (status === 'completed') {
          return response.data;
        }

        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err) {
        console.warn('Progress check failed:', err);
        // Continue polling even if one check fails
      }
    }

    throw new Error('Colorization timed out');
  }, []);

  const checkProgress = useCallback(async (fileId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/progress/${fileId}`);
      return response.data;
    } catch (err) {
      console.error('Progress check failed:', err);
      throw err;
    }
  }, []);

  const downloadResult = useCallback(async (fileId, filename) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/download/${fileId}`, {
        responseType: 'blob',
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || `colorized_${fileId}.jpg`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Image downloaded successfully!');
    } catch (err) {
      const errorMessage = 'Failed to download image';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const checkHealth = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/health`);
      return response.data;
    } catch (err) {
      console.error('Health check failed:', err);
      return { status: 'unhealthy', model_loaded: false };
    }
  }, []);

  const getModels = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/models`);
      return response.data;
    } catch (err) {
      console.error('Failed to get models:', err);
      return { models: [] };
    }
  }, []);

  return {
    colorizeImage,
    checkProgress,
    downloadResult,
    checkHealth,
    getModels,
    isLoading,
    error,
  };
}; 