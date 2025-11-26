import {
  BarChart3,
  Clock,
  Coffee,
  FileText,
  LogOut as LogOutIcon,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { StatCard } from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "../hooks/useNavigate";
import type { DashboardStats } from "../types";

export function Dashboard() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalPresent: 0,
    lateEmployees: 0,
    onBreak: 0,
    timedOut: 0,
  });
  useEffect(() => {
    setStats({
      totalPresent: 47,
      lateEmployees: 3,
      onBreak: 8,
      timedOut: 12,
    });
  }, []);

  const handleSignOut = async () => {
    await signOut();
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
                size="md"
                fallback={user?.username?.slice(0, 2).toUpperCase() || "HR"}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
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
          <p className="text-gray-600">Here's what's happening today</p>
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
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Avatar size="md" fallback="JD" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        John Doe
                      </p>
                      <p className="text-xs text-gray-500">
                        Tapped in at 09:00 AM
                      </p>
                    </div>
                    <StatusBadge status="present" size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Today's Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Employees</span>
                  <span className="text-sm font-semibold text-gray-900">
                    70
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Present</span>
                  <span className="text-sm font-semibold text-green-600">
                    47
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Absent</span>
                  <span className="text-sm font-semibold text-red-600">11</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Attendance Rate</span>
                  <span className="text-sm font-semibold text-gray-900">
                    87%
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
    </div>
  );
}
