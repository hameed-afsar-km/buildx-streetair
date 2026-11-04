"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthUser, UserRole } from "@/lib/types";
import { registerAuthTokenProvider } from "@/lib/api/client";
import { auth, fbSignOut, onAuthStateChanged, FirebaseUser } from "@/lib/firebase";
import { getCurrentUser } from "@/lib/api/endpoints";

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: UserRole) => void;
  getIdToken: () => Promise<string | null>;
}

const DEMO_USERS: Record<UserRole, AuthUser> = {
  citizen: {
    uid: "usr_citizen_demo",
    email: "citizen.vandalur@streetair.io",
    display_name: "Rahul Verma (Citizen)",
    role: "citizen",
    org_id: null,
    org_name: null,
    plan: "free",
    created_at: "2026-03-01T10:00:00Z",
  },
  analyst: {
    uid: "usr_analyst_demo",
    email: "priya.analyst@crescent.education",
    display_name: "Dr. Priya Sundaram (Env Analyst)",
    role: "analyst",
    org_id: "org_crescent_institute",
    org_name: "B.S. Abdur Rahman Crescent Institute",
    plan: "professional",
    created_at: "2026-02-14T09:00:00Z",
  },
  org_admin: {
    uid: "usr_orgadmin_demo",
    email: "facilities@crescent.education",
    display_name: "K. R. Ramanathan (Estate Director)",
    role: "org_admin",
    org_id: "org_crescent_institute",
    org_name: "B.S. Abdur Rahman Crescent Institute",
    plan: "enterprise",
    created_at: "2026-01-10T08:00:00Z",
  },
  platform_admin: {
    uid: "usr_admin_demo",
    email: "lead.command@streetair.io",
    display_name: "Platform Chief Engineer",
    role: "platform_admin",
    org_id: null,
    org_name: "STREETAIR Global Operations",
    plan: "enterprise",
    created_at: "2025-11-01T00:00:00Z",
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(DEMO_USERS.platform_admin);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Register token getter for the API client
  useEffect(() => {
    registerAuthTokenProvider(async () => {
      if (firebaseUser) {
        try {
          return await firebaseUser.getIdToken();
        } catch {
          return "mock_firebase_id_token";
        }
      }
      return user ? `mock_token_for_${user.uid}` : null;
    });
  }, [firebaseUser, user]);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (fbUsr) => {
      setFirebaseUser(fbUsr);
      if (fbUsr) {
        try {
          const profile = await getCurrentUser();
          setUser(profile);
        } catch {
          // If profile endpoint not ready, synthesize profile from Firebase user
          setUser({
            uid: fbUsr.uid,
            email: fbUsr.email || "user@streetair.io",
            display_name: fbUsr.displayName || "STREETAIR User",
            role: "citizen",
            org_id: null,
            org_name: null,
            plan: "starter",
            created_at: new Date().toISOString(),
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      // Simulate/Authenticate
      if (email.includes("admin")) {
        setUser(DEMO_USERS.platform_admin);
      } else if (email.includes("crescent") || email.includes("org")) {
        setUser(DEMO_USERS.org_admin);
      } else if (email.includes("analyst")) {
        setUser(DEMO_USERS.analyst);
      } else {
        setUser(DEMO_USERS.citizen);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    try {
      setUser({
        uid: `usr_${Date.now()}`,
        email,
        display_name: name,
        role: "citizen",
        org_id: null,
        org_name: null,
        plan: "starter",
        created_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (auth) {
        await fbSignOut(auth).catch(() => {});
      }
      setUser(null);
      setFirebaseUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoRole = (targetRole: UserRole) => {
    setUser(DEMO_USERS[targetRole]);
  };

  const getIdToken = async (): Promise<string | null> => {
    if (firebaseUser) {
      try {
        return await firebaseUser.getIdToken();
      } catch {
        return null;
      }
    }
    return user ? `mock_token_${user.uid}` : null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        isAuthenticated: !!user,
        role: user?.role || "citizen",
        login,
        register,
        logout,
        switchDemoRole,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

