import Avatar from "avatox";
import {
  BarChart3,
  Clock,
  Coffee,
  FileText,
  LogOut as LogOutIcon,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { StatCard } from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "../hooks/useNavigate";
import api from "../services/api";
import type { DashboardStats } from "../types";

export function Dashboard() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPresent: 0,
    lateEmployees: 0,
    onBreak: 0,
    timedOut: 0,
  });
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    present: 0,
    absent: 0,
    attendanceRate: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, summaryRes, activityRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/summary"),
          api.get("/dashboard/recent-activity?limit=5"),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
        if (summaryRes.data.success) {
          setSummary(summaryRes.data.data);
        }
        if (activityRes.data.success) {
          setRecentActivity(activityRes.data.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleSignOutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      // User state will be cleared, Router will automatically redirect to login
      setShowLogoutModal(false);
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleCancelSignOut = () => {
    setShowLogoutModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TAP-N-GO</h1>
                <p className="text-xs text-gray-500">HR Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Avatar
                key={user?.id}
                name={user?.username || "Unknown"}
                size="md"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOutClick}
                icon={<LogOutIcon className="w-4 h-4" />}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h2>
          <p className="text-gray-600">
            Here&apos;s what&apos;s happening today
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Attendance"
            value={stats.totalPresent}
            icon={<Users className="w-6 h-6" />}
            color="blue"
            trend={{ value: "8.2%", isPositive: true }}
          />
          <StatCard
            title="Late Employees"
            value={stats.lateEmployees}
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
            trend={{ value: "2.1%", isPositive: false }}
          />
          <StatCard
            title="On Break"
            value={stats.onBreak}
            icon={<Coffee className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Timed Out"
            value={stats.timedOut}
            icon={<LogOutIcon className="w-6 h-6" />}
            color="gray"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<UserPlus className="w-5 h-5" />}
                  onClick={() => navigate("/employees")}
                  className="w-full justify-start"
                >
                  Start Attendance
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<Plus className="w-5 h-5" />}
                  onClick={() => navigate("/add-employee")}
                  className="w-full justify-start"
                >
                  Add Employee
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<FileText className="w-5 h-5" />}
                  onClick={() => navigate("/attendance")}
                  className="w-full justify-start"
                >
                  View Records
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<BarChart3 className="w-5 h-5" />}
                  onClick={() => navigate("/analytics")}
                  className="w-full justify-start"
                >
                  Analytics
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  icon={<FileText className="w-5 h-5" />}
                  onClick={() => navigate("/audit")}
                  className="w-full justify-start"
                >
                  Audit Trail
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading...
                  </div>
                ) : recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Avatar
                        key={activity.employee?.id}
                        name={activity.employee?.name || "Unknown"}
                        size="lg"
                        className="bg-black"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.employee?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Tapped in at{" "}
                          {activity.time_in
                            ? new Date(activity.time_in).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "N/A"}
                        </p>
                      </div>
                      <StatusBadge
                        status={activity.status || "present"}
                        size="sm"
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Today&apos;s Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Employees</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {loading ? "-" : summary.totalEmployees}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Present</span>
                  <span className="text-sm font-semibold text-green-600">
                    {loading ? "-" : summary.present}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Absent</span>
                  <span className="text-sm font-semibold text-red-600">
                    {loading ? "-" : summary.absent}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Attendance Rate</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {loading ? "-" : `${summary.attendanceRate}%`}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-blue-100 mb-4">
                View our guide on managing employee attendance effectively
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                View Guide
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Sign Out Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={handleCancelSignOut}
        size="sm"
        title="Confirm Sign Out"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to sign out? You&apos;ll need to log in again
            to access the dashboard.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={handleCancelSignOut}
              disabled={isSigningOut}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmSignOut}
              loading={isSigningOut}
              icon={<LogOutIcon className="w-4 h-4" />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
