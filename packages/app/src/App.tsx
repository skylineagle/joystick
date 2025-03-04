import { LoginForm } from "@/components/auth/login-form";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EasterEggs } from "@/components/easter-eggs";
import { ThemeProvider } from "@/components/theme-provider";
import { pb } from "@/lib/pocketbase";
import { DashboardPage } from "@/pages/dashboard/dashboard-page";
import { ParamsPage } from "@/pages/params/params-page";
import { StreamView } from "@/pages/stream-view/stream-view";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { Layout } from "./layout";
import { ActionsPage } from "./pages/actions/actions-page";
import { TerminalPage } from "./pages/terminal/terminal-page";

const queryClient = new QueryClient();

function App() {
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
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster position="top-center" richColors />

          <EasterEggs />
        </ThemeProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}

export default App;
