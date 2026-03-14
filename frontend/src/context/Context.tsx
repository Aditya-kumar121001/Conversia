"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { BACKEND_URL } from "../lib/utils";

/* ---------- Types ---------- */

export type Domain = {
  domainId: string;
  domainName: string;
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  name: string;
  email: string;
  isPremium: boolean;
};

type TenantContextType = {
  domains: Domain[];
  user: User | null;
  loading: boolean;
  updateDomainOptimistic: (domain: Domain) => void;
};

/* ---------- Context ---------- */

const TenantContext = createContext<TenantContextType | null>(null);

const STORAGE_KEY = "saas_domains";

/* ---------- Provider ---------- */

export function Context({ children }: { children: React.ReactNode }) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- Load from cache ---------- */
  useEffect(() => {
    const cachedDomains = localStorage.getItem(STORAGE_KEY);

    if (cachedDomains) {
      setDomains(JSON.parse(cachedDomains));
    }
  }, []);

  /* ---------- Fetch from backend ---------- */
  useEffect(() => {
    async function fetchDomains() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setDomains([]);
          setUser(null);
          localStorage.removeItem(STORAGE_KEY);
          setLoading(false);
          return;
        }

        const res = await fetch(`${BACKEND_URL}/domain/get-domain`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem(STORAGE_KEY);
          setDomains([]);
          setUser(null);
          window.location.reload();
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch domains");
        }

        const { allDomains, user } = await res.json();

        const safeDomains = Array.isArray(allDomains) ? allDomains : [];
        setDomains(safeDomains);
        setUser(
          user
            ? {
                name: user.name ?? "",
                email: user.email ?? "",
                isPremium: Boolean(user.plan),
              }
            : null
        );

        localStorage.setItem(STORAGE_KEY, JSON.stringify(safeDomains));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchDomains();
  }, []);

  /* ---------- Optimistic updates ---------- */
  const updateDomainOptimistic = (updated: Domain) => {
    setDomains((prev) =>
      prev.map((d) => (d.domainId === updated.domainId ? updated : d))
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(
        domains.map((d) => (d.domainId === updated.domainId ? updated : d))
      )
    );
  };

  return (
    <TenantContext.Provider
      value={{
        domains,
        user,
        loading,
        updateDomainOptimistic,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

/* ---------- Hook ---------- */

// eslint-disable-next-line react-refresh/only-export-components
export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error("useTenant must be used inside TenantProvider");
  }
  return ctx;
}
