import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

export type UserRole = "admin" | "teacher" | null;

interface AuthUser {
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAdmin: boolean;
  isTeacher: boolean;
}

const CREDENTIALS: Record<string, { password: string; role: UserRole }> = {
  "adminkaxif@dps": { password: "adminkaxif@dps", role: "admin" },
  "tutorimrantareen@dps": { password: "tutorimrantareen@dps", role: "teacher" },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem("dps_user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem("dps_user", JSON.stringify(user));
    else localStorage.removeItem("dps_user");
  }, [user]);

  const login = useCallback((email: string, password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    const cred = CREDENTIALS[trimmedEmail];
    if (!cred) return { success: false, error: "Invalid email address" };
    if (cred.password !== password) return { success: false, error: "Incorrect password" };
    setUser({ email: trimmedEmail, role: cred.role });
    return { success: true };
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin: user?.role === "admin",
        isTeacher: user?.role === "teacher",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
