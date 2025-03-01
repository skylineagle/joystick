import { pb } from "@/lib/pocketbase";
import { UsersResponse } from "@/types/db.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthState {
  isAuthenticated: boolean;
  user: UsersResponse | null;
  token: string | null;
  setUser: (user: UsersResponse | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      setUser: (user) => {
        return set({ user });
      },
      setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    }),
    {
      name: "auth-storage",
    }
  )
);

export async function login(email: string, password: string) {
  try {
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);
    useAuthStore.setState({
      isAuthenticated: true,
      token: authData.token,
      user: authData.record,
    });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to login",
    };
  }
}

export async function logout() {
  pb.authStore.clear();
  useAuthStore.setState({
    isAuthenticated: false,
    user: null,
  });
}
