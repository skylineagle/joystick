import { useAuthStore } from "@/lib/auth";
import { pb } from "@/lib/pocketbase";
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useInterval } from "usehooks-ts";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { isAuthenticated, token, setIsAuthenticated, setUser, setToken } =
    useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !token || !pb.authStore.isValid) {
      navigate("/login");
    }
  }, [isAuthenticated, token, navigate]);

  useInterval(() => {
    if (isAuthenticated && token) {
      pb.collection("users")
        .authRefresh()
        .then((authData) => {
          if (authData.token !== token) {
            setToken(authData.token);
          }
          setUser(authData.record);
        })
        .catch((error) => {
          console.error("Token refresh failed:", error);
          setIsAuthenticated(false);
          setUser(null);
          setToken(null);
          navigate("/login");
        });
    }
  }, 1000 * 60 * 2);

  if (!isAuthenticated || !token) return null;

  return <>{children}</>;
}
