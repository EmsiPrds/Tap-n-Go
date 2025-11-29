import { useEffect, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import animationFile from '../assets/Tap-n-Go.lottie?url';

interface SplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

export function SplashScreen({ onComplete, duration = 2500 }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out animation before hiding
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 300); // Start fade 300ms before completion

    // Hide splash screen after duration
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ pointerEvents: fadeOut ? 'none' : 'auto' }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-14 opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="white" opacity="0.1" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-20 opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="40" fill="white" opacity="0.1" />
          </svg>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Lottie Animation */}
        <div className="mb-6">
          <DotLottieReact 
            src={animationFile} 
            loop 
            autoplay 
            className="w-80 h-80" 
          />
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;

