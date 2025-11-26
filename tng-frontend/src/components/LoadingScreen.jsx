import logo from '../assets/logo.svg';

function LoadingScreen({ message = 'Loading...' }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#3C417B]">
            <div className="text-center">
                {/* Logo */}
                <div className="mb-8 animate-pulse">
                    <img
                        src={logo}
                        alt="Tap N Go Logo"
                        className="h-24 w-auto object-contain mx-auto drop-shadow-lg"
                    />
                </div>

                {/* Loading spinner */}
                <div className="flex items-center justify-center space-x-2 mb-4">
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>

                {/* Loading message */}
                <p className="text-white text-sm font-medium">{message}</p>
            </div>
        </div>
    );
}

export default LoadingScreen;

