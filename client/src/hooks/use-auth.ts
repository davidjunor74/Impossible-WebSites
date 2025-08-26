import { useState, useEffect } from "react";
import type { User } from "@shared/schema";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // TODO: Check for existing session/token
    // For now, simulate loading and no user
    const timer = setTimeout(() => {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return authState;
}
