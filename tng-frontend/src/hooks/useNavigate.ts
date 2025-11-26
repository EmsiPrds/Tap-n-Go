import { useCallback } from "react";

export const useNavigate = () => {
  return useCallback((path: string) => {
    const route = path.split("/")[1] || "dashboard";
    const event = new CustomEvent("navigate", { detail: route });
    window.dispatchEvent(event);
  }, []);
};
