import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AdminLayout } from "./layouts/AdminLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UiGuide from "./pages/UiGuide";
import Dashboard from "./pages/admin/Dashboard";
import Generos from "./pages/usuarios/Generos";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Redirect from Root to Dashboard (which will trigger ProtectedRoute logic if unauthorized) */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Secure login screen */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Section routes wrapped under ProtectedRoute and AdminLayout */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="pacientes" element={<Generos />} />
              {/* Using Generos as placeholders for other sections until pages are built */}
              <Route path="citas" element={<Generos />} />
              <Route path="historial" element={<Generos />} />
              <Route path="inventario" element={<Generos />} />
              <Route path="facturacion" element={<Generos />} />
              <Route path="ui-guide" element={<UiGuide />} />
            </Route>
          </Route>

          {/* Fallback wildcard redirect */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;