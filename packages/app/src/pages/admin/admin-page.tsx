import { useAuthStore } from "@/lib/auth";
import { AnalyticsPage } from "./analytics-page";

export function AdminPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.email?.startsWith("admin");

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-destructive"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Access Denied
            </h1>
            <p className="text-muted-foreground">
              You are not authorized to access this page. This area is
              restricted to administrators only.
            </p>
          </div>
          <div className="pt-4 border-t">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <AnalyticsPage />
    </div>
  );
}
