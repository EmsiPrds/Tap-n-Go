import { useEffect, useState } from "react";
import { FaLock, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Bg1 from "../assets/Bg1.svg";
import Bg2 from "../assets/Bg2.svg";
import Bg3 from "../assets/Bg3.svg";
import Bg4 from "../assets/Bg4.svg";
import logo from "../assets/logo.svg";
import { Cheese } from "../assets/svg";
import LoadingScreen from "../components/LoadingScreen";
import API from "../services/api";

// Constants
const CONTENT = {
  welcomeTitle: "WELCOME!",
  tagline: "Tap In. Work Smart. Go Further!",
  description:
    "Ensures accurate attendance tracking, reduces manual errors, and enhances workforce management. With real-time reporting and secure time attendance system designed to streamline employee clock-in and clock-out processes.",
};

const ERROR_MESSAGES = {
  timeout: "Request timeout. Please check your connection and try again.",
  network: "Cannot connect to server. Please check your connection.",
  default: "An error occurred. Please try again later.",
  loginFailed: "Login failed. Please try again.",
};

// Helper Functions
const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    return error.response.data.errors.map((e) => e.message || e.msg).join(", ");
  }
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return ERROR_MESSAGES.timeout;
  }
  if (error.message === "Network Error") {
    return ERROR_MESSAGES.network;
  }
  return ERROR_MESSAGES.default;
};

const storeTokens = (accessToken, refreshToken) => {
  localStorage.setItem("authToken", accessToken);
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
};

const clearTokens = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
};

