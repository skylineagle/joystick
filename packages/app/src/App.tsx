import { LoginForm } from "@/components/auth/login-form";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { pb } from "@/lib/pocketbase";
import { ParamsPage } from "@/pages/params/params-page";
import { StreamView } from "@/pages/stream-view/stream-view";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { useEffect, useState } from "react";
import { CommittedRoiProperties, RoiProvider } from "react-roi";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./layout";
import { ActionsPage } from "./pages/actions/actions-page";
import { DeviceSelector } from "./pages/device-selector/device-selector";
import { StatusPage } from "./pages/status/status-page";
import { TerminalPage } from "./pages/terminal/terminal-page";
import { DashboardPage } from "@/pages/dashboard/dashboard";

const queryClient = new QueryClient();

function App() {
  const [roiData, setRoiData] = useState<CommittedRoiProperties<unknown>[]>([]);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setIsAuthenticated(pb.authStore.isValid);
    }, true);

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <RoiProvider
          initialConfig={{
            commitRoiBoxStrategy: "exact",
            resizeStrategy: "none",
            rois: roiData,
          }}
          onAfterDraw={(roi) => {
            setRoiData((prev) => [...prev, roi]);
          }}
          onAfterMove={(selectedRoiId, roi) => {
            setRoiData((prev) =>
              prev.map((r) => (r.id === selectedRoiId ? { ...r, ...roi } : r))
            );
          }}
          onAfterResize={(selectedRoiId, roi) => {
            setRoiData((prev) =>
              prev.map((r) => (r.id === selectedRoiId ? { ...r, ...roi } : r))
            );
          }}
          onAfterRotate={(selectedRoiId, roi) => {
            setRoiData((prev) =>
              prev.map((r) => (r.id === selectedRoiId ? { ...r, ...roi } : r))
            );
          }}
        >
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<DeviceSelector />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/login"
                element={
                  isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />
                }
              />
              <Route
                path="/:device"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<StreamView />} />
                <Route path="params" element={<ParamsPage />} />
                <Route path="actions" element={<ActionsPage />} />
                <Route path="terminal" element={<TerminalPage />} />
                <Route path="status" element={<StatusPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </RoiProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}

export default App;
