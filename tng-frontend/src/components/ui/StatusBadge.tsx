interface StatusBadgeProps {
  status: "present" | "late" | "absent" | "on-break" | "active" | "inactive";
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const statusConfig = {
    present: {
      label: "Present",
      className: "bg-green-100 text-green-700 border-green-200",
    },
    late: {
      label: "Late",
      className: "bg-yellow-100 text-yellow-700 border-yellow-200",
    },
    absent: {
      label: "Absent",
      className: "bg-red-100 text-red-700 border-red-200",
    },
    "on-break": {
      label: "On Break",
      className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    active: {
      label: "Active",
      className: "bg-green-100 text-green-700 border-green-200",
    },
    inactive: {
      label: "Inactive",
      className: "bg-gray-100 text-gray-700 border-gray-200",
    },
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.className} ${sizeClasses[size]}`}
    >
      {config.label}
    </span>
  );
}
