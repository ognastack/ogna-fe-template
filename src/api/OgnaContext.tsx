"use client";

import { createContext, useContext } from "react";

import { OgnaClient, Session } from "@/api/OgnaClient";

export const OgnaContext = createContext<{
  client: OgnaClient;
  session: Session | null;
  setSession: (s: Session | null) => void;
} | null>(null);

export const useAuth = () => {
  const ctx = useContext(OgnaContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