// Components
/* eslint-disable react/prop-types */
const FormField = ({
  icon: Icon,
  type,
  name,
  value,
  onChange,
  placeholder,
  disabled,
  autoComplete,
}) => (
  <div className="relative w-full">
    <Icon className="absolute top-3 left-3 text-gray-500 text-sm sm:text-base" />
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base bg-white border-2 border-[#3c417b] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3c417b] disabled:opacity-50 disabled:cursor-not-allowed"
      required
      disabled={disabled}
      autoComplete={autoComplete}
    />
  </div>
);
/* eslint-enable react/prop-types */

const BackgroundDecorations = () => (
  <>
    <img
      src={Bg1}
      alt=""
      className="hidden sm:block absolute top-0 left-0 w-8 sm:w-10 md:w-14 z-0 opacity-60"
      aria-hidden="true"
    />
    <img
      src={Bg2}
      alt=""
      className="hidden sm:block absolute bottom-0 left-4 sm:left-10 md:left-20 w-6 sm:w-8 md:w-10 z-0 opacity-60"
      aria-hidden="true"
    />
    <img
      src={Bg3}
      alt=""
      className="hidden md:block absolute top-10 right-4 md:right-10 lg:right-20 xl:right-24 w-24 md:w-32 lg:w-40 xl:w-48 z-0 transform -translate-y-1/2 opacity-60"
      aria-hidden="true"
    />
    <img
      src={Bg4}
      alt=""
      className="hidden sm:block absolute bottom-0 left-0 w-12 sm:w-16 md:w-20 z-0 opacity-60"
      aria-hidden="true"
    />
    <img
      src={Bg2}
      alt=""
      className="hidden lg:block absolute top-20 lg:top-30 right-4 lg:right-10 xl:right-24 w-6 lg:w-8 xl:w-10 z-0 opacity-60"
      aria-hidden="true"
    />
  </>
);

// eslint-disable-next-line react/prop-types
const ErrorMessage = ({ message }) => (
  <div className="w-full p-2 sm:p-3 mb-2 sm:mb-3 md:mb-4 bg-red-50 border border-red-200 rounded-lg flex-shrink-0">
    <p className="text-red-600 text-xs sm:text-sm text-center break-words">
      {message}
    </p>
  </div>
);

const WelcomeSection = () => (
  <div className="w-full lg:w-1/2 flex flex-col items-start justify-center text-white order-2 lg:order-1 h-full overflow-y-auto">
    <img
      src={logo}
      className="h-12 sm:h-16 md:h-20 lg:h-24 object-contain mb-2 sm:mb-3 md:mb-4 lg:mb-6 flex-shrink-0"
      alt="Logo"
    />
    <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl w-full max-w-lg mb-3 sm:mb-4 md:mb-6 lg:mb-8 leading-relaxed flex-shrink-0">
      {CONTENT.description}
    </p>
    <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold italic font-poppins flex-shrink-0">
      {CONTENT.tagline}
    </h2>
  </div>
);

/* eslint-disable react/prop-types */
const LoginForm = ({ formData, error, isLoading, onInputChange, onSubmit }) => (
  <div className="w-full lg:w-1/2 flex items-center justify-center rounded-lg order-1 lg:order-2 h-full min-h-0">
    <div className="relative w-full max-w-md sm:max-w-lg px-4 sm:px-6 md:px-10 lg:px-16 xl:px-20 py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12 bg-gradient-to-br from-gray-400 to-gray-0 rounded-2xl sm:rounded-3xl md:rounded-[40px] lg:rounded-[50px] bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-20 border-2 border-zinc-50 max-h-full overflow-y-auto">
      {/* Decorative Cheese elements */}
      <div className="hidden sm:block absolute bottom-6 sm:bottom-8 md:bottom-10 left-[-18px] sm:left-[-22px] md:left-[-25px] w-8 sm:w-10 md:w-12 lg:w-15 z-0 rotate-[115deg] opacity-70">
        <Cheese />
      </div>
      <div className="hidden sm:block absolute top-[-10px] sm:top-[-12px] md:top-[-15px] right-8 sm:right-10 md:right-12 lg:right-15 w-8 sm:w-10 md:w-12 lg:w-15 z-0 rotate-[200deg] opacity-70">
        <Cheese />
      </div>

      <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 md:mb-5 lg:mb-6 text-center text-[#233354] flex-shrink-0">
        {CONTENT.welcomeTitle}
      </h2>

      {error && <ErrorMessage message={error} />}

      <form
        onSubmit={onSubmit}
        className="space-y-2 sm:space-y-3 md:space-y-4 flex flex-col items-center w-full flex-shrink-0"
        noValidate
      >
        <FormField
          icon={FaUserCircle}
          type="text"
          name="username"
          value={formData.username}
          onChange={onInputChange}
          placeholder="Enter Username"
          disabled={isLoading}
          autoComplete="username"
        />
        <FormField
          icon={FaLock}
          type="password"
          name="password"
          value={formData.password}
          onChange={onInputChange}
          placeholder="Enter Password"
          disabled={isLoading}
          autoComplete="current-password"
        />
        <button
          type="submit"
          disabled={isLoading || !formData.username || !formData.password}
          className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2 bg-[#233354] text-white py-2 sm:py-2.5 text-sm sm:text-base rounded-full hover:bg-blue-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  </div>
);
/* eslint-enable react/prop-types */

// Main Component
function AdminLogin() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const response = await API.get("/auth/verify");
        if (response.data.success) {
          navigate("/dashboard", { replace: true });
        }
      } catch {
        clearTokens();
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await API.post("/auth/login", {
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
      });

      if (response.data.success) {
        const { accessToken, refreshToken } = response.data.data;
        storeTokens(accessToken, refreshToken);
        navigate("/dashboard", { replace: true });
      } else {
        setError(response.data.message || ERROR_MESSAGES.loginFailed);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  return (
    <section className="flex justify-center items-center content-center h-screen bg-[#3C417B] overflow-hidden">
      <BackgroundDecorations />

      <div className="w-full h-full flex flex-col">
        {/* Header */}
        <div className="relative z-10 flex justify-start mb-2 sm:mb-3 md:mb-4 flex-shrink-0 px-3 sm:px-4 md:px-8 lg:px-16 xl:px-24">
          <img
            src={logo}
            className="h-5 sm:h-6 md:h-7 lg:h-8 object-contain"
            alt="Logo"
          />
        </div>

        {/* Main Content */}
        <div className="flex justify-center w-full max-w-7xl mx-auto items-center content-center px-3 sm:px-4 md:px-8 lg:px-16 xl:px-24">
          <WelcomeSection />
          <LoginForm
            formData={formData}
            error={error}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </section>
  );
}

export default AdminLogin;
