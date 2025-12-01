import api from "../services/api";

export interface User {
  id: string;
  username: string;
  lastLogin?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    admin: {
      id: string;
      username: string;
    };
  };
}

/**
 * Get current session/user
 */
async function getSession(): Promise<{
  data: { session: { user: User } | null };
}> {
  try {
    const token = localStorage.getItem("authToken");
    if (!token) {
      return { data: { session: null } };
    }

    const response = await api.get("/auth/verify");
    if (response.data.success) {
      return {
        data: {
          session: {
            user: {
              id: response.data.data.admin.id,
              username: response.data.data.admin.username,
            },
          },
        },
      };
    }
    return { data: { session: null } };
  } catch (error: any) {
    // Silently handle 401 errors - they're expected when there's no valid session
    if (error.response?.status === 401) {
      // Clear invalid tokens
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      return { data: { session: null } };
    }
    // Only log unexpected errors
    if (error.response?.status !== 401) {
      console.error("Error getting session:", error);
    }
    return { data: { session: null } };
  }
}

/**
 * Database client for MongoDB/Express backend
 * Provides authentication methods similar to Supabase client
 */
export const database = {
  auth: {
    /**
     * Get current session/user
     */
    getSession,

    /**
     * Sign in with username and password
     */
    async signInWithPassword(credentials: {
      username: string;
      password: string;
    }): Promise<
      { data: AuthResponse["data"]; error: null } | { data: null; error: Error }
    > {
      try {
        const response = await api.post<AuthResponse>("/auth/login", {
          username: credentials.username,
          password: credentials.password,
        });

        if (response.data.success) {
          // Store tokens in localStorage
          localStorage.setItem("authToken", response.data.data.accessToken);
          localStorage.setItem("refreshToken", response.data.data.refreshToken);

          return {
            data: response.data.data,
            error: null,
          };
        }

        return {
          data: null,
          error: new Error(response.data.message || "Login failed"),
        };
      } catch (error: any) {
        return {
          data: null,
          error: new Error(
            error.response?.data?.message || "An error occurred during login"
          ),
        };
      }
    },

    /**
     * Sign out
     */
    async signOut(): Promise<{ error: null } | { error: Error }> {
      try {
        await api.post("/auth/logout");
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        return { error: null };
      } catch (error: any) {
        // Clear tokens even if logout fails
        localStorage.removeItem("authToken");
        localStorage.removeItem("refreshToken");
        return {
          error: new Error(
            error.response?.data?.message || "An error occurred during logout"
          ),
        };
      }
    },

    /**
     * Listen to auth state changes
     * Note: This is a simplified version. For real-time updates, you'd need WebSocket or polling
     */
    onAuthStateChange(
      callback: (event: string, session: { user: User } | null) => void
    ) {
      // Check session on mount
      getSession().then(({ data: { session } }) => {
        callback("INITIAL_SESSION", session);
      });

      // Return a subscription object (simplified)
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              // Cleanup if needed
            },
          },
        },
      };
    },
  },
};
