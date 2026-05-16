import { useState, useEffect } from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Only run on the client side
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is standard tablet/mobile breakpoint
    };
    
    // Check immediately
    checkMobile();
    
    // Listen for window resizes (e.g., rotating the phone)
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}