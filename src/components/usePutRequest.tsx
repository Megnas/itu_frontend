import { useState } from "react";

interface UsePutRequestResult<T, D> {
  response: T | null;
  error: string | null;
  loading: boolean;
  sendPutRequest: (data: D) => Promise<void>;
}

const usePutRequest = <T, D = any>(endpoint: string): UsePutRequestResult<T, D> => {
  const [response, setResponse] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const sendPutRequest = async (data: D): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data), 
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const result: T = await res.json();
      setResponse(result);
    } catch (err: unknown) {
      setError((err as Error).message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { response, error, loading, sendPutRequest };
};

export default usePutRequest;
