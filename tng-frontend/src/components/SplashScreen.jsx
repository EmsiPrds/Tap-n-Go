import { useEffect, useState } from 'react';
import logo from '../assets/logo.svg';

function SplashScreen({ onComplete, duration = 2000 }) {
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
            className={`fixed inset-0 z-50 flex items-center justify-center bg-[#3C417B] transition-opacity duration-300 ${
                fadeOut ? 'opacity-0' : 'opacity-100'
            }`}
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
                {/* Logo with animation */}
                <div className="mb-8 animate-pulse">
                    <img
                        src={logo}
                        alt="Tap N Go Logo"
                        className="h-32 w-auto object-contain drop-shadow-2xl"
                    />
                </div>

                {/* Loading spinner */}
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>

                {/* App name/tagline */}
                <p className="mt-6 text-white text-lg font-medium italic">
                    Tap In. Work Smart. Go Further!
                </p>
            </div>
        </div>
    );
}

export default SplashScreen;

