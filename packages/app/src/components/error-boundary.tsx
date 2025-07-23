import { Button } from "@/components/ui/button";
import { toast } from "@/utils/toast";
import { AlertTriangle, RefreshCw } from "lucide-react";
import React, { useEffect, useState } from "react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ErrorBoundary({ children, fallback }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Create a global error handler for uncaught promise rejections
    const handleGlobalError = (event: ErrorEvent) => {
      console.error("Global error:", event.error);
      setError(event.error);
      setHasError(true);
      toast.error({ message: "An unexpected error occurred" });
      event.preventDefault();
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled promise rejection:", event.reason);
      if (event.reason instanceof Error) {
        setError(event.reason);
        setHasError(true);
        toast.error({
          message: "An unexpected error occurred in background processing",
        });
      }
      event.preventDefault();
    };

    // Handle runtime errors
    window.addEventListener("error", handleGlobalError);
    // Handle promise rejections
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  if (hasError) {
    return (
      fallback || (
        <div className="flex h-screen w-full flex-col items-center justify-center p-4">
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <div className="bg-muted/30 rounded-md p-3 border">
              <p className="text-sm text-muted-foreground font-mono select-text cursor-text">
                {error?.message ||
                  "An unexpected error occurred. The application has recovered, but some data may have been lost."}
              </p>
            </div>
            <Button
              onClick={() => {
                setHasError(false);
                setError(null);
                window.location.reload();
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
          </div>
        </div>
      )
    );
  }

  return (
    <ErrorBoundaryInternal
      fallback={fallback}
      onError={(error) => {
        setError(error);
        setHasError(true);
      }}
    >
      {children}
    </ErrorBoundaryInternal>
  );
}

// Internal class component for error boundary functionality
class ErrorBoundaryInternal extends React.Component<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError: (error: Error) => void;
}> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Error caught by ErrorBoundary:", error);
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }

    return this.props.children;
  }
}
