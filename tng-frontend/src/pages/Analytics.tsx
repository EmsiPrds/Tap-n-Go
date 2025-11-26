import { ArrowLeft, Calendar, Clock, TrendingUp, Users } from "lucide-react";
import { Button } from "../components/ui/Button";
import { StatCard } from "../components/ui/StatCard";
import { useNavigate } from "../hooks/useNavigate";

export function Analytics() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => navigate("/dashboard")}
              >
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Attendance Analytics
          </h2>
          <p className="text-gray-600">Track and analyze attendance patterns</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Average Attendance"
            value="87.5%"
            icon={<TrendingUp className="w-6 h-6" />}
            color="blue"
            trend={{ value: "3.2%", isPositive: true }}
          />
          <StatCard
            title="Total Employees"
            value="70"
            icon={<Users className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Avg. Work Hours"
            value="8.2h"
            icon={<Clock className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Days This Month"
            value="22"
            icon={<Calendar className="w-6 h-6" />}
            color="gray"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Weekly Attendance Trend
            </h3>
            <div className="h-64 flex items-end justify-between gap-4">
              {[85, 92, 78, 88, 95, 90, 87].map((value, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-xs text-gray-600">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Department Breakdown
            </h3>
            <div className="space-y-4">
              {[
                {
                  name: "Engineering",
                  present: 25,
                  total: 30,
                  color: "bg-blue-500",
                },
                {
                  name: "Sales",
                  present: 12,
                  total: 15,
                  color: "bg-green-500",
                },
                {
                  name: "Marketing",
                  present: 8,
                  total: 10,
                  color: "bg-purple-500",
                },
                { name: "HR", present: 2, total: 3, color: "bg-yellow-500" },
              ].map((dept) => (
                <div key={dept.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {dept.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {dept.present}/{dept.total}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${dept.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${(dept.present / dept.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">1,245</p>
              <p className="text-sm text-gray-600">Total Present</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">87</p>
              <p className="text-sm text-gray-600">Total Late</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-3xl font-bold text-red-600">45</p>
              <p className="text-sm text-gray-600">Total Absent</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">8.2</p>
              <p className="text-sm text-gray-600">Avg. Hours/Day</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
