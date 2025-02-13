import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';  // We'll create this later

function App() {
    const token = localStorage.getItem('authToken');  // Check if token exists

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
                <Route path="/login" element={<AdminLogin />} />
                <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;
