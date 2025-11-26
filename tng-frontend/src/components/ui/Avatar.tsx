import { User } from "lucide-react";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  fallback?: string;
}

export function Avatar({ src, alt, size = "md", fallback }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
    "2xl": "w-24 h-24 text-2xl",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
    "2xl": "w-12 h-12",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || "Avatar"}
        className={`${sizes[size]} rounded-full object-cover border-2 border-gray-200`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold border-2 border-gray-200`}
    >
      {fallback ? (
        <span>{fallback.slice(0, 2).toUpperCase()}</span>
      ) : (
        <User className={iconSizes[size]} />
      )}
    </div>
  );
}
