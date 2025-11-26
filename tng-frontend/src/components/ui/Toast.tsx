import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({
  message,
  type = "info",
  isVisible,
  onClose,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const config = {
    success: {
      icon: CheckCircle2,
      color: "bg-green-50 border-green-200 text-green-800",
    },
    error: { icon: XCircle, color: "bg-red-50 border-red-200 text-red-800" },
    warning: {
      icon: AlertCircle,
      color: "bg-yellow-50 border-yellow-200 text-yellow-800",
    },
    info: { icon: Info, color: "bg-blue-50 border-blue-200 text-blue-800" },
  };

  const { icon: Icon, color } = config[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-5 duration-300">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${color} min-w-[320px]`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/50 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
