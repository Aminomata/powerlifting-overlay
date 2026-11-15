import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminPage } from "./pages/AdminPage";
import { OverlayPage } from "./pages/OverlayPage";
import { tauriService } from "./services/tauriService";

export default function App(): React.JSX.Element {
  const isTauri = tauriService.isTauriRuntime();

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={isTauri ? <AdminPage /> : <Navigate to="/overlay" replace />} />
        <Route path="/admin" element={<Navigate to="/" replace />} />
        <Route path="/overlay" element={<OverlayPage />} />
      </Routes>
    </HashRouter>
  );
}
