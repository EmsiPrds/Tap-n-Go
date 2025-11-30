import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { database, type User } from "../lib/database";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    database.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = database.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (username: string, password: string) => {
    const { data, error } = await database.auth.signInWithPassword({
      username,
      password,
    });
    if (error) throw error;
    
    // Update user state immediately after successful login
    if (data?.admin) {
      setUser({
        id: data.admin.id,
        username: data.admin.username,
      });
    }
  };

  const signOut = async () => {
    // Clear user state immediately to trigger Router redirect
    setUser(null);
    
    // Then perform the actual logout API call
    const { error } = await database.auth.signOut();
    if (error) {
      // If logout fails, we still want to keep user as null
      // since tokens are cleared anyway
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
