import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "principal" | "teacher" | null;

interface AuthUser {
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isPrincipal: boolean;
  isTeacher: boolean;
}

const FIXED_CREDENTIALS: Record<string, { password: string; role: UserRole }> = {
  "adminkaxif@dps": { password: "adminkaxif@dps", role: "admin" },
  "principal.access@dps.portal": { password: "Principal.access@dps.portal", role: "principal" },
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

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    // Check fixed credentials first (admin, principal)
    const fixedCred = FIXED_CREDENTIALS[trimmedEmail];
    if (fixedCred) {
      if (fixedCred.password !== password) return { success: false, error: "Incorrect password" };
      setUser({ email: trimmedEmail, role: fixedCred.role });
      return { success: true };
    }

    // Check teacher_accounts in database
    try {
      const { data, error: dbError } = await supabase
        .from("teacher_accounts")
        .select("email, password, status, status_notification")
        .eq("email", trimmedEmail)
        .maybeSingle();

      if (dbError || !data) return { success: false, error: "Invalid email address" };
      if (data.password !== password) return { success: false, error: "Incorrect password" };

      // Check account status
      if (data.status === "pending") return { success: false, error: "Your account is pending admin approval. Please wait." };
      if (data.status === "rejected") return { success: false, error: (data as any).status_notification || "Your account has been rejected. Please contact the admin." };
      if (data.status === "paused") return { success: false, error: (data as any).status_notification || "Your account has been paused. Please contact admin for resolution." };
      if (data.status === "removed") return { success: false, error: "Your account has been removed. Please contact admin." };
      if (data.status !== "approved") return { success: false, error: "Account not active." };

      // Store pending notification for display after login
      const notification = (data as any).status_notification;
      if (notification) {
        localStorage.setItem("dps_login_notification", notification);
        // Clear the notification in DB
        supabase.from("teacher_accounts").update({ status_notification: null } as any).eq("email", trimmedEmail).then(() => {});
      }

      setUser({ email: trimmedEmail, role: "teacher" });
      return { success: true };
    } catch {
      return { success: false, error: "Login failed. Please try again." };
    }
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
