import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Analytics } from "./pages/Analytics";
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
  | "tap"
  | "attendance"
  | "analytics"
  | "audit";

function Router() {
  const { user, loading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<Route>("login");

  useEffect(() => {
    if (!loading) {
      setCurrentRoute(user ? "dashboard" : "login");
    }

    const handleNavigation = ((event: CustomEvent) => {
      setCurrentRoute(event.detail as Route);
    }) as EventListener;

    window.addEventListener("navigate", handleNavigation);
    return () => window.removeEventListener("navigate", handleNavigation);
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return <Login />;

  switch (currentRoute) {
    case "dashboard":
      return <Dashboard />;
    case "employees":
      return <EmployeeSelection />;
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
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      {showSplash ? (
        <SplashScreen
          duration={3000}
          onComplete={() => setShowSplash(false)}
        />
      ) : (
        <Router />
      )}
    </AuthProvider>
  );
}

export default App;
