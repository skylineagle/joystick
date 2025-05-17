import { LoginForm } from "@/components/auth/login-form";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { EasterEggs } from "@/components/easter-eggs";
import { ErrorBoundary } from "@/components/error-boundary";
import { PageTransition } from "@/components/page-transition";
import { ThemeProvider } from "@/components/theme-provider";
import { ApiError } from "@/lib/api-client";
import { pb } from "@/lib/pocketbase";
import { RerouteHome } from "@/pages/reroute-home";
import { TerminalPage } from "@/pages/terminal/terminal-page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "motion/react";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { HashLoader } from "react-spinners";
import { Toaster } from "sonner";
import { Layout } from "./layout";

// Lazy load components
const HomePage = lazy(() =>
  import("@/pages/home/home-page").then((module) => ({
    default: module.HomePage,
  }))
);
const ParamsPage = lazy(() =>
  import("@/pages/params/params-page").then((module) => ({
    default: module.ParamsPage,
  }))
);
const StreamView = lazy(() =>
  import("@/pages/stream-view/stream-view").then((module) => ({
    default: module.StreamView,
  }))
);
const AdminPage = lazy(() =>
  import("@/pages/admin/admin-page").then((module) => ({
    default: module.AdminPage,
  }))
);
const ActionsPage = lazy(() =>
  import("@/pages/actions/actions-page").then((module) => ({
    default: module.ActionsPage,
  }))
);
const SettingsPage = lazy(() =>
  import("@/pages/settings/settings-page").then((module) => ({
    default: module.SettingsPage,
  }))
);
const GalleryPage = lazy(() =>
  import("@/pages/gallery/gallery-page").then((module) => ({
    default: module.default,
  }))
);

// Add DashboardPage to lazy loaded components
const DashboardPage = lazy(() =>
  import("@/pages/dashboard/dashboard-page").then((module) => ({
    default: module.DashboardPage,
  }))
);

// Loading fallback component
const LoadingFallback = () => (
  <motion.div
    className="flex items-center justify-center h-screen"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <motion.div
      animate={{
        scale: [1, 1.1, 1],
        rotate: [0, 5, 0, -5, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <HashLoader color="#000" size={150} />
    </motion.div>
  </motion.div>
);

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
      // Increase stale time to reduce refetches on slow networks
      staleTime: 30000, // 30 seconds
      // Cache time of 10 minutes
      gcTime: 10 * 60 * 1000,
      // Refresh when tab focus returns, but not too aggressively
      refetchOnWindowFocus: "always",
      // Refresh when network reconnects
      refetchOnReconnect: "always",
      // Reduce network load by not refetching on mount if data is stale but not invalidated
      refetchOnMount: false,
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

// AnimatedRoutes component to handle route transitions
function AnimatedRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = pb.authStore.onChange(() => {
      setIsAuthenticated(pb.authStore.isValid);
    }, true);

    return () => {
      try {
        unsubscribe?.();
      } catch {
        // Do nothing
      }
    };
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <PageTransition>
                  <HomePage />
                </PageTransition>
              </Suspense>
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <PageTransition>
              <LoginForm />
            </PageTransition>
          )
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ErrorBoundary>
                <PageTransition>
                  <AdminPage />
                </PageTransition>
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ErrorBoundary>
                <PageTransition>
                  <DashboardPage />
                </PageTransition>
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
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
        <Route index element={<RerouteHome />} />
        <Route
          path="stream"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ErrorBoundary>
                <PageTransition>
                  <StreamView />
                </PageTransition>
              </ErrorBoundary>
            </Suspense>
          }
        />
        <Route
          path="params"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ErrorBoundary>
                <PageTransition>
                  <ParamsPage />
                </PageTransition>
              </ErrorBoundary>
            </Suspense>
          }
        />

        <Route
          path="actions"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ErrorBoundary>
                <PageTransition>
                  <ActionsPage />
                </PageTransition>
              </ErrorBoundary>
            </Suspense>
          }
        />
        <Route
          path="terminal"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <TerminalPage />
            </Suspense>
          }
        />
        <Route
          path="gallery"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <ErrorBoundary>
                <PageTransition>
                  <GalleryPage />
                </PageTransition>
              </ErrorBoundary>
            </Suspense>
          }
        />
      </Route>
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingFallback />}>
              <ErrorBoundary>
                <PageTransition>
                  <SettingsPage />
                </PageTransition>
              </ErrorBoundary>
            </Suspense>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <ThemeProvider
          defaultColorMode="dark"
          defaultDesignTheme="default"
          storageKeyPrefix="vite-ui-theme"
        >
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
          <Toaster position="top-center" richColors visibleToasts={3} />

          <EasterEggs />
        </ThemeProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}

export default App;
