import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import logo from "../assets/logo.svg";
import Bg1 from "../assets/Bg1.svg";
import Bg2 from "../assets/Bg2.svg";
import Bg3 from "../assets/Bg3.svg";
import Bg4 from "../assets/Bg4.svg";
import { Cheese } from "../assets/svg";
import {FaLock, FaUserCircle } from "react-icons/fa";  // Importing icons

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("/auth/login", { username, password });
      const token = response.data.token;

      // Save token to localStorage for session persistence
      localStorage.setItem("authToken", token);

      // Redirect to the dashboard after successful login
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err); // Log the error for debugging
      setError("Invalid username or password"); // Show error message to the user
    }
  };

  return (
    <div className="h-screen bg-[#3C417B] overflow-hidden px-36 py-26">
      {/* Background SVGs */}
      <img src={Bg1} alt="Background 1" className="absolute top-0 left-0 w-14 z-0" />
      <img src={Bg2} alt="Background 2" className="absolute bottom-0 left-20 w-10 z-0" />
      <img src={Bg3} alt="Background 3" className="absolute top-10 right-38 w-48 z-0 transform -translate-y-1/2" />
      <img src={Bg4} alt="Background 4" className="absolute bottom-0 left-0 w-20 z-0" />
      <img src={Bg2} alt="Background 5" className="absolute top-30 right-38 w-10 z-0" />

      <div className="w-full h-full">
        <div>
          {/* Header */}
          <div className="relative z-10 h-full flex justify-start">
            <img src={logo} className="h-8 object-contain" alt="Logo" />
          </div>
        </div>

        <div className="h-full flex justify-between">
          {/* Content Layer - Two Columns */}

          {/* Left Side - Welcome Message */}
          <div className="w-full flex flex-col items-start justify-center text-white">
            <img src={logo} className="h-24 object-contain" alt="Logo" />
            <p className="text-lg w-[500px] mb-10">
              Ensures accurate attendance tracking, reduces manual errors, and
              enhances workforce management. With real-time reporting and and
              secure time attendance system designed to streamline employee
              clock-in and clock-out processes.
            </p>
            <h2 className="text-2xl font-bold italic font-poppins">
              Tap In. Work Smart. Go Further!
            </h2>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full flex items-center justify-center rounded-lg ">
            <div className="relative w-full max-w-lg px-20 py-15 bg-gradient-to-br from-gray-400 to-gray-0 rounded-[50px] bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-20 border-2 border-zinc-50">
              <div className="absolute bottom-12 left-[-25px] w-15 z-0 rotate-[115deg]">
                <Cheese />
              </div>
              <div className="absolute top-[-15px] right-15 w-15 z-0 rotate-[200deg]">
                <Cheese />
              </div>
              <h2 className="text-2xl font-bold mb-4 text-center text-[#233354]">WELCOME!</h2>
              {error && (
                <p className="text-red-500 text-center mb-4">{error}</p>
              )}
              <form onSubmit={handleLogin} className="space-y-4 flex flex-col items-center">
                <div className="relative w-full">
                  <FaUserCircle className="absolute top-3 left-3 text-gray-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter Username"
                    className="w-full pl-10 pr-4 py-2 bg-white border-2 border-[#3c417b] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3c417b]"
                    required
                  />
                </div>
                <div className="relative w-full">
                  <FaLock className="absolute top-3 left-3 text-gray-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    className="w-full pl-10 pr-4 py-2 bg-white border-2 border-[#3c417b] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3c417b]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-1/2 bg-[#233354] text-white py-2 rounded-full hover:bg-blue-600 transition duration-300"
                >
                  Login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
