"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppRole } from "@/lib/types/roles";

type SessionState = {
  ready: boolean;
  authenticated: boolean;
  role: AppRole;
  displayName: string;
  login: (payload: { role: AppRole; displayName: string }) => void;
  setRole: (role: AppRole) => void;
  logout: () => void;
};

const storageRoleKey = "jahir-session-role";
const storageUserKey = "jahir-session-user";
const storageAuthKey = "jahir-session-auth";

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRoleState] = useState<AppRole>("admin_principal");
  const [displayName, setDisplayName] = useState("Usuario");

  useEffect(() => {
    const storedRole = window.localStorage.getItem(storageRoleKey) as AppRole | null;
    const storedUser = window.localStorage.getItem(storageUserKey);
    const storedAuth = window.localStorage.getItem(storageAuthKey);

    if (storedRole) {
      setRoleState(storedRole);
    }

    if (storedUser) {
      setDisplayName(storedUser);
    }

    setAuthenticated(storedAuth === "true");
    setReady(true);
  }, []);

  const value = useMemo<SessionState>(
    () => ({
      ready,
      authenticated,
      role,
      displayName,
      login: ({ role: nextRole, displayName: nextDisplayName }) => {
        setAuthenticated(true);
        setRoleState(nextRole);
        setDisplayName(nextDisplayName);
        window.localStorage.setItem(storageAuthKey, "true");
        window.localStorage.setItem(storageRoleKey, nextRole);
        window.localStorage.setItem(storageUserKey, nextDisplayName);
      },
      setRole: (nextRole: AppRole) => {
        setRoleState(nextRole);
        window.localStorage.setItem(storageRoleKey, nextRole);
      },
      logout: () => {
        setAuthenticated(false);
        window.localStorage.removeItem(storageAuthKey);
        window.localStorage.removeItem(storageUserKey);
        window.localStorage.removeItem(storageRoleKey);
      }
    }),
    [authenticated, displayName, ready, role]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return context;
}
