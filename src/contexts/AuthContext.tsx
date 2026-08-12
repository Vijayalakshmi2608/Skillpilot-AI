import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "@/lib/api";

interface User {
  id: number;
  fullName: string;
  email: string;
  role: string;
  phone?: string;
  stream?: string;
  city?: string;
  school?: string;
  boardScore?: string;
  studentClass?: string;
  createdAt?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    stream?: string;
    city?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState(!!getToken());

  const isAuthenticated = !!user && !!token;

  async function refreshProfile() {
    if (!getToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.get<{ success: boolean; data: User }>("/auth/me");
      setUser(data.data);
    } catch {
      setToken(null);
      setTokenState(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(email: string, password: string) {
    const data = await api.post<{ success: boolean; data: { accessToken: string; refreshToken: string; user: User } }>("/auth/login", {
      email,
      password,
    });
    setToken(data.data.accessToken);
    setTokenState(data.data.accessToken);
    await refreshProfile();
  }

  async function register(payload: {
    fullName: string;
    email: string;
    password: string;
    stream?: string;
    city?: string;
  }) {
    const data = await api.post<{ success: boolean; data: { accessToken: string; refreshToken: string; user: User } }>("/auth/register", payload);
    setToken(data.data.accessToken);
    setTokenState(data.data.accessToken);
    await refreshProfile();
  }

  function logout() {
    setToken(null);
    setTokenState(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isAuthenticated, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
