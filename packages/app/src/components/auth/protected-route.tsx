import { useAuthStore } from "@/lib/auth";
import { pb } from "@/lib/pocketbase";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useInterval } from "usehooks-ts";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !pb.authStore.isValid) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useInterval(() => {
    if (isAuthenticated) {
      pb.collection("users").authRefresh();
    }
  }, 1000 * 60 * 2);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
