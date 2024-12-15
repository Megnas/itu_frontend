//Projekt ITU - Pivní Plánovač
//Autor: Dominik Václavík

import { useState } from "react";

interface UsePostRequestResult<T, D> {
  response: T | null;
  error: string | null;
  loading: boolean;
  sendPostRequest: (data: D, callback?: (response: T | null, error: string | null) => void) => Promise<void>;
}

const usePostRequest = <T, D = any>(endpoint: string): UsePostRequestResult<T, D> => {
  const [response, setResponse] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const sendPostRequest = async (data: D, callback?: (response: T | null, error: string | null) => void): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set the content type to JSON
        },
        body: JSON.stringify(data), // Convert the data to JSON string
      });

      if (!res.ok) {
        throw new Error("Network response was not ok");
      }

      const result: T = await res.json();
      setResponse(result); // Set the response data

      if (callback) {
        callback(result, null); // No error, passing response
      }
    } catch (err: unknown) {
      setError((err as Error).message || "An error occurred");

      if (callback) {
        callback(null, (err as Error).message || "An error occurred"); // Passing error message
      }
    } finally {
      setLoading(false);
    }
  };

  return { response, error, loading, sendPostRequest };
};

export default usePostRequest;