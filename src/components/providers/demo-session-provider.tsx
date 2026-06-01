"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppRole } from "@/lib/types/roles";

type DemoSession = {
  ready: boolean;
  authenticated: boolean;
  role: AppRole;
  displayName: string;
  login: (payload: { role: AppRole; displayName: string }) => void;
  setRole: (role: AppRole) => void;
  logout: () => void;
};

const storageRoleKey = "jahir-demo-role";
const storageUserKey = "jahir-demo-user";
const storageAuthKey = "jahir-demo-auth";

const DemoSessionContext = createContext<DemoSession | null>(null);

export function DemoSessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [role, setRoleState] = useState<AppRole>("admin_principal");
  const [displayName, setDisplayName] = useState("Jahir Alvarez");

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

  const value = useMemo<DemoSession>(
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

  return <DemoSessionContext.Provider value={value}>{children}</DemoSessionContext.Provider>;
}

export function useDemoSession() {
  const context = useContext(DemoSessionContext);

  if (!context) {
    throw new Error("useDemoSession must be used within DemoSessionProvider");
  }

  return context;
}
