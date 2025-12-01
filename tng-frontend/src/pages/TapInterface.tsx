import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Coffee,
  LogIn,
  LogOut,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Toast } from "../components/ui/Toast";
import { useNavigate } from "../hooks/useNavigate";
import { useToast } from "../hooks/useToast";
import api from "../services/api";
import type { Employee, TapAction } from "../types";

interface TimeLog {
  id: string;
  employee_id: string;
  date: string;
  time_in?: string;
  break_out?: string;
  break_in?: string;
  time_out?: string;
  status: "present" | "late" | "absent" | "on-break";
  notes?: string;
  created_at: string;
}

export function TapInterface() {
  const navigate = useNavigate();
  const { toast, showToast, hideToast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [todayLog, setTodayLog] = useState<TimeLog | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastAction, setLastAction] = useState<TapAction | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [currentStatus, setCurrentStatus] = useState<
    "not-started" | "working" | "on-break" | "completed"
  >("not-started");
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Camera refs and stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Get employee ID from sessionStorage
  const employeeId = sessionStorage.getItem("routeParam_tap");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize camera
  useEffect(() => {
    let videoElement: HTMLVideoElement | null = null;

    const initCamera = async () => {
      try {
        // Check if getUserMedia is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported in this browser");
        }

        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user", // Front-facing camera
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        streamRef.current = stream;

        // Use a timeout to ensure video element is available
        const setupVideo = () => {
          if (videoRef.current) {
            videoElement = videoRef.current;
            videoElement.srcObject = stream;

            // Wait for video to be ready
            const handleLoadedMetadata = () => {
              // Ensure video has valid dimensions
              if (
                videoElement &&
                videoElement.videoWidth > 0 &&
                videoElement.videoHeight > 0
              ) {
                setCameraReady(true);
                setCameraError(null);
              }
            };

            const handleError = () => {
              console.error("Video playback error");
              setCameraError("Video playback failed");
              setCameraReady(false);
            };

            videoElement.addEventListener(
              "loadedmetadata",
              handleLoadedMetadata
            );
            videoElement.addEventListener("error", handleError);

            videoElement.play().catch((err) => {
              console.error("Error playing video:", err);
              setCameraError("Failed to play video stream");
              setCameraReady(false);
            });
          } else {
            // Retry if video element not ready yet
            setTimeout(setupVideo, 100);
          }
        };

        setupVideo();
      } catch (error: any) {
        console.error("Error accessing camera:", error);
        let errorMessage = "Camera access denied or unavailable";
        if (error.name === "NotAllowedError") {
          errorMessage =
            "Camera permission denied. Please allow camera access.";
        } else if (error.name === "NotFoundError") {
          errorMessage = "No camera found on this device";
        } else if (error.name === "NotReadableError") {
          errorMessage = "Camera is already in use by another application";
        }
        setCameraError(errorMessage);
        setCameraReady(false);
        showToast(
          "Camera access is required for attendance verification",
          "warning"
        );
      }
    };

    initCamera();

    // Cleanup: stop camera stream on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [showToast]);

  // Fetch employee data and today's log
  useEffect(() => {
    const fetchData = async () => {
      if (!employeeId) {
        showToast("No employee selected", "error");
        navigate("/employees");
        return;
      }

      try {
        setLoadingData(true);

        // Fetch employee data
        const empResponse = await api.get(`/employees/${employeeId}`);
        if (!empResponse.data.success) {
          throw new Error("Failed to fetch employee data");
        }
        setEmployee(empResponse.data.data);

        // Fetch today's time log
        const logResponse = await api.get(`/tap/${employeeId}/today`);
        if (logResponse.data.success && logResponse.data.data) {
          setTodayLog(logResponse.data.data);
          updateStatusFromLog(logResponse.data.data);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        showToast(
          error.response?.data?.message || "Failed to load employee data",
          "error"
        );
        navigate("/employees");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [employeeId, navigate, showToast]);

  const updateStatusFromLog = (log: TimeLog) => {
    if (log.time_out) {
      setCurrentStatus("completed");
    } else if (log.break_out && !log.break_in) {
      setCurrentStatus("on-break");
    } else if (log.time_in) {
      setCurrentStatus("working");
    } else {
      setCurrentStatus("not-started");
    }
  };

  // Capture photo from video stream
  const capturePhoto = (): string | null => {
    if (!videoRef.current) {
      return null;
    }

    try {
      const video = videoRef.current;

      // Check if video is ready and has valid dimensions
      if (
        !video.videoWidth ||
        !video.videoHeight ||
        video.videoWidth === 0 ||
        video.videoHeight === 0
      ) {
        console.warn("Video not ready for capture");
        return null;
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Convert to base64 JPEG (compressed)
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        return dataUrl;
      }
    } catch (error) {
      console.error("Error capturing photo:", error);
      // Don't show error toast here - allow action to proceed without photo
    }

    return null;
  };

  const handleTap = async (action: TapAction) => {
    if (!employeeId) return;

    // Capture photo before sending request
    const photo = capturePhoto();

    // Warn if camera isn't ready but allow action to proceed
    if (!photo && !cameraError && !cameraReady) {
      showToast("Camera not ready - proceeding without photo", "warning");
    } else if (!photo && cameraError) {
      showToast("Camera unavailable - proceeding without photo", "warning");
    }

    setLoading(true);
    try {
      let endpoint = "";
      switch (action) {
        case "time-in":
          endpoint = `/tap/${employeeId}/time-in`;
          break;
        case "break-out":
          endpoint = `/tap/${employeeId}/break-out`;
          break;
        case "break-in":
          endpoint = `/tap/${employeeId}/break-in`;
          break;
        case "time-out":
          endpoint = `/tap/${employeeId}/time-out`;
          break;
      }

      // Send request with photo verification
      const response = await api.post(endpoint, {
        photoVerification: photo || undefined,
      });
      if (response.data.success) {
        setLastAction(action);
        setShowSuccess(true);
        setTodayLog(response.data.data);

        // Update status
        if (action === "time-in") setCurrentStatus("working");
        if (action === "break-out") setCurrentStatus("on-break");
        if (action === "break-in") setCurrentStatus("working");
        if (action === "time-out") setCurrentStatus("completed");

        showToast(
          response.data.message || "Action recorded successfully",
          "success"
        );

        // Auto-close success modal and redirect on time-out
        if (action === "time-out") {
          setTimeout(() => {
            setShowSuccess(false);
            setTimeout(() => {
              navigate("/employees");
            }, 300);
          }, 2000);
        }
      }
    } catch (error: any) {
      console.error("Error recording action:", error);
      showToast(
        error.response?.data?.message || "Failed to record action",
        "error"
      );
    } finally {
      setLoading(false);
    }
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

  const formatTime = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
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

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading employee data...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Employee not found</p>
          <Button onClick={() => navigate("/employees")}>Go Back</Button>
        </div>
      </div>
    );
  }

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
                  fallback={
                    employee.first_name && employee.last_name
                      ? `${employee.first_name[0]}${employee.last_name[0]}`
                      : employee.employee_id?.slice(0, 2).toUpperCase() || "EM"
                  }
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
                      {employee.department || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Position</span>
                    <span className="text-sm font-medium text-gray-900">
                      {employee.position || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Shift</span>
                    <span className="text-sm font-medium text-gray-900">
                      {employee.shift_start || "N/A"} -{" "}
                      {employee.shift_end || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Today&apos;s Log
              </h3>
              <div className="space-y-3">
                {todayLog?.time_in && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <LogIn className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Time In
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(todayLog.time_in)}
                      </p>
                    </div>
                  </div>
                )}
                {todayLog?.break_out && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Coffee className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Break Out
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(todayLog.break_out)}
                      </p>
                    </div>
                  </div>
                )}
                {todayLog?.break_in && (
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Coffee className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Break In
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(todayLog.break_in)}
                      </p>
                    </div>
                  </div>
                )}
                {todayLog?.time_out && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Time Out
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(todayLog.time_out)}
                      </p>
                    </div>
                  </div>
                )}
                {!todayLog && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No time log entries for today yet.
                  </p>
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
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${
                    cameraReady ? "block" : "hidden"
                  }`}
                />
                {cameraReady && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      LIVE
                    </div>
                  </div>
                )}
                {cameraError ? (
                  <div className="text-center p-8">
                    <Camera className="w-16 h-16 text-white/50 mx-auto mb-2" />
                    <p className="text-white/70 text-sm">{cameraError}</p>
                    <p className="text-white/50 text-xs mt-2">
                      Photos will still be captured if available
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
                    <Camera className="w-16 h-16 text-white/50" />
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center gap-2 bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LOADING
                      </div>
                    </div>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {cameraReady
                  ? "Camera active - photos will be captured automatically"
                  : "Camera preview for verification"}
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

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

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
