import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Coffee,
  LogIn,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { useNavigate } from "../hooks/useNavigate";
import type { Employee, TapAction } from "../types";

const mockEmployee: Employee = {
  id: "1",
  employee_id: "EMP001",
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@company.com",
  department: "Engineering",
  position: "Senior Developer",
  shift_start: "09:00",
  shift_end: "18:00",
  status: "active",
  created_at: new Date().toISOString(),
};

export function TapInterface() {
  const navigate = useNavigate();
  const [employee] = useState<Employee>(mockEmployee);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAction, setLastAction] = useState<TapAction | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<
    "not-started" | "working" | "on-break" | "completed"
  >("not-started");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTap = async (action: TapAction) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLastAction(action);
    setShowSuccess(true);
    setLoading(false);

    if (action === "time-in") setCurrentStatus("working");
    if (action === "break-out") setCurrentStatus("on-break");
    if (action === "break-in") setCurrentStatus("working");
    if (action === "time-out") setCurrentStatus("completed");

    setTimeout(() => {
      setShowSuccess(false);
      if (action === "time-out") {
        navigate("/employees");
      }
    }, 2000);
  };

  const getActionLabel = (action: TapAction) => {
    const labels = {
      "time-in": "Time In",
      "break-out": "Break Out",
      "break-in": "Break In",
      "time-out": "Time Out",
    };
    return labels[action];
  };

  const getAvailableActions = (): TapAction[] => {
    switch (currentStatus) {
      case "not-started":
        return ["time-in"];
      case "working":
        return ["break-out", "time-out"];
      case "on-break":
        return ["break-in"];
      case "completed":
        return [];
      default:
        return [];
    }
  };

  const availableActions = getAvailableActions();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Button
              variant="ghost"
              size="sm"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => navigate("/employees")}
            >
              Back to Selection
            </Button>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {currentTime.toLocaleTimeString()}
              </p>
              <p className="text-xs text-gray-500">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="text-center mb-6">
                <Avatar
                  size="2xl"
                  fallback={`${employee.first_name[0]}${employee.last_name[0]}`}
                  src={employee.avatar_url}
                />
              </div>
              <div className="text-center space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {employee.first_name} {employee.last_name}
                  </h2>
                  <p className="text-gray-500">{employee.employee_id}</p>
                </div>
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Department</span>
                    <span className="text-sm font-medium text-gray-900">
                      {employee.department}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Position</span>
                    <span className="text-sm font-medium text-gray-900">
                      {employee.position}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Shift</span>
                    <span className="text-sm font-medium text-gray-900">
                      {employee.shift_start} - {employee.shift_end}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Today's Log
              </h3>
              <div className="space-y-3">
                {currentStatus !== "not-started" && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <LogIn className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Time In
                      </p>
                      <p className="text-xs text-gray-500">09:00 AM</p>
                    </div>
                  </div>
                )}
                {(currentStatus === "on-break" ||
                  currentStatus === "completed") && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Coffee className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Break Out
                      </p>
                      <p className="text-xs text-gray-500">12:00 PM</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Live Camera
                </h3>
                <Camera className="w-5 h-5 text-gray-400" />
              </div>
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                <Camera className="w-16 h-16 text-white/50" />
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    LIVE
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Camera preview for verification
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tap Action
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {availableActions.includes("time-in") && (
                  <Button
                    variant="success"
                    size="xl"
                    icon={<LogIn className="w-6 h-6" />}
                    onClick={() => handleTap("time-in")}
                    loading={loading && lastAction === "time-in"}
                    className="col-span-2 py-8"
                  >
                    Time In
                  </Button>
                )}
                {availableActions.includes("break-out") && (
                  <Button
                    variant="primary"
                    size="xl"
                    icon={<Coffee className="w-6 h-6" />}
                    onClick={() => handleTap("break-out")}
                    loading={loading && lastAction === "break-out"}
                    className="py-6"
                  >
                    Break Out
                  </Button>
                )}
                {availableActions.includes("break-in") && (
                  <Button
                    variant="success"
                    size="xl"
                    icon={<Coffee className="w-6 h-6" />}
                    onClick={() => handleTap("break-in")}
                    loading={loading && lastAction === "break-in"}
                    className="col-span-2 py-8"
                  >
                    Break In
                  </Button>
                )}
                {availableActions.includes("time-out") && (
                  <Button
                    variant="danger"
                    size="xl"
                    icon={<LogOut className="w-6 h-6" />}
                    onClick={() => handleTap("time-out")}
                    loading={loading && lastAction === "time-out"}
                    className="py-6"
                  >
                    Time Out
                  </Button>
                )}
              </div>
              {availableActions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>All actions completed for today</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Modal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        size="sm"
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
          <p className="text-gray-600">
            {lastAction && getActionLabel(lastAction)} recorded at{" "}
            {currentTime.toLocaleTimeString()}
          </p>
        </div>
      </Modal>
    </div>
  );
}
