"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL, getApiError } from "@/lib/api";
import { SERVICES, type Service } from "@/lib/data";

type ApiService = Service & {
  id: number;
  is_active: boolean;
};

export function useStoreServices() {
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadServices() {
      try {
        const response = await fetch(`${API_BASE_URL}/services`);
        const result = (await response.json()) as ApiService[] | { detail?: unknown };
        if (!response.ok || !Array.isArray(result)) {
          throw new Error(getApiError(result, "Imeshindikana kupakia huduma."));
        }
        if (active) {
          setServices(result);
          setError("");
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Imeshindikana kupakia huduma.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadServices();
    return () => {
      active = false;
    };
  }, []);

  return { services, loading, error };
}
