import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Login } from "./pages/Login"
import { AppDashboard } from "./pages/AppDashboard"
import { AdminDashboard } from "./pages/AdminDashboard"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<AppDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
