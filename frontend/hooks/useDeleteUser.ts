// hooks/useDeleteUser.ts

import { useState } from 'react';

interface DeleteResponse {
  success: boolean;
  message: string;
  userId?: number;
  authUserId?: string;
  error?: string;
  detail?: string;
  tablesDeleted?: boolean;
}

// Helper function to get backend URL
const getBackendUrl = (): string => {
  // Check if we're in production mode
  if (import.meta.env.PROD || import.meta.env.VITE_NODE_ENV === 'production') {
    return 'https://api.bethlehemmedcenter.com';
  }
  
  // Check hostname to determine environment
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // Use localhost only if actually running on localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '') {
      return 'http://localhost:5000';
    }
    // For any other hostname (including production domain), use production API
    return 'https://api.bethlehemmedcenter.com';
  }
  
  // Default to production URL for safety
  return 'https://api.bethlehemmedcenter.com';
};

export const useDeleteUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = async (userId: number): Promise<DeleteResponse> => {
    setLoading(true);
    setError(null);

    try {
      const backendUrl = getBackendUrl();
      
      const response = await fetch(`${backendUrl}/api/admin/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth token if needed
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ userId })
      });

      const data: DeleteResponse = await response.json();

      if (!response.ok) {
        const errorMsg = data.error || 'Failed to delete user';
        setError(errorMsg);
        return data;
      }

      return data;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return {
        success: false,
        message: 'Error deleting user',
        error: errorMsg
      };
    } finally {
      setLoading(false);
    }
  };

  return { deleteUser, loading, error };
};
