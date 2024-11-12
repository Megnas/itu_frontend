import { useState } from 'react';

interface UseDeleteResponse {
  status: string | null;
  loading: boolean;
  error: string | null;
  handleDelete: (data: string) => void;
}

const useDeleteRequest = (endpoint: string): UseDeleteResponse => {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleDelete = async (data: string) => {
    setLoading(true);
    setStatus(null);  // Reset the status
    setError(null);   // Reset the error

    try {
      const response = await fetch(`${apiUrl}${endpoint}${data}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStatus('Delete successful!');
      } else {
        setStatus('Failed to delete.');
      }
    } catch (error) {
      setError('Error occurred while deleting.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { status, loading, error, handleDelete };
};

export default useDeleteRequest;