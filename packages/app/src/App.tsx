import { LoginForm } from "@/components/auth/login-form";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { ThemeProvider } from "@/components/theme-provider";
import { pb } from "@/lib/pocketbase";
import { DashboardPage } from "@/pages/dashboard/dashboard-page";
import { ParamsPage } from "@/pages/params/params-page";
import { StreamView } from "@/pages/stream-view/stream-view";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { useEffect, useState } from "react";
import { CommittedRoiProperties, RoiProvider } from "react-roi";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { Layout } from "./layout";
import { ActionsPage } from "./pages/actions/actions-page";
import { StatusPage } from "./pages/status/status-page";
import { TerminalPage } from "./pages/terminal/terminal-page";

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
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <BrowserRouter>
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    isAuthenticated ? (
                      <Navigate to="/" replace />
                    ) : (
                      <LoginForm />
                    )
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
            <Toaster position="top-center" richColors />
          </ThemeProvider>
        </RoiProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}

export default App;
