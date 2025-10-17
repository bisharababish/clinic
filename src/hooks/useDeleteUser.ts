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

export const useDeleteUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = async (userId: number): Promise<DeleteResponse> => {
    setLoading(true);
    setError(null);

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
      
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