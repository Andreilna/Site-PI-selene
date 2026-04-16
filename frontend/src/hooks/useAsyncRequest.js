import { useCallback, useEffect, useState } from "react";

export default function useAsyncRequest(asyncFunction, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const result = await asyncFunction();
        if (!active) return;
        setData(result);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    setLoading(true);
    run();

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    data,
    loading,
    error,
    retry: execute,
  };
}

