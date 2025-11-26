import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "../components/LoadingScreen";
import API from "../services/api";

function Dashboard() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [adminInfo, setAdminInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch admin info on mount
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const response = await API.get("/auth/me");
        if (response.data.success) {
          setAdminInfo(response.data.data.admin);
        }
      } catch (error) {
        console.error("Failed to fetch admin info:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminInfo();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const refreshToken = localStorage.getItem("refreshToken");

      // Call logout endpoint to invalidate refresh token on server
      if (refreshToken) {
        try {
          await API.post("/auth/logout", { refreshToken });
        } catch (err) {
          // Continue with logout even if API call fails
          console.error("Logout API error:", err);
        }
      }

      // Clear tokens from localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");

      // Redirect to login
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      // Clear tokens anyway and redirect
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      navigate("/", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-[#233354]">
          Welcome to the Admin Dashboard!
        </h1>

        {adminInfo && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-gray-800">
              Account Information
            </h2>
            <div className="space-y-2 text-gray-600">
              <p>
                <span className="font-medium">Username:</span>{" "}
                {adminInfo.username}
              </p>
              {adminInfo.lastLogin && (
                <p>
                  <span className="font-medium">Last Login:</span>{" "}
                  {new Date(adminInfo.lastLogin).toLocaleString()}
                </p>
              )}
              {adminInfo.createdAt && (
                <p>
                  <span className="font-medium">Account Created:</span>{" "}
                  {new Date(adminInfo.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
