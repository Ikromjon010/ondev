import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  activeTier: string;
  profile: { full_name: string; phone: string | null; avatar_url: string | null } | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  activeTier: "free",
  profile: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTier, setActiveTier] = useState("free");
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("full_name, phone, avatar_url, is_blocked, active_tier")
              .eq("user_id", session.user.id)
              .single();

            if (profileData?.is_blocked) {
              toast.error("Sizning hisobingiz bloklangan. Administrator bilan bog'laning.");
              await supabase.auth.signOut();
              return;
            }

            setProfile(profileData ? { full_name: profileData.full_name, phone: profileData.phone, avatar_url: profileData.avatar_url } : null);
            setActiveTier(profileData?.active_tier || "free");

            const { data: roleData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id);
            setIsAdmin(roleData?.some((r) => r.role === "admin") ?? false);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setActiveTier("free");
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, activeTier, profile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
