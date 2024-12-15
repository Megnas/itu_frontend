//Projekt ITU - Pivní Plánovač
//Autor: Dominik Václavík

import { useState } from "react";

interface UsePutRequestCnstResult<T, D> {
  response: T | null;
  error: string | null;
  loading: boolean;
  sendPutRequestCnst: (specific_endpoint: string, data: D) => Promise<void>;
}

const usePutRequestCnst = <T, D = any>(endpoint: string): UsePutRequestCnstResult<T, D> => {
  const [response, setResponse] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const sendPutRequestCnst = async (specific_endpoint: string, data: D): Promise<void> => {
    console.log("Making PUT Request", data)
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}${endpoint}${specific_endpoint}`, {
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

  return { response, error, loading, sendPutRequestCnst };
};

export default usePutRequestCnst;
