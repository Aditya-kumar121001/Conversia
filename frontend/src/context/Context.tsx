"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { BACKEND_URL } from "../lib/utils";
import type { ProfileData } from "../types";

/* ---------- Types ---------- */

export type Domain = {
  domainId: string;
  domainName: string;
  domainUrl?: string;
  domainImageUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type PlanUsage = {
  domainCount: number;
  workflowCount: number;
  kbFileCount: number;
  conversationCount: number;
};

export type PlanLimits = {
  maxDomains: number;
  maxConversationsPerMonth: number;
  maxKBFiles: number;
  maxWorkflows: number;
  voiceAgentsEnabled: boolean;
  workflowEmailEnabled: boolean;
  chatHistoryDays: number;
};


export type User = {
  name: string;
  email: string;
  isPremium: boolean;
  plan: "free" | "premium";
  credits: number;
  profile?: ProfileData;
};

type TenantContextType = {
  domains: Domain[];
  user: User | null;
  loading: boolean;
  planLimits: PlanLimits | null;
  planUsage: PlanUsage | null;
  updateDomainOptimistic: (domain: Domain) => void;
  refreshUser: () => Promise<void>;
};

/* ---------- Context ---------- */

const TenantContext = createContext<TenantContextType | null>(null);

const STORAGE_KEY = "saas_domains";

const normalizeDomains = (items: any[]): Domain[] =>
  items.map((d: any) => ({
    ...d,
    // Ensure domainId is always present even if API returns _id
    domainId: String(d.domainId ?? d._id ?? d.id ?? ""),
    domainName: d.domainName ?? d.domain ?? d.name ?? "",
    domainUrl: d.domainUrl ?? "",
    domainImageUrl: d.domainImageUrl ?? "",
    createdAt: d.createdAt ?? new Date().toISOString(),
    updatedAt: d.updatedAt ?? d.createdAt ?? new Date().toISOString(),
  }));

/* ---------- Provider ---------- */

export function Context({ children }: { children: React.ReactNode }) {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [planLimits, setPlanLimits] = useState<PlanLimits | null>(null);
  const [planUsage, setPlanUsage] = useState<PlanUsage | null>(null);

  /* ---------- Load from cache ---------- */
  useEffect(() => {
    const cachedDomains = localStorage.getItem(STORAGE_KEY);

    if (cachedDomains) {
      setDomains(normalizeDomains(JSON.parse(cachedDomains)));
    }
  }, []);

  /* ---------- Fetch plan status ---------- */
  const fetchPlanStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${BACKEND_URL}/plan/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      if (data.limits) setPlanLimits(data.limits);
      if (data.usage) setPlanUsage(data.usage);
    } catch (err) {
      console.error("Failed to fetch plan status:", err);
    }
  }, []);

  /* ---------- Fetch from backend ---------- */
  const fetchDomains = useCallback(async () => {
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
      const normalizedDomains = normalizeDomains(safeDomains);

      setDomains(normalizedDomains);
      setUser(
        user
          ? {
              name: user.name ?? "",
              email: user.email ?? "",
              isPremium: Boolean(user.isPremium),
              plan: user.plan || "free",
              credits: user.credits ?? 0,
              profile: user.profile || {},
            }
          : null
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedDomains));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
    fetchPlanStatus();
  }, [fetchDomains, fetchPlanStatus]);

  /* ---------- Refresh user (call after upgrade) ---------- */
  const refreshUser = useCallback(async () => {
    await fetchDomains();
    await fetchPlanStatus();
  }, [fetchDomains, fetchPlanStatus]);

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
        planLimits,
        planUsage,
        updateDomainOptimistic,
        refreshUser,
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
