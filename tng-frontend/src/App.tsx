import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Analytics } from "./pages/Analytics";
import { AddEmployee } from "./pages/AddEmployee";
import { AttendanceSummary } from "./pages/AttendanceSummary";
import { AuditTrail } from "./pages/AuditTrail";
import { Dashboard } from "./pages/Dashboard";
import { EmployeeSelection } from "./pages/EmployeeSelection";
import { Login } from "./pages/Login";
import { TapInterface } from "./pages/TapInterface";
import { SplashScreen } from "./components/SplashScreen";

type Route =
  | "login"
  | "dashboard"
  | "employees"
  | "add-employee"
  | "tap"
  | "attendance"
  | "analytics"
  | "audit";

// Wrapper component to force remount on user change
function RouterWithKey() {
  const { user } = useAuth();
  return <Router key={user ? `user-${user.id}` : 'no-user'} />;
}

function Router() {
  const { user, loading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<Route>("login");

  useEffect(() => {
    if (!loading) {
      // Automatically redirect to dashboard when user logs in
      if (user) {
        // Only set dashboard if not already on a route
        setCurrentRoute((prevRoute) => {
          if (prevRoute === "login") {
            return "dashboard";
          }
          return prevRoute;
        });
      } else {
        // Immediately reset to login when user logs out
        setCurrentRoute("login");
      }
    }
  }, [user, loading]);

  useEffect(() => {
    const handleNavigation = ((event: CustomEvent) => {
      setCurrentRoute(event.detail as Route);
    }) as EventListener;

    window.addEventListener("navigate", handleNavigation);
    return () => window.removeEventListener("navigate", handleNavigation);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Immediately show login if no user - this check happens on every render
  if (!user) {
    return <Login />;
  }

  switch (currentRoute) {
    case "dashboard":
      return <Dashboard />;
    case "employees":
      return <EmployeeSelection />;
    case "add-employee":
      return <AddEmployee />;
    case "tap":
      return <TapInterface />;
    case "attendance":
      return <AttendanceSummary />;
    case "analytics":
      return <Analytics />;
    case "audit":
      return <AuditTrail />;
    default:
      return <Dashboard />;
  }
}

function App() {
  const [hasShownSplash, setHasShownSplash] = useState(() => {
    // Check if splash has been shown before (stored in localStorage)
    return localStorage.getItem('splashShown') === 'true';
  });

  return (
    <AuthProvider>
      {!hasShownSplash ? (
        <SplashScreenWithAuth
          onComplete={() => {
            localStorage.setItem('splashShown', 'true');
            setHasShownSplash(true);
          }}
        />
      ) : (
        <RouterWithKey />
      )}
    </AuthProvider>
  );
}

// Component that shows splash screen while loading authentication
function SplashScreenWithAuth({ onComplete }: { onComplete: () => void }) {
  const { loading } = useAuth();
  const [minDisplayTime, setMinDisplayTime] = useState(true);
  const [shouldFadeOut, setShouldFadeOut] = useState(false);

  useEffect(() => {
    // Ensure splash shows for at least 1.5 seconds for smooth animation
    const timer = setTimeout(() => {
      setMinDisplayTime(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Hide splash when loading is complete and minimum display time has passed
    if (!loading && !minDisplayTime) {
      // Trigger fade out
      setShouldFadeOut(true);
      // Complete after fade animation
      const fadeTimer = setTimeout(() => {
        onComplete();
      }, 300);
      return () => clearTimeout(fadeTimer);
    }
  }, [loading, minDisplayTime, onComplete]);

  return <SplashScreen fadeOut={shouldFadeOut} />;
}

export default App;
