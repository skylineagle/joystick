import { LoginForm } from "@/components/auth/login-form";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EasterEggs } from "@/components/easter-eggs";
import { ErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { ApiError } from "@/lib/api-client";
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

// Create query and mutation caches with global error handlers

// Create a query client with robust error handling and retry logic
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Configure retry behavior
      retry: (failureCount, error) => {
        // Don't retry for certain errors
        if (error instanceof ApiError) {
          // Don't retry for client errors (except 408 Request Timeout and 429 Too Many Requests)
          if (
            error.status >= 400 &&
            error.status < 500 &&
            error.status !== 408 &&
            error.status !== 429
          ) {
            return false;
          }

          // Don't retry for network errors if we know the network is offline
          if (error.isNetworkError && !navigator.onLine) {
            return false;
          }
        }

        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      // Exponential backoff with jitter for retries
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex + Math.random() * 1000, 30000),
      // Queries stay fresh for 5 seconds
      staleTime: 5000,
      // Refresh when tab focus returns
      refetchOnWindowFocus: true,
      // Refresh when network reconnects
      refetchOnReconnect: true,
    },
    mutations: {
      // Configure retry behavior for mutations
      retry: (failureCount, error) => {
        // Don't retry for user input errors (400 range)
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false;
        }

        // Retry network errors and server errors up to 2 times
        return failureCount < 2;
      },
      // Exponential backoff for mutation retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

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
    <ErrorBoundary>
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
                </Route>
              </Routes>
            </BrowserRouter>
            <Toaster position="top-center" richColors visibleToasts={3} />

            <EasterEggs />
          </ThemeProvider>
        </NuqsAdapter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
