import { useState, useEffect } from "react";

interface UseLoadDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null; // Adjust as needed for your error shape
}

const useFetchData = <T,>(endpoint: string, dependencies: any[] = []): UseLoadDataResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!apiUrl) {
      setError("API URL is not defined in environment variables");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const fetchData = async () => {
      setError(null);
      setData(null);
      setLoading(true);

      try {
        const response = await fetch(`${apiUrl}${endpoint}`, { signal });
        if (!response.ok) {
          throw await response.json();
        }

        const data: T = await response.json();
        setData(data);
        setLoading(false);
      } catch (err) {
        if (signal.aborted) {
          console.log("Fetch aborted");
        } else {
          setError(typeof err === "string" ? err : "An unknown error occurred");
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort(); // Abort the fetch request on component unmount or dependency change
    };
  }, [apiUrl, endpoint, ...dependencies]);

  return { data, loading, error };
};

export default useFetchData;