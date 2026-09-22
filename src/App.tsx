import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Login } from "./pages/Login"
import { AppDashboard } from "./pages/AppDashboard"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<AppDashboard />} />
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
