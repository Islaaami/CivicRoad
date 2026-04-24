import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import MapPage from "./pages/MapPage";
import ReportDetailPage from "./pages/ReportDetailPage";
import ReportsPage from "./pages/ReportsPage";
import { AuthProvider } from "./store/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="reports/:reportId" element={<ReportDetailPage />} />
              <Route path="map" element={<MapPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
