import { useCallback } from "react";

export const useNavigate = () => {
  return useCallback((path: string) => {
    const route = path.split("/")[1] || "dashboard";
    
    // Extract parameters from path (e.g., /tap/123 -> route: "tap", param: "123")
    const parts = path.split("/").filter(p => p);
    if (parts.length > 1) {
      // Store route parameter in sessionStorage
      const param = parts[1];
      sessionStorage.setItem(`routeParam_${route}`, param);
    }
    
    const event = new CustomEvent("navigate", { detail: route });
    window.dispatchEvent(event);
  }, []);
};
